import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import { 
  Landmark, 
  RefreshCw, 
  Calendar, 
  Send, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Settings, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink,
  ChevronRight,
  FileText,
  Lock,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

export default function HiTechPawnAdminTab() {
  const { 
    pawnLoans = [], 
    hiTechSettings, 
    pawnSyncLogs = [],
    pawnPayments = [],
    runPawnReminderCycle, 
    sendSinglePawnReminder, 
    extendPawnLoan, 
    syncHiTechPos, 
    updateHiTechSettings,
    currentAdmin
  } = useApp();

  // Local state for search & filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessingReminders, setIsProcessingReminders] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modals
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedTicketForReminder, setSelectedTicketForReminder] = useState(null);
  const [reminderChannel, setReminderChannel] = useState('both');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedTicketForPayment, setSelectedTicketForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('in_store_counter');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [syncFreq, setSyncFreq] = useState(hiTechSettings?.autoSyncIntervalMinutes || 15);
  const [adv7, setAdv7] = useState(hiTechSettings?.reminderRules?.advance7Days ?? true);
  const [adv3, setAdv3] = useState(hiTechSettings?.reminderRules?.advance3Days ?? true);
  const [dueTodayRule, setDueTodayRule] = useState(hiTechSettings?.reminderRules?.dueToday ?? true);
  const [graceNoticeRule, setGraceNoticeRule] = useState(hiTechSettings?.reminderRules?.gracePeriodFinalNotice ?? true);

  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    itemDescription: '',
    category: 'jewelry',
    serialNumber: '',
    principalAmount: '',
    monthlyInterestFee: ''
  });

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Trigger manual two-way sync
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await new Promise(r => setTimeout(r, 800)); // realistic bridge delay
      const res = syncHiTechPos();
      showToast(`Two-way sync complete: ${res.activeLoansCount} pawn tickets & ${res.inventoryCount} catalog items reconciled with Hi-Tech POS.`);
    } catch (e) {
      showToast('Sync error: ' + e.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Trigger automated reminder cycle
  const handleRunReminderCycle = async () => {
    setIsProcessingReminders(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      const res = runPawnReminderCycle();
      if (res.dispatchedCount > 0) {
        showToast(`Automated reminder cycle complete! Dispatched ${res.dispatchedCount} reminders via SMS & Email.`);
      } else {
        showToast(`Evaluated ${res.recordsEvaluated} pawn tickets. All accounts current or within notification cooldown.`);
      }
    } catch (e) {
      showToast('Failed to run reminder cycle: ' + e.message, 'error');
    } finally {
      setIsProcessingReminders(false);
    }
  };

  // Send single on-demand reminder
  const handleConfirmSendReminder = async () => {
    if (!selectedTicketForReminder) return;
    try {
      const res = sendSinglePawnReminder(selectedTicketForReminder.id, reminderChannel);
      showToast(`Reminder delivered to ${selectedTicketForReminder.customerName} via ${res.channels.join(' and ')}.`);
      setReminderModalOpen(false);
    } catch (e) {
      showToast('Failed to send reminder: ' + e.message, 'error');
    }
  };

  // Submit loan extension payment
  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!selectedTicketForPayment) return;
    setIsSubmittingPayment(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      const res = await extendPawnLoan({
        ticketId: selectedTicketForPayment.id,
        paidAmount: selectedTicketForPayment.monthlyInterestFee,
        paymentMethod,
        paymentTransactionId: `POS-PAY-${Date.now()}`
      });
      showToast(`Payment of $${selectedTicketForPayment.monthlyInterestFee.toFixed(2)} recorded! Ticket #${selectedTicketForPayment.ticketNumber} extended 30 days.`);
      setPaymentModalOpen(false);
    } catch (e) {
      showToast('Payment processing error: ' + e.message, 'error');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Save settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateHiTechSettings({
      autoSyncIntervalMinutes: parseInt(syncFreq, 10),
      reminderRules: {
        advance7Days: adv7,
        advance3Days: adv3,
        dueToday: dueTodayRule,
        gracePeriodFinalNotice: graceNoticeRule,
        gracePeriodWarningDaysBeforeEnd: 5,
        channels: { sms: true, email: true }
      }
    });
    setSettingsModalOpen(false);
    showToast('Hi-Tech Pawn integration settings updated successfully.');
  };

  // Filtered pawn loans
  const filteredLoans = useMemo(() => {
    return pawnLoans.filter(loan => {
      const matchesSearch = 
        loan.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (loan.customerPhone && loan.customerPhone.includes(searchTerm)) ||
        loan.itemDescription.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'DUE_TODAY') return loan.status === 'due_today';
      if (statusFilter === 'DUE_SOON') return loan.status === 'due_soon';
      if (statusFilter === 'GRACE_PERIOD') return loan.status === 'grace_period';
      if (statusFilter === 'ACTIVE') return loan.status === 'active' || loan.status === 'due_soon';
      if (statusFilter === 'EXTENDED') return loan.renewalCount > 0;
      return true;
    });
  }, [pawnLoans, searchTerm, statusFilter]);

  // Metric stats
  const metrics = useMemo(() => {
    const totalPrincipal = pawnLoans.reduce((sum, l) => sum + (l.principalAmount || 0), 0);
    const totalMonthlyFees = pawnLoans.reduce((sum, l) => sum + (l.monthlyInterestFee || 0), 0);
    const dueTodayCount = pawnLoans.filter(l => l.status === 'due_today').length;
    const gracePeriodCount = pawnLoans.filter(l => l.status === 'grace_period').length;
    const dueSoonCount = pawnLoans.filter(l => l.status === 'due_soon').length;

    return {
      totalPrincipal,
      totalMonthlyFees,
      dueTodayCount,
      gracePeriodCount,
      dueSoonCount,
      totalCount: pawnLoans.length
    };
  }, [pawnLoans]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`p-4 rounded-sm border text-xs flex items-center justify-between shadow-lg animate-fadeIn ${
          toastMessage.type === 'error'
            ? 'bg-rose-950/80 border-rose-700/60 text-rose-200'
            : 'bg-emerald-950/80 border-emerald-700/60 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {toastMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span className="font-medium">{toastMessage.msg}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-luxury-muted hover:text-luxury-ivory font-bold ml-4">✕</button>
        </div>
      )}

      {/* 1. HI-TECH INTEGRATION STATUS BAR */}
      <div className="bg-luxury-darkCard border border-luxury-gold/40 rounded-sm p-5 shadow-gold-glow">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-editorial text-lg font-bold text-luxury-ivory">
                  Hi-Tech Pawn Software &reg; Integration Hub
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Bridge Connected (v14.8.2)
                </span>
                <span className="text-[11px] text-luxury-muted font-mono bg-luxury-charcoal px-2 py-0.5 rounded border border-luxury-borderSubtle">
                  Station: {hiTechSettings?.storeStationId || 'PC-STATION-01'}
                </span>
              </div>
              <p className="text-xs text-luxury-muted mt-0.5">
                Two-way live synchronization: POS counter register sales, out-of-pawn retail inventory import, and collateral pawn loans.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3.5 py-2 bg-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-black text-luxury-gold border border-luxury-gold/50 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
              title="Reconcile inventory and pawn tickets with Hi-Tech POS"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync POS Now'}</span>
            </button>

            <button
              onClick={handleRunReminderCycle}
              disabled={isProcessingReminders}
              className="px-4 py-2 bg-gradient-to-r from-luxury-gold to-luxury-goldLight text-luxury-black rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-gold-glow hover:brightness-110"
              title="Run automated due date & grace period reminder engine"
            >
              <Send className={`w-3.5 h-3.5 ${isProcessingReminders ? 'animate-pulse' : ''}`} />
              <span>{isProcessingReminders ? 'Running Cycle...' : 'Run Reminder Cycle'}</span>
            </button>

            <button
              onClick={() => setSettingsModalOpen(true)}
              className="p-2 bg-luxury-charcoal hover:bg-luxury-surface text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle rounded-sm transition-all"
              title="Integration Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sync Info Sub-bar */}
        <div className="mt-4 pt-3 border-t border-luxury-borderSubtle flex flex-wrap items-center justify-between gap-3 text-[11px] text-luxury-muted">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              Host Bridge: <strong className="text-luxury-ivory font-mono">{hiTechSettings?.bridgeHost || 'pos-station-01.local:4892'}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Auto-Sync: <strong className="text-luxury-gold">Active Every {hiTechSettings?.autoSyncIntervalMinutes || 15} Mins</strong>
            </span>
            <span>&bull;</span>
            <span>
              Last Sync: <span className="text-luxury-ivory">{new Date(hiTechSettings?.lastSyncAt || Date.now()).toLocaleTimeString()}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Omnichannel Stock Locking Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-luxury-darkCard border border-luxury-borderSubtle p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-luxury-muted text-[11px] uppercase tracking-wider font-semibold">
            <span>Active Pawn Loans</span>
            <Landmark className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="text-2xl font-editorial font-bold text-luxury-ivory">
            {metrics.totalCount} <span className="text-xs text-luxury-muted font-normal font-sans">pledged</span>
          </div>
          <p className="text-[11px] text-luxury-muted">
            Tracked in Hi-Tech master ledger
          </p>
        </div>

        <div className="bg-luxury-darkCard border border-luxury-borderSubtle p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-luxury-muted text-[11px] uppercase tracking-wider font-semibold">
            <span>Total Collateral Value</span>
            <DollarSign className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="text-2xl font-editorial font-bold text-luxury-gold">
            ${metrics.totalPrincipal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-luxury-muted">
            Active loan principal in store vault
          </p>
        </div>

        <div className="bg-luxury-darkCard border border-luxury-borderSubtle p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-luxury-muted text-[11px] uppercase tracking-wider font-semibold">
            <span>Monthly Pawn Fees</span>
            <Sparkles className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="text-2xl font-editorial font-bold text-luxury-ivory">
            ${metrics.totalMonthlyFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className="text-xs text-luxury-muted font-normal font-sans"> /mo</span>
          </div>
          <p className="text-[11px] text-luxury-muted">
            Recurring monthly extension revenue
          </p>
        </div>

        <div className="bg-luxury-darkCard border border-luxury-borderSubtle p-4 rounded-sm space-y-1">
          <div className="flex items-center justify-between text-luxury-muted text-[11px] uppercase tracking-wider font-semibold">
            <span>Action Required</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-editorial font-bold text-rose-400">
            {metrics.dueTodayCount + metrics.gracePeriodCount} <span className="text-xs text-luxury-muted font-normal font-sans">tickets</span>
          </div>
          <p className="text-[11px] text-rose-300">
            {metrics.dueTodayCount} due today, {metrics.gracePeriodCount} in grace period
          </p>
        </div>
      </div>

      {/* 3. AUTOMATED REMINDER POLICY SUMMARY */}
      <div className="bg-luxury-charcoal/80 border border-luxury-borderSubtle rounded-sm p-4 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-luxury-gold" />
            <h4 className="font-semibold text-luxury-ivory uppercase tracking-wider text-[11px]">
              Automated Due Date Reminder Engine Rules
            </h4>
          </div>
          <span className="text-[11px] text-luxury-gold">
            Georgia Pawnbroker Compliance &bull; TCPA Opt-In Enforced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
          <div className="p-2.5 rounded bg-luxury-darkCard border border-luxury-borderSubtle flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-luxury-gold/20 text-luxury-gold flex items-center justify-center font-bold shrink-0 text-[10px]">
              7d
            </span>
            <div>
              <strong className="text-luxury-ivory block">7-Day Advance Notice</strong>
              <span className="text-luxury-muted">Gentle notice of upcoming maturity date via SMS &amp; Email.</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-luxury-darkCard border border-luxury-borderSubtle flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 text-[10px]">
              3d
            </span>
            <div>
              <strong className="text-luxury-ivory block">3-Day Alert</strong>
              <span className="text-luxury-muted">Direct link to extend loan 30 days online or in store.</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-luxury-darkCard border border-luxury-borderSubtle flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0 text-[10px]">
              0d
            </span>
            <div>
              <strong className="text-luxury-ivory block">Due Today (Day 0)</strong>
              <span className="text-luxury-muted">Urgent reminder with payment link to keep account current.</span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-luxury-darkCard border border-luxury-borderSubtle flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-red-900/50 text-red-300 flex items-center justify-center font-bold shrink-0 text-[10px]">
              5d
            </span>
            <div>
              <strong className="text-luxury-ivory block">Grace Period Final Notice</strong>
              <span className="text-luxury-muted">Statutory warning before forfeiture into retail inventory.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE PAWN TICKETS TABLE */}
      <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-4 border-b border-luxury-borderSubtle flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-editorial text-lg font-semibold text-luxury-ivory">
              Active Pawn Tickets ({filteredLoans.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-luxury-muted" />
              <input
                type="text"
                placeholder="Search ticket #, name, item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm text-xs text-luxury-ivory placeholder-luxury-muted outline-none focus:border-luxury-gold w-48 sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-2 bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm text-xs text-luxury-ivory outline-none focus:border-luxury-gold"
            >
              <option value="ALL">All Statuses</option>
              <option value="DUE_TODAY">Due Today</option>
              <option value="DUE_SOON">Due Soon (≤ 3 Days)</option>
              <option value="GRACE_PERIOD">In Grace Period</option>
              <option value="ACTIVE">Current / Active</option>
              <option value="EXTENDED">Renewed / Extended</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-luxury-charcoal/80 text-luxury-muted uppercase font-semibold text-[10px] tracking-wider border-b border-luxury-borderSubtle">
              <tr>
                <th className="py-3 px-4">Ticket #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Collateral Merchandise</th>
                <th className="py-3 px-4 text-right">Principal</th>
                <th className="py-3 px-4 text-right">Monthly Fee</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Reminder</th>
                <th className="py-3 px-4 text-right">Staff Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-borderSubtle/60">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-luxury-muted">
                    No active pawn tickets match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLoans.map(ticket => {
                  const dueDateObj = new Date(ticket.dueDate);
                  const formattedDue = dueDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  
                  // Calculate badge styling
                  let statusBadge = null;
                  if (ticket.status === 'due_today') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        DUE TODAY
                      </span>
                    );
                  } else if (ticket.status === 'grace_period') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-700">
                        GRACE PERIOD
                      </span>
                    );
                  } else if (ticket.status === 'due_soon') {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        DUE SOON
                      </span>
                    );
                  } else if (ticket.renewalCount > 0) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        EXTENDED ({ticket.renewalCount}x)
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-luxury-charcoal text-luxury-muted border border-luxury-borderSubtle">
                        ACTIVE
                      </span>
                    );
                  }

                  return (
                    <tr key={ticket.id} className="hover:bg-luxury-surface/30 transition-colors">
                      {/* Ticket # */}
                      <td className="py-3 px-4 font-mono font-bold text-luxury-gold">
                        {ticket.ticketNumber}
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <strong className="text-luxury-ivory block font-medium">
                          {ticket.customerName}
                        </strong>
                        <span className="text-[11px] text-luxury-muted block font-mono">
                          {ticket.customerPhone}
                        </span>
                      </td>

                      {/* Merchandise */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-luxury-ivory truncate" title={ticket.itemDescription}>
                          {ticket.itemDescription}
                        </div>
                        {ticket.serialNumber && (
                          <span className="text-[10px] text-luxury-muted font-mono">
                            SN: {ticket.serialNumber}
                          </span>
                        )}
                      </td>

                      {/* Principal */}
                      <td className="py-3 px-4 text-right font-mono text-luxury-ivory">
                        ${ticket.principalAmount.toFixed(2)}
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-luxury-gold">
                        ${ticket.monthlyInterestFee.toFixed(2)}
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4">
                        <span className="text-luxury-ivory block">{formattedDue}</span>
                        <span className="text-[10px] text-luxury-muted block">
                          Grace until {new Date(ticket.gracePeriodEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {statusBadge}
                      </td>

                      {/* Last Reminder */}
                      <td className="py-3 px-4 text-[11px]">
                        {ticket.lastReminderSent ? (
                          <div>
                            <span className="text-luxury-goldLight font-medium block uppercase text-[10px]">
                              {ticket.lastReminderSent.channels?.join(' & ') || 'Sent'}
                            </span>
                            <span className="text-luxury-muted text-[10px]">
                              {new Date(ticket.lastReminderSent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-luxury-muted italic">None yet</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send Reminder button */}
                          <button
                            onClick={() => {
                              setSelectedTicketForReminder(ticket);
                              setReminderModalOpen(true);
                            }}
                            className="p-1.5 rounded bg-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-black text-luxury-gold border border-luxury-gold/40 transition-all"
                            title="Send SMS / Email Reminder"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {/* Record Extension Fee */}
                          <button
                            onClick={() => {
                              setSelectedTicketForPayment(ticket);
                              setPaymentModalOpen(true);
                            }}
                            className="p-1.5 rounded bg-emerald-950/60 hover:bg-emerald-600 hover:text-white text-emerald-300 border border-emerald-600/50 transition-all font-semibold text-[10px] px-2 flex items-center gap-1"
                            title="Record Monthly Extension Fee (+30 Days)"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Extend</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. HI-TECH TWO-WAY SYNC AUDIT LOG */}
      <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-luxury-gold" />
            <h4 className="font-editorial text-base font-semibold text-luxury-ivory">
              Hi-Tech POS Synchronization Event Log
            </h4>
          </div>
          <span className="text-[11px] text-luxury-muted font-mono">
            {pawnSyncLogs.length} events logged
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {pawnSyncLogs.length === 0 ? (
            <p className="text-xs text-luxury-muted italic py-2">No sync events recorded yet.</p>
          ) : (
            pawnSyncLogs.map(log => (
              <div key={log.id} className="p-2.5 rounded bg-luxury-charcoal/70 border border-luxury-borderSubtle text-xs flex items-start justify-between gap-3 font-mono">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-luxury-gold/20 text-luxury-gold">
                      {log.type}
                    </span>
                    <span className="text-luxury-ivory text-[11px] font-sans font-medium">
                      {log.summary}
                    </span>
                  </div>
                  {log.ticketNumber && (
                    <span className="text-[10px] text-luxury-muted">
                      Target: Ticket #{log.ticketNumber} &bull; Amount: ${log.amount?.toFixed(2)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-luxury-muted shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: SEND ON-DEMAND REMINDER */}
      {/* ======================================================== */}
      {reminderModalOpen && selectedTicketForReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-luxury-darkCard border border-luxury-gold/50 rounded-sm max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-luxury-borderSubtle pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-luxury-gold" />
                <h3 className="font-editorial text-lg font-bold text-luxury-ivory">
                  Send Pawn Due Date Reminder
                </h3>
              </div>
              <button
                onClick={() => setReminderModalOpen(false)}
                className="text-luxury-muted hover:text-luxury-ivory text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded bg-luxury-charcoal/80 border border-luxury-borderSubtle space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-luxury-muted">Ticket Number:</span>
                <strong className="text-luxury-gold font-mono">{selectedTicketForReminder.ticketNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Client:</span>
                <span className="text-luxury-ivory">{selectedTicketForReminder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Phone:</span>
                <span className="text-luxury-ivory font-mono">{selectedTicketForReminder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Email:</span>
                <span className="text-luxury-ivory">{selectedTicketForReminder.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Collateral:</span>
                <span className="text-luxury-ivory">{selectedTicketForReminder.itemDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Due Date:</span>
                <span className="text-rose-300 font-semibold">
                  {new Date(selectedTicketForReminder.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between border-t border-luxury-borderSubtle/60 pt-1 mt-1">
                <span className="text-luxury-muted">Monthly Extension Fee:</span>
                <strong className="text-luxury-gold font-mono">${selectedTicketForReminder.monthlyInterestFee.toFixed(2)}</strong>
              </div>
            </div>

            {/* Notification Channel Picker */}
            <div className="space-y-2 text-xs">
              <label className="block text-[11px] uppercase tracking-wider text-luxury-muted font-semibold">
                Dispatch Notification Channels:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReminderChannel('both')}
                  className={`p-2.5 rounded border text-center font-medium transition-all ${
                    reminderChannel === 'both'
                      ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold font-bold'
                      : 'border-luxury-borderSubtle text-luxury-muted hover:text-luxury-ivory'
                  }`}
                >
                  Both (SMS &amp; Email)
                </button>
                <button
                  type="button"
                  onClick={() => setReminderChannel('sms')}
                  className={`p-2.5 rounded border text-center font-medium transition-all ${
                    reminderChannel === 'sms'
                      ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold font-bold'
                      : 'border-luxury-borderSubtle text-luxury-muted hover:text-luxury-ivory'
                  }`}
                >
                  SMS Only
                </button>
                <button
                  type="button"
                  onClick={() => setReminderChannel('email')}
                  className={`p-2.5 rounded border text-center font-medium transition-all ${
                    reminderChannel === 'email'
                      ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold font-bold'
                      : 'border-luxury-borderSubtle text-luxury-muted hover:text-luxury-ivory'
                  }`}
                >
                  Email Only
                </button>
              </div>
            </div>

            {/* Template Preview */}
            <div className="p-3 rounded bg-luxury-black border border-luxury-borderSubtle text-[11px] text-luxury-muted space-y-1">
              <strong className="text-luxury-ivory block font-sans">SMS Message Preview:</strong>
              <p className="font-mono text-[10px] text-luxury-goldLight leading-relaxed">
                "Peachtree Corners Loan &amp; Pawn: Friendly reminder that Pawn Ticket #{selectedTicketForReminder.ticketNumber} ({selectedTicketForReminder.itemDescription}) is due on {new Date(selectedTicketForReminder.dueDate).toLocaleDateString()}. Monthly fee to extend 30 days is ${selectedTicketForReminder.monthlyInterestFee.toFixed(2)}. Pay online: https://pawnshopnorcross.com#/pawn-loans?ticket={selectedTicketForReminder.ticketNumber} or call (678) 691-1692. Reply STOP to opt out."
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-luxury-borderSubtle">
              <button
                type="button"
                onClick={() => setReminderModalOpen(false)}
                className="px-4 py-2 border border-luxury-borderSubtle text-luxury-muted text-xs uppercase hover:text-luxury-ivory"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSendReminder}
                className="px-5 py-2 bg-luxury-gold text-luxury-black font-bold text-xs uppercase hover:brightness-110 flex items-center gap-1.5 shadow-gold-glow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Reminder Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RECORD MONTHLY EXTENSION FEE (30-DAY RENEWAL) */}
      {/* ======================================================== */}
      {paymentModalOpen && selectedTicketForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-luxury-darkCard border border-emerald-500/50 rounded-sm max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-luxury-borderSubtle pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="font-editorial text-lg font-bold text-luxury-ivory">
                  Record Pawn Loan Extension Payment
                </h3>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-luxury-muted hover:text-luxury-ivory text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-luxury-muted">
              Recording this monthly pawn fee extends the loan maturity date by <strong>+30 calendar days</strong> in both this web system and the Hi-Tech POS register database.
            </p>

            <div className="p-3 rounded bg-luxury-charcoal/80 border border-luxury-borderSubtle space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-luxury-muted">Ticket Number:</span>
                <strong className="text-luxury-gold font-mono">{selectedTicketForPayment.ticketNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Client:</span>
                <span className="text-luxury-ivory">{selectedTicketForPayment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Collateral:</span>
                <span className="text-luxury-ivory">{selectedTicketForPayment.itemDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Current Due Date:</span>
                <span className="text-rose-300 font-semibold">
                  {new Date(selectedTicketForPayment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between border-t border-luxury-borderSubtle/60 pt-1 mt-1">
                <span className="text-luxury-muted">New Extended Due Date (+30d):</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {(() => {
                    const d = new Date(selectedTicketForPayment.dueDate);
                    d.setDate(d.getDate() + 30);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Monthly Fee Due:</span>
                <strong className="text-emerald-400 font-mono text-sm">${selectedTicketForPayment.monthlyInterestFee.toFixed(2)}</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-muted font-semibold mb-1">
                  Payment Method:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded px-3 py-2 text-luxury-ivory outline-none focus:border-luxury-gold"
                >
                  <option value="in_store_counter">In-Store Register (Cash / Counter Debit)</option>
                  <option value="card_online">Online Card Payment (Customer Portal)</option>
                  <option value="phone_card">Phone Payment (Verified Card on File)</option>
                </select>
              </div>

              <div className="p-3 rounded bg-emerald-950/30 border border-emerald-600/30 text-[11px] text-emerald-300">
                A receipt will automatically be generated and sent to {selectedTicketForPayment.customerPhone} and {selectedTicketForPayment.customerEmail}.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-luxury-borderSubtle">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 border border-luxury-borderSubtle text-luxury-muted text-xs uppercase hover:text-luxury-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase hover:brightness-110 flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmittingPayment ? 'Processing...' : `Confirm $${selectedTicketForPayment.monthlyInterestFee.toFixed(2)} Extension`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: INTEGRATION & REMINDER SETTINGS */}
      {/* ======================================================== */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-luxury-darkCard border border-luxury-gold/50 rounded-sm max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-luxury-borderSubtle pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-luxury-gold" />
                <h3 className="font-editorial text-lg font-bold text-luxury-ivory">
                  Hi-Tech Pawn POS Integration Settings
                </h3>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="text-luxury-muted hover:text-luxury-ivory text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-muted font-semibold mb-1">
                  Hi-Tech Station Bridge Host:
                </label>
                <input
                  type="text"
                  disabled
                  value={hiTechSettings?.bridgeHost || 'pos-station-01.local:4892'}
                  className="w-full bg-luxury-charcoal/50 border border-luxury-borderSubtle rounded px-3 py-2 text-luxury-muted font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-muted font-semibold mb-1">
                  Automated Two-Way Sync Interval:
                </label>
                <select
                  value={syncFreq}
                  onChange={(e) => setSyncFreq(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded px-3 py-2 text-luxury-ivory outline-none focus:border-luxury-gold"
                >
                  <option value="5">Every 5 minutes (High volume)</option>
                  <option value="15">Every 15 minutes (Standard recommendation)</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Hourly</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-luxury-borderSubtle">
                <label className="block text-[11px] uppercase tracking-wider text-luxury-muted font-semibold">
                  Automated Notification Schedule Triggers:
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-luxury-ivory">
                  <input
                    type="checkbox"
                    checked={adv7}
                    onChange={(e) => setAdv7(e.target.checked)}
                    className="accent-luxury-gold"
                  />
                  <span>7-Day Advance Notice Reminder</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-luxury-ivory">
                  <input
                    type="checkbox"
                    checked={adv3}
                    onChange={(e) => setAdv3(e.target.checked)}
                    className="accent-luxury-gold"
                  />
                  <span>3-Day Advance Notice Reminder</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-luxury-ivory">
                  <input
                    type="checkbox"
                    checked={dueTodayRule}
                    onChange={(e) => setDueTodayRule(e.target.checked)}
                    className="accent-luxury-gold"
                  />
                  <span>Due Today Alert (Day 0)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-luxury-ivory">
                  <input
                    type="checkbox"
                    checked={graceNoticeRule}
                    onChange={(e) => setGraceNoticeRule(e.target.checked)}
                    className="accent-luxury-gold"
                  />
                  <span>Grace Period Final Warning (5 Days Before Forfeiture)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-luxury-borderSubtle">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="px-4 py-2 border border-luxury-borderSubtle text-luxury-muted text-xs uppercase hover:text-luxury-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-luxury-gold text-luxury-black font-bold text-xs uppercase hover:brightness-110"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
