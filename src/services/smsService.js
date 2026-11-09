// SMS Notification & Consent Service for Peachtree Corners Loan & Pawn
import { STORE_INFO } from '../data/storeInfo';
import { dbService } from './db';

export const smsService = {
  // Send SMS and log to notification history
  sendSms({ to, message, isMarketing = false, customerConsent = false }) {
    if (!to) {
      return { success: false, error: 'Recipient phone number is required' };
    }

    // Guardrail: Promotional SMS must have explicit marketing consent
    if (isMarketing && !customerConsent) {
      console.warn(`Blocked marketing SMS to ${to}: Missing explicit consent`);
      return {
        success: false,
        error: 'Marketing SMS requires explicit, unbundled customer consent.'
      };
    }

    const db = dbService.getSnapshot();
    const notificationRecord = {
      id: 'notif-sms-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type: 'sms',
      category: isMarketing ? 'marketing' : 'transactional',
      recipient: to,
      subject: isMarketing ? 'SMS Promotion' : 'SMS Order Update',
      previewText: message,
      bodyHtml: null,
      status: 'delivered', // simulated live Twilio / carrier gateway
      timestamp: new Date().toISOString()
    };

    db.notificationLogs = [notificationRecord, ...(db.notificationLogs || [])];
    dbService.saveSnapshot(db);

    return {
      success: true,
      notificationId: notificationRecord.id,
      message: `SMS delivered to ${to}`
    };
  },

  // Order Confirmed SMS
  sendOrderConfirmationSms(order) {
    if (!order.customerPhone) return null;
    const msg = `Peachtree Corners Loan & Pawn: Order #${order.orderNumber} confirmed ($${order.total.toFixed(2)}). We are preparing your items. Call ${STORE_INFO.phone.formatted} with any questions.`;
    return this.sendSms({
      to: order.customerPhone,
      message: msg,
      isMarketing: false
    });
  },

  // Ready for Pickup SMS
  sendReadyForPickupSms(order) {
    if (!order.customerPhone) return null;
    const msg = `Peachtree Corners Loan & Pawn: Your order #${order.orderNumber} is READY for in-store pickup at 7040 Jimmy Carter Blvd, Suite 4. Please bring a matching photo ID!`;
    return this.sendSms({
      to: order.customerPhone,
      message: msg,
      isMarketing: false
    });
  },

  // Review Invitation SMS
  sendReviewInvitationSms(order) {
    if (!order.customerPhone) return null;
    const msg = `Peachtree Corners Loan & Pawn: Thank you for shopping with us! When you have a moment, we'd appreciate your honest review: https://pawnshopnorcross.com. Reply STOP to opt out.`;
    return this.sendSms({
      to: order.customerPhone,
      message: msg,
      isMarketing: false
    });
  },

  // Simulate handling incoming carrier keywords (STOP, HELP)
  handleIncomingKeyword(fromPhone, keyword) {
    const cleanKeyword = keyword.trim().toUpperCase();
    const db = dbService.getSnapshot();

    if (cleanKeyword === 'STOP' || cleanKeyword === 'UNSUBSCRIBE') {
      // Find customer or subscriber with this phone and mark opted out
      let updated = false;
      db.customers = (db.customers || []).map(cust => {
        if (cust.phone === fromPhone) {
          cust.marketingPreferences = {
            ...cust.marketingPreferences,
            smsPromotions: false
          };
          updated = true;
        }
        return cust;
      });

      db.subscribers = (db.subscribers || []).map(sub => {
        if (sub.phone === fromPhone) {
          sub.smsConsent = false;
          updated = true;
        }
        return sub;
      });

      dbService.saveSnapshot(db);

      return {
        reply: "Peachtree Corners Loan & Pawn: You have been unsubscribed from promotional SMS. No more promotional texts will be sent. Reply HELP for info.",
        optedOut: true
      };
    }

    if (cleanKeyword === 'HELP') {
      return {
        reply: `Peachtree Corners Loan & Pawn: 7040 Jimmy Carter Blvd Ste 4. Call ${STORE_INFO.phone.formatted} or visit pawnshopnorcross.com. Msg&data rates may apply. Reply STOP to cancel.`,
        optedOut: false
      };
    }

    return {
      reply: `Peachtree Corners Loan & Pawn: For assistance call ${STORE_INFO.phone.formatted}. Reply STOP to unsubscribe.`,
      optedOut: false
    };
  }
};
