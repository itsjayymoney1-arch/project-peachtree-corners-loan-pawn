// Hi-Tech Pawn POS System Integration & Automated Loan Reminder Engine
// Peachtree Corners Loan & Pawn — THE VAULT
import { dbService } from './db.js';
import { emailService } from './emailService.js';
import { smsService } from './smsService.js';
import { STORE_INFO } from '../data/storeInfo.js';

export const DEFAULT_HITECH_SETTINGS = {
  enabled: true,
  provider: 'Hi-Tech Pawn Software (Sybase SQL / ODBC Bridge)',
  softwareVersion: 'v14.8.2 Enterprise',
  bridgeHost: 'pos-station-01.local:4892',
  storeStationId: 'PC-STATION-01',
  apiTokenMasked: 'ht_live_sec_994****************',
  autoSyncIntervalMinutes: 15,
  lastSyncAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  lastSyncStatus: 'success',
  syncChannels: {
    outOfPawnInventory: true,
    omnichannelOrderDeduction: true,
    activePawnTickets: true,
    customerLoanReminders: true
  },
  reminderRules: {
    advance7Days: true,
    advance3Days: true,
    dueToday: true,
    gracePeriodFinalNotice: true,
    gracePeriodWarningDaysBeforeEnd: 5,
    channels: {
      sms: true,
      email: true
    }
  }
};

export const hiTechPawnService = {
  // Retrieve settings
  getSettings() {
    const db = dbService.getSnapshot();
    return db.hiTechSettings || DEFAULT_HITECH_SETTINGS;
  },

  // Update settings
  updateSettings(newSettings, actor) {
    const db = dbService.getSnapshot();
    db.hiTechSettings = {
      ...(db.hiTechSettings || DEFAULT_HITECH_SETTINGS),
      ...newSettings
    };
    dbService.saveSnapshot(db);
    dbService.logAudit({
      action: 'UPDATE_HITECH_SETTINGS',
      category: 'integrations',
      targetId: 'hitech-pawn-pos',
      details: 'Updated Hi-Tech Pawn POS integration settings & reminder rules',
      actor
    });
    return db.hiTechSettings;
  },

  // Get all active pawn tickets
  getActivePawnTickets() {
    const db = dbService.getSnapshot();
    return db.pawnLoans || [];
  },

  // Lookup single ticket by ticket number and optional customer identifier (phone or email)
  lookupTicket(ticketNumber, identifier = '') {
    if (!ticketNumber) return null;
    const db = dbService.getSnapshot();
    const cleanNum = ticketNumber.trim().toUpperCase();
    const cleanIdent = identifier ? identifier.trim().toLowerCase().replace(/[^a-z0-9]/g, '') : '';

    const ticket = (db.pawnLoans || []).find(t => {
      const matchNum = t.ticketNumber.toUpperCase() === cleanNum;
      if (!matchNum) return false;
      if (!cleanIdent) return true;
      const phoneDigits = (t.customerPhone || '').replace(/[^0-9]/g, '');
      const emailLower = (t.customerEmail || '').toLowerCase();
      return phoneDigits.includes(cleanIdent) || emailLower.includes(cleanIdent) || phoneDigits.endsWith(cleanIdent);
    });

    return ticket || null;
  },

  // Determine ticket status based on current date
  calculateTicketStatus(ticket, asOfDate = new Date()) {
    if (ticket.status === 'redeemed' || ticket.status === 'forfeited') {
      return ticket.status;
    }

    const todayMs = asOfDate.getTime();
    const dueMs = new Date(ticket.dueDate).getTime();
    const graceEndMs = new Date(ticket.gracePeriodEndDate).getTime();

    const diffDaysToDue = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24));
    const diffDaysToGraceEnd = Math.ceil((graceEndMs - todayMs) / (1000 * 60 * 60 * 24));

    if (diffDaysToGraceEnd <= 0) {
      return 'forfeited';
    } else if (diffDaysToDue < 0) {
      return 'grace_period';
    } else if (diffDaysToDue === 0) {
      return 'due_today';
    } else if (diffDaysToDue <= 3) {
      return 'due_soon';
    } else {
      return 'active';
    }
  },

  // Process and run daily automated reminder cycle for all active tickets
  runReminderCycle(actor = { name: 'Automated Loan Scheduler', email: 'scheduler@peachtreecorners.pawn', role: 'SYSTEM' }) {
    const db = dbService.getSnapshot();
    const settings = db.hiTechSettings || DEFAULT_HITECH_SETTINGS;
    const today = new Date();
    const loans = db.pawnLoans || [];

    let dispatchedCount = 0;
    const dispatchedDetails = [];

    const updatedLoans = loans.map(loan => {
      if (loan.status === 'redeemed' || loan.status === 'forfeited') {
        return loan;
      }

      const currentStatus = this.calculateTicketStatus(loan, today);
      const dueMs = new Date(loan.dueDate).getTime();
      const graceEndMs = new Date(loan.gracePeriodEndDate).getTime();
      const todayMs = today.getTime();

      const daysUntilDue = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24));
      const daysUntilGraceEnd = Math.ceil((graceEndMs - todayMs) / (1000 * 60 * 60 * 24));

      let reminderType = null;
      let reminderReason = '';

      // Check rules
      if (settings.reminderRules.dueToday && daysUntilDue === 0) {
        reminderType = 'due_today';
        reminderReason = 'Loan is due today';
      } else if (settings.reminderRules.advance3Days && daysUntilDue === 3) {
        reminderType = 'advance_3d';
        reminderReason = 'Loan due in 3 days';
      } else if (settings.reminderRules.advance7Days && daysUntilDue === 7) {
        reminderType = 'advance_7d';
        reminderReason = 'Loan due in 7 days';
      } else if (
        settings.reminderRules.gracePeriodFinalNotice &&
        daysUntilDue < 0 &&
        daysUntilGraceEnd <= (settings.reminderRules.gracePeriodWarningDaysBeforeEnd || 5) &&
        daysUntilGraceEnd > 0
      ) {
        reminderType = 'grace_final_notice';
        reminderReason = `In grace period (${daysUntilGraceEnd} days left before forfeiture)`;
      }

      // Check cooldown: do not send same reminder type on the same day
      const lastSent = loan.lastReminderSent;
      const alreadySentToday = lastSent && 
        new Date(lastSent.date).toDateString() === today.toDateString() &&
        lastSent.reminderType === reminderType;

      if (reminderType && !alreadySentToday) {
        // Dispatch reminders
        const dispatchResult = this.dispatchReminderNotifications({
          ticket: loan,
          reminderType,
          daysUntilDue,
          daysUntilGraceEnd
        });

        if (dispatchResult.smsSent || dispatchResult.emailSent) {
          dispatchedCount++;
          dispatchedDetails.push({
            ticketNumber: loan.ticketNumber,
            customerName: loan.customerName,
            reminderType,
            reminderReason,
            channels: dispatchResult.channels
          });

          const reminderRecord = {
            id: 'rem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            reminderType,
            reminderReason,
            date: today.toISOString(),
            channels: dispatchResult.channels
          };

          return {
            ...loan,
            status: currentStatus,
            lastReminderSent: reminderRecord,
            remindersHistory: [reminderRecord, ...(loan.remindersHistory || [])]
          };
        }
      }

      return {
        ...loan,
        status: currentStatus
      };
    });

    db.pawnLoans = updatedLoans;
    
    // Add to Hi-Tech sync log
    const syncLogEntry = {
      id: 'sync-' + Date.now(),
      type: 'LOAN_REMINDER_CYCLE',
      recordsProcessed: loans.length,
      remindersDispatched: dispatchedCount,
      timestamp: today.toISOString(),
      status: 'completed',
      summary: `Processed ${loans.length} active pawn tickets. Dispatched ${dispatchedCount} reminders.`
    };
    db.pawnSyncLogs = [syncLogEntry, ...(db.pawnSyncLogs || [])];
    dbService.saveSnapshot(db);

    dbService.logAudit({
      action: 'RUN_PAWN_REMINDER_CYCLE',
      category: 'integrations',
      targetId: 'pawn-reminder-engine',
      details: `Dispatched ${dispatchedCount} automated loan reminders (${dispatchedDetails.map(d => `${d.ticketNumber}:${d.reminderType}`).join(', ') || 'None due'})`,
      actor
    });

    return {
      success: true,
      recordsEvaluated: loans.length,
      dispatchedCount,
      dispatchedDetails,
      timestamp: today.toISOString()
    };
  },

  // Dispatch SMS and Email notifications for a reminder
  dispatchReminderNotifications({ ticket, reminderType, daysUntilDue, daysUntilGraceEnd }) {
    let smsSent = false;
    let emailSent = false;
    const channels = [];

    const formattedDueDate = new Date(ticket.dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const formattedGraceDate = new Date(ticket.gracePeriodEndDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const renewalUrl = `https://pawnshopnorcross.com#/pawn-loans?ticket=${ticket.ticketNumber}`;

    // 1. Prepare SMS
    let smsMessage = '';
    if (reminderType === 'due_today') {
      smsMessage = `Peachtree Corners Loan & Pawn: Pawn Ticket #${ticket.ticketNumber} (${ticket.itemDescription}) is DUE TODAY (${formattedDueDate}). Monthly fee to extend 30 days is $${ticket.monthlyInterestFee.toFixed(2)}. Pay online: ${renewalUrl} or call ${STORE_INFO.phone.formatted}. Reply STOP to opt out.`;
    } else if (reminderType === 'advance_3d') {
      smsMessage = `Peachtree Corners Loan & Pawn: Friendly reminder that Pawn Ticket #${ticket.ticketNumber} is due in 3 days on ${formattedDueDate}. Pay $${ticket.monthlyInterestFee.toFixed(2)} monthly fee to extend without penalty: ${renewalUrl}. Reply STOP to opt out.`;
    } else if (reminderType === 'advance_7d') {
      smsMessage = `Peachtree Corners Loan & Pawn: Your pawn loan #${ticket.ticketNumber} matures on ${formattedDueDate}. Monthly renewal fee is $${ticket.monthlyInterestFee.toFixed(2)}. Review status & payment options: ${renewalUrl}. Reply STOP to opt out.`;
    } else if (reminderType === 'grace_final_notice') {
      smsMessage = `FINAL NOTICE - Peachtree Corners Loan & Pawn: Ticket #${ticket.ticketNumber} (${ticket.itemDescription}) is past due. Grace period ends on ${formattedGraceDate} (${daysUntilGraceEnd} days left). Settle now to retain your collateral: ${renewalUrl} or call ${STORE_INFO.phone.formatted}.`;
    } else {
      smsMessage = `Peachtree Corners Loan & Pawn: Update on Pawn Ticket #${ticket.ticketNumber}. Balance due: $${ticket.monthlyInterestFee.toFixed(2)}. Check status online: ${renewalUrl}. Call ${STORE_INFO.phone.formatted} with any questions.`;
    }

    if (ticket.customerPhone) {
      const smsRes = smsService.sendSms({
        to: ticket.customerPhone,
        message: smsMessage,
        isMarketing: false
      });
      if (smsRes.success) {
        smsSent = true;
        channels.push('sms');
      }
    }

    // 2. Prepare Luxury Email
    let emailSubject = '';
    let emailHeading = '';
    let emailAlertBox = '';

    if (reminderType === 'due_today') {
      emailSubject = `DUE TODAY: Pawn Ticket #${ticket.ticketNumber} | Peachtree Corners Loan & Pawn`;
      emailHeading = `Your Pawn Loan is Due Today`;
      emailAlertBox = `
        <div style="background-color: rgba(220, 38, 38, 0.15); border-left: 3px solid #EF4444; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #FCA5A5;">
          <strong>Due Date Alert:</strong> Your pawn transaction matures today, <strong>${formattedDueDate}</strong>.<br>
          To maintain your loan in good standing and prevent entering the grace period, please submit your monthly extension fee of <strong>$${ticket.monthlyInterestFee.toFixed(2)}</strong>.
        </div>
      `;
    } else if (reminderType === 'grace_final_notice') {
      emailSubject = `URGENT FINAL NOTICE: Pawn Ticket #${ticket.ticketNumber} Grace Period Expiration`;
      emailHeading = `Collateral Forfeiture Warning`;
      emailAlertBox = `
        <div style="background-color: rgba(220, 38, 38, 0.25); border-left: 4px solid #EF4444; padding: 18px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #FECACA;">
          <strong style="color: #F87171; font-size: 14px;">URGENT NOTICE OF IMPENDING FORFEITURE:</strong><br>
          Your pawn loan for <strong>${ticket.itemDescription}</strong> is currently past due and in its statutory grace period.<br>
          Final Grace Period Expiration Date: <strong>${formattedGraceDate}</strong> (${daysUntilGraceEnd} days remaining).<br>
          Under Georgia law, unredeemed merchandise becomes property of the pawnbroker after the grace period expires.
        </div>
      `;
    } else {
      emailSubject = `Upcoming Due Date: Pawn Ticket #${ticket.ticketNumber} | Peachtree Corners Loan & Pawn`;
      emailHeading = `Pawn Loan Due Date Reminder`;
      emailAlertBox = `
        <div class="gold-box">
          <strong>Upcoming Maturity Date:</strong> ${formattedDueDate}<br>
          Monthly Extension Fee: <strong>$${ticket.monthlyInterestFee.toFixed(2)}</strong><br>
          Pay your monthly fee online to extend your loan for another 30 calendar days.
        </div>
      `;
    }

    const emailContent = `
      <h2 style="font-size: 22px; color: #F6F2E9; margin-top: 0;">${emailHeading}</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #A7A7A7;">
        Dear ${ticket.customerName || 'Valued Client'},<br>
        This is an official confidential notice regarding your collateral pawn agreement with Peachtree Corners Loan &amp; Pawn.
      </p>
      ${emailAlertBox}
      <table class="meta-table">
        <thead>
          <tr>
            <th>Ticket Details</th>
            <th style="text-align: right;">Information</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pawn Ticket Number</td>
            <td style="text-align: right; font-weight: bold; color: #C5A15A;">${ticket.ticketNumber}</td>
          </tr>
          <tr>
            <td>Collateral Merchandise</td>
            <td style="text-align: right; color: #F6F2E9;">${ticket.itemDescription}</td>
          </tr>
          <tr>
            <td>Original Loan Principal</td>
            <td style="text-align: right;">$${ticket.principalAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Monthly Pawn Extension Fee</td>
            <td style="text-align: right; font-weight: bold; color: #C5A15A;">$${ticket.monthlyInterestFee.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Total Full Redemption Balance</td>
            <td style="text-align: right;">$${(ticket.principalAmount + ticket.monthlyInterestFee).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Loan Due Date</td>
            <td style="text-align: right; color: #F6F2E9;">${formattedDueDate}</td>
          </tr>
          <tr>
            <td>Statutory Grace Period End</td>
            <td style="text-align: right; color: #A7A7A7;">${formattedGraceDate}</td>
          </tr>
        </tbody>
      </table>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${renewalUrl}" class="btn" style="margin-right: 12px;">Extend Loan Online ($${ticket.monthlyInterestFee.toFixed(2)})</a>
      </div>
      <p style="font-size: 12px; color: #888888; line-height: 1.6;">
        <strong>Need to Redeem in Full &amp; Retrieve Your Item?</strong><br>
        Physical merchandise is securely stored in our vault and must be retrieved in person with valid government photo ID matching ticket records. Please visit our store at 7040 Jimmy Carter Blvd, Suite 4, Peachtree Corners, GA or call ${STORE_INFO.phone.formatted}.
      </p>
    `;

    if (ticket.customerEmail) {
      const emailRes = emailService.sendEmail({
        to: ticket.customerEmail,
        subject: emailSubject,
        previewText: `Pawn Ticket #${ticket.ticketNumber} notice: Due date ${formattedDueDate}.`,
        contentHtml: emailContent,
        category: 'pawn_reminder'
      });
      if (emailRes.success) {
        emailSent = true;
        channels.push('email');
      }
    }

    return {
      smsSent,
      emailSent,
      channels
    };
  },

  // Send single on-demand reminder for a specific ticket
  sendSingleReminder(ticketId, channel = 'both', actor) {
    const db = dbService.getSnapshot();
    const ticketIndex = (db.pawnLoans || []).findIndex(t => t.id === ticketId || t.ticketNumber === ticketId);
    if (ticketIndex === -1) {
      throw new Error(`Pawn ticket ${ticketId} not found`);
    }

    const ticket = db.pawnLoans[ticketIndex];
    const today = new Date();
    const currentStatus = this.calculateTicketStatus(ticket, today);

    const dueMs = new Date(ticket.dueDate).getTime();
    const graceEndMs = new Date(ticket.gracePeriodEndDate).getTime();
    const todayMs = today.getTime();

    const daysUntilDue = Math.ceil((dueMs - todayMs) / (1000 * 60 * 60 * 24));
    const daysUntilGraceEnd = Math.ceil((graceEndMs - todayMs) / (1000 * 60 * 60 * 24));

    let reminderType = 'manual_reminder';
    if (currentStatus === 'due_today') reminderType = 'due_today';
    else if (currentStatus === 'grace_period') reminderType = 'grace_final_notice';
    else if (currentStatus === 'due_soon') reminderType = 'advance_3d';

    const dispatchResult = this.dispatchReminderNotifications({
      ticket,
      reminderType,
      daysUntilDue,
      daysUntilGraceEnd
    });

    const reminderRecord = {
      id: 'rem-' + Date.now(),
      reminderType,
      reminderReason: 'Manual Staff Triggered Reminder',
      date: today.toISOString(),
      channels: dispatchResult.channels
    };

    db.pawnLoans[ticketIndex] = {
      ...ticket,
      status: currentStatus,
      lastReminderSent: reminderRecord,
      remindersHistory: [reminderRecord, ...(ticket.remindersHistory || [])]
    };

    dbService.saveSnapshot(db);
    dbService.logAudit({
      action: 'SEND_MANUAL_PAWN_REMINDER',
      category: 'pawn_loans',
      targetId: ticket.ticketNumber,
      details: `Staff triggered reminder to ${ticket.customerName} via ${dispatchResult.channels.join(', ')}`,
      actor
    });

    return {
      success: true,
      ticket: db.pawnLoans[ticketIndex],
      channels: dispatchResult.channels
    };
  },

  // Extend a pawn loan by paying the monthly fee (Advances due date +30 days)
  extendPawnLoan({ ticketId, paidAmount, paymentMethod = 'card_online', paymentTransactionId = '', actor }) {
    const db = dbService.getSnapshot();
    const ticketIndex = (db.pawnLoans || []).findIndex(t => t.id === ticketId || t.ticketNumber === ticketId);
    if (ticketIndex === -1) {
      throw new Error(`Pawn ticket ${ticketId} not found`);
    }

    const ticket = db.pawnLoans[ticketIndex];
    const oldDueDate = new Date(ticket.dueDate);
    
    // Add 30 days to due date and grace period end date
    const newDueDate = new Date(oldDueDate);
    newDueDate.setDate(newDueDate.getDate() + 30);

    const newGracePeriodDate = new Date(newDueDate);
    newGracePeriodDate.setDate(newGracePeriodDate.getDate() + 30);

    const paymentAmount = paidAmount || ticket.monthlyInterestFee;
    const paymentRecord = {
      id: 'pawn-pay-' + Date.now(),
      ticketNumber: ticket.ticketNumber,
      customerName: ticket.customerName,
      customerPhone: ticket.customerPhone,
      amount: paymentAmount,
      type: 'monthly_extension_fee',
      paymentMethod,
      transactionId: paymentTransactionId || `TXN-HT-${Date.now()}`,
      oldDueDate: ticket.dueDate,
      newDueDate: newDueDate.toISOString(),
      timestamp: new Date().toISOString(),
      syncedToHiTech: true
    };

    const updatedTicket = {
      ...ticket,
      dueDate: newDueDate.toISOString(),
      gracePeriodEndDate: newGracePeriodDate.toISOString(),
      renewalCount: (ticket.renewalCount || 0) + 1,
      status: 'active',
      lastPayment: paymentRecord,
      paymentHistory: [paymentRecord, ...(ticket.paymentHistory || [])]
    };

    db.pawnLoans[ticketIndex] = updatedTicket;
    db.pawnPayments = [paymentRecord, ...(db.pawnPayments || [])];

    // Log to Hi-Tech sync log (simulating bi-directional POS push)
    const syncLogEntry = {
      id: 'sync-pay-' + Date.now(),
      type: 'POS_PAYMENT_SYNC',
      ticketNumber: ticket.ticketNumber,
      amount: paymentAmount,
      timestamp: new Date().toISOString(),
      status: 'synced_to_hitech',
      summary: `Ticket #${ticket.ticketNumber} extended 30 days to ${newDueDate.toLocaleDateString()}. POS receipt logged.`
    };
    db.pawnSyncLogs = [syncLogEntry, ...(db.pawnSyncLogs || [])];

    dbService.saveSnapshot(db);

    // Send confirmation SMS & Email
    const formattedNewDue = newDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (ticket.customerPhone) {
      smsService.sendSms({
        to: ticket.customerPhone,
        message: `Peachtree Corners Loan & Pawn: Thank you! $${paymentAmount.toFixed(2)} extension fee for Ticket #${ticket.ticketNumber} received. Your new due date is ${formattedNewDue}. Questions? Call ${STORE_INFO.phone.formatted}.`,
        isMarketing: false
      });
    }

    if (ticket.customerEmail) {
      emailService.sendEmail({
        to: ticket.customerEmail,
        subject: `Pawn Loan Extended: Ticket #${ticket.ticketNumber} | Peachtree Corners Loan & Pawn`,
        previewText: `Payment of $${paymentAmount.toFixed(2)} received. New due date: ${formattedNewDue}.`,
        contentHtml: `
          <h2 style="font-size: 22px; color: #C5A15A; margin-top: 0;">Loan Extension Confirmed</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #A7A7A7;">
            Dear ${ticket.customerName || 'Valued Client'},<br>
            We have successfully received and processed your monthly pawn extension fee. Your collateral remains securely protected in our vault.
          </p>
          <div class="gold-box">
            <strong>Payment Summary:</strong><br>
            Pawn Ticket Number: <strong>${ticket.ticketNumber}</strong><br>
            Collateral Item: <strong>${ticket.itemDescription}</strong><br>
            Extension Fee Paid: <strong>$${paymentAmount.toFixed(2)}</strong><br>
            Payment Transaction: <strong>${paymentRecord.transactionId}</strong><br>
            <span style="color: #C5A15A; font-weight: bold;">New Maturity Due Date: ${formattedNewDue}</span>
          </div>
          <p style="font-size: 12px; color: #888888;">
            Thank you for keeping your account current. To redeem your item in full and pick it up from our showroom vault, please visit us during regular hours.
          </p>
        `,
        category: 'pawn_receipt'
      });
    }

    dbService.logAudit({
      action: 'PAWN_LOAN_EXTENDED',
      category: 'pawn_loans',
      targetId: ticket.ticketNumber,
      details: `Received $${paymentAmount.toFixed(2)} monthly extension fee. Extended due date to ${formattedNewDue}.`,
      actor: actor || { name: ticket.customerName, email: ticket.customerEmail || 'online-portal', role: 'CUSTOMER' }
    });

    return {
      success: true,
      ticket: updatedTicket,
      payment: paymentRecord
    };
  },

  // Perform full two-way sync with Hi-Tech Pawn POS
  syncWithHiTechPos(actor = { name: 'Store Staff', email: 'owner@pawnshopnorcross.com', role: 'OWNER' }) {
    const db = dbService.getSnapshot();
    const now = new Date().toISOString();

    // 1. Ingest any out-of-pawn forfeited merchandise that cleared police holds
    // For demonstration, verify inventory counts and sync timestamps
    const activeLoans = db.pawnLoans || [];
    const updatedLoans = activeLoans.map(loan => ({
      ...loan,
      status: this.calculateTicketStatus(loan, new Date())
    }));
    db.pawnLoans = updatedLoans;

    // 2. Update settings timestamp
    const settings = db.hiTechSettings || DEFAULT_HITECH_SETTINGS;
    settings.lastSyncAt = now;
    settings.lastSyncStatus = 'success';
    db.hiTechSettings = settings;

    // 3. Add to sync logs
    const syncLogEntry = {
      id: 'sync-twoway-' + Date.now(),
      type: 'TWO_WAY_POS_SYNC',
      recordsProcessed: (db.products?.length || 0) + activeLoans.length,
      timestamp: now,
      status: 'success',
      summary: `Synchronized ${activeLoans.length} active pawn tickets and ${db.products?.length || 0} inventory items with Hi-Tech POS (Station ${settings.storeStationId}). Omnichannel sales locks active.`
    };
    db.pawnSyncLogs = [syncLogEntry, ...(db.pawnSyncLogs || [])];

    dbService.saveSnapshot(db);
    dbService.logAudit({
      action: 'HITECH_POS_TWO_WAY_SYNC',
      category: 'integrations',
      targetId: settings.storeStationId,
      details: `Manual two-way sync completed with Hi-Tech Pawn POS. ${activeLoans.length} loans updated.`,
      actor
    });

    return {
      success: true,
      syncTime: now,
      activeLoansCount: activeLoans.length,
      inventoryCount: db.products?.length || 0,
      logEntry: syncLogEntry
    };
  }
};
