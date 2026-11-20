import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import { TEST_CARDS } from '../services/paymentAdapter';
import { 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Lock, 
  FileText, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  Sparkles,
  Search,
  Landmark,
  DollarSign,
  Clock,
  AlertTriangle,
  AlertCircle,
  Calendar,
  CreditCard,
  Send,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function PawnLoans() {
  const { navigate, queryParams } = useRouter();
  const { 
    lookupPawnTicket, 
    extendPawnLoan, 
    customerUser,
    pawnLoans = [] 
  } = useApp();

  // Search form state
  const [ticketQuery, setTicketQuery] = useState(queryParams.ticket || '');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [lookupError, setLookupError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Extension payment modal state
  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [selectedTestCard, setSelectedTestCard] = useState(TEST_CARDS[0]);
  const [cardName, setCardName] = useState(customerUser ? `${customerUser.firstName} ${customerUser.lastName}` : 'David Harrison');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState(null);

  // Auto-lookup if ticket in query params or if demo user is logged in
  useEffect(() => {
    if (queryParams.ticket) {
      const found = lookupPawnTicket(queryParams.ticket);
      if (found) {
        setActiveTicket(found);
      }
    } else if (customerUser) {
      // Find matching loan for logged in user
      const found = pawnLoans.find(t => 
        t.customerEmail?.toLowerCase() === customerUser.email?.toLowerCase() ||
        (customerUser.phone && t.customerPhone && t.customerPhone.includes(customerUser.phone.slice(-4)))
      );
      if (found && !activeTicket) {
        setTicketQuery(found.ticketNumber);
        setActiveTicket(found);
      }
    }
  }, [queryParams.ticket, customerUser, pawnLoans, lookupPawnTicket]);

  const handleLookup = (e) => {
    if (e) e.preventDefault();
    if (!ticketQuery.trim()) {
      setLookupError('Please enter a pawn ticket number (e.g. HT-88412).');
      return;
    }

    setIsSearching(true);
    setLookupError('');
    setPaymentSuccessMsg(null);

    setTimeout(() => {
      const result = lookupPawnTicket(ticketQuery, phoneQuery);
      if (result) {
        setActiveTicket(result);
        setLookupError('');
      } else {
        setActiveTicket(null);
        setLookupError(`Pawn Ticket #${ticketQuery.trim().toUpperCase()} was not found. Please verify the ticket number from your pawn agreement or call (678) 691-1692.`);
      }
      setIsSearching(false);
    }, 350);
  };

  const handleLoadSample = (sampleNum) => {
    setTicketQuery(sampleNum);
    setPhoneQuery('');
    setLookupError('');
    setPaymentSuccessMsg(null);
    const found = lookupPawnTicket(sampleNum);
    if (found) {
      setActiveTicket(found);
    }
  };

  const handleProcessExtension = async (e) => {
    e.preventDefault();
    if (!activeTicket) return;

    setIsProcessingPayment(true);
    setLookupError('');

    try {
      const res = await extendPawnLoan({
        ticketId: activeTicket.id,
        paidAmount: activeTicket.monthlyInterestFee,
        paymentMethod: 'card_online',
        cardDetails: {
          cardNumber: selectedTestCard.number,
          expiry: selectedTestCard.exp,
          cvc: selectedTestCard.cvc,
          billingPostal: '30092'
        },
        actor: customerUser ? { name: `${customerUser.firstName} ${customerUser.lastName}`, email: customerUser.email, role: 'CUSTOMER' } : null
      });

      setActiveTicket(res.ticket);
      setExtensionModalOpen(false);
      setPaymentSuccessMsg({
        amount: activeTicket.monthlyInterestFee,
        ticketNumber: activeTicket.ticketNumber,
        newDueDate: new Date(res.ticket.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });
    } catch (err) {
      setLookupError(err.message || 'Payment failed. Please verify card details.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      
      {/* 1. HERO BANNER */}
      <section className="relative min-h-[48vh] flex items-center justify-center overflow-hidden border-b border-luxury-borderSubtle">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85"
            alt="Professional financial and collateral consultation setting"
            className="w-full h-full object-cover object-center filter brightness-[0.20]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/85 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-luxury-gold/20 text-luxury-goldLight border border-luxury-gold/40 text-xs uppercase tracking-widest font-semibold backdrop-blur-md">
            <Lock className="w-3.5 h-3.5 text-luxury-gold" />
            Confidential Collateral Services &bull; Hi-Tech Connected
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-luxury-ivory leading-tight">
            PAWN LOANS &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold">
              TICKET MANAGEMENT
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-luxury-muted font-light leading-relaxed">
            Peachtree Corners Loan &amp; Pawn provides confidential, collateral-based pawn services. Look up your pawn ticket, check due dates, extend your loan 30 days online, or review statutory grace periods.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#ticket-portal"
              className="px-6 py-3.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-gold-glow flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Check Pawn Ticket Status</span>
            </a>
            <a
              href={STORE_INFO.phone.telLink}
              className="px-6 py-3.5 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Direct: (678) 691-1692</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE PAWN TICKET LOOKUP & ONLINE EXTENSION HUB */}
      <section id="ticket-portal" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-luxury-darkCard border border-luxury-gold/40 rounded-sm p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="border-b border-luxury-borderSubtle pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-gold/15 text-luxury-goldLight border border-luxury-gold/30 text-xs uppercase tracking-widest font-bold mb-2">
                <Landmark className="w-3.5 h-3.5 text-luxury-gold" />
                Live Client Ticket Portal
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-luxury-ivory">
                Look Up Your Pawn Ticket
              </h2>
              <p className="text-xs text-luxury-muted mt-1">
                Enter your Ticket # (found at the top right of your pawn ticket receipt) and your phone number to check loan balance and due dates.
              </p>
            </div>

            {/* Quick Demo Pre-fill helper */}
            <div className="text-left md:text-right shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-luxury-muted block mb-1.5 font-semibold">
                Quick Demo Samples:
              </span>
              <div className="flex flex-wrap md:justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLoadSample('HT-88412')}
                  className="px-2.5 py-1 rounded text-[11px] bg-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-black text-luxury-gold border border-luxury-gold/30 transition-all font-mono"
                >
                  #HT-88412 (Rolex)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('HT-88429')}
                  className="px-2.5 py-1 rounded text-[11px] bg-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-black text-rose-300 border border-rose-500/30 transition-all font-mono"
                >
                  #HT-88429 (Due Today)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('HT-88390')}
                  className="px-2.5 py-1 rounded text-[11px] bg-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-black text-amber-300 border border-amber-500/30 transition-all font-mono"
                >
                  #HT-88390 (Grace Period)
                </button>
              </div>
            </div>
          </div>

          {/* Lookup Input Form */}
          <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-[11px] uppercase tracking-wider text-luxury-muted font-semibold mb-1">
                Pawn Ticket Number *
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-luxury-muted" />
                <input
                  type="text"
                  required
                  placeholder="e.g. HT-88412"
                  value={ticketQuery}
                  onChange={(e) => setTicketQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-luxury-charcoal border border-luxury-borderSubtle rounded text-xs text-luxury-ivory font-mono uppercase focus:border-luxury-gold outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] uppercase tracking-wider text-luxury-muted font-semibold mb-1">
                Phone Number or Email (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. (404) 555-0192"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                className="w-full px-3 py-2.5 bg-luxury-charcoal border border-luxury-borderSubtle rounded text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
              />
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-2.5 bg-luxury-gold hover:brightness-110 text-luxury-black font-bold text-xs uppercase tracking-wider rounded transition-all shadow-gold-glow flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{isSearching ? 'Searching...' : 'Check Status'}</span>
              </button>
            </div>
          </form>

          {/* Feedback & Errors */}
          {lookupError && (
            <div className="p-4 bg-rose-950/80 border border-rose-700/60 text-xs text-rose-200 rounded flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}

          {/* Payment Success Banner */}
          {paymentSuccessMsg && (
            <div className="p-5 bg-emerald-950/90 border border-emerald-600/70 text-xs text-emerald-200 rounded space-y-2 animate-fadeIn shadow-lg">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Loan Extension Successfully Confirmed!</span>
              </div>
              <p className="leading-relaxed">
                We received your monthly pawn fee of <strong>${paymentSuccessMsg.amount.toFixed(2)}</strong> for Ticket <strong>#{paymentSuccessMsg.ticketNumber}</strong>. Your loan has been extended by 30 days and your collateral remains securely stored in our vault.
              </p>
              <div className="pt-1 flex items-center gap-4 text-[11px] font-mono text-emerald-300">
                <span>New Due Date: <strong>{paymentSuccessMsg.newDueDate}</strong></span>
                <span>&bull;</span>
                <span>Confirmation SMS &amp; Email dispatched</span>
              </div>
            </div>
          )}

          {/* 3. TICKET RESULT CARD */}
          {activeTicket && (
            <div className="bg-luxury-charcoal/90 border border-luxury-gold/50 rounded-sm p-6 space-y-6 animate-fadeIn">
              
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-luxury-borderSubtle pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xl font-bold text-luxury-gold">
                      Ticket #{activeTicket.ticketNumber}
                    </span>
                    {activeTicket.status === 'due_today' && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse">
                        DUE TODAY
                      </span>
                    )}
                    {activeTicket.status === 'grace_period' && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-700">
                        IN STATUTORY GRACE PERIOD
                      </span>
                    )}
                    {activeTicket.status === 'due_soon' && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        DUE SOON
                      </span>
                    )}
                    {activeTicket.renewalCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        EXTENDED ({activeTicket.renewalCount}x)
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-luxury-muted block mt-0.5">
                    Pledged on {new Date(activeTicket.datePawned).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase tracking-wider text-luxury-muted block">Client Record</span>
                  <strong className="text-luxury-ivory text-sm">{activeTicket.customerName}</strong>
                </div>
              </div>

              {/* Collateral Merchandise Highlight */}
              <div className="p-4 rounded bg-luxury-darkCard border border-luxury-borderSubtle flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-luxury-gold font-semibold block">
                    Collateral Merchandise In Vault
                  </span>
                  <h3 className="font-editorial text-lg font-bold text-luxury-ivory">
                    {activeTicket.itemDescription}
                  </h3>
                  {activeTicket.serialNumber && (
                    <span className="text-xs text-luxury-muted font-mono block">
                      Serial / Asset ID: {activeTicket.serialNumber}
                    </span>
                  )}
                </div>
                <div className="w-10 h-10 rounded bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              {/* Financial & Schedule Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded bg-luxury-darkCard border border-luxury-borderSubtle space-y-1">
                  <span className="text-[10px] uppercase text-luxury-muted block">Loan Principal</span>
                  <div className="text-lg font-mono font-bold text-luxury-ivory">
                    ${activeTicket.principalAmount.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-luxury-muted">Original borrowed cash</span>
                </div>

                <div className="p-3 rounded bg-luxury-darkCard border border-luxury-gold/30 space-y-1">
                  <span className="text-[10px] uppercase text-luxury-gold font-semibold block">Monthly Extension Fee</span>
                  <div className="text-lg font-mono font-bold text-luxury-gold">
                    ${activeTicket.monthlyInterestFee.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-luxury-muted">Extends maturity +30 days</span>
                </div>

                <div className="p-3 rounded bg-luxury-darkCard border border-luxury-borderSubtle space-y-1">
                  <span className="text-[10px] uppercase text-luxury-muted block">Maturity Due Date</span>
                  <div className="text-lg font-sans font-bold text-luxury-ivory">
                    {new Date(activeTicket.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <span className="text-[10px] text-rose-300">
                    {activeTicket.status === 'due_today' ? 'Due today!' : 'Standard maturity date'}
                  </span>
                </div>

                <div className="p-3 rounded bg-luxury-darkCard border border-luxury-borderSubtle space-y-1">
                  <span className="text-[10px] uppercase text-luxury-muted block">Grace Period Cutoff</span>
                  <div className="text-lg font-sans font-bold text-luxury-muted">
                    {new Date(activeTicket.gracePeriodEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <span className="text-[10px] text-luxury-muted">Georgia statutory hold</span>
                </div>
              </div>

              {/* Full Payoff Note */}
              <div className="p-3.5 rounded bg-luxury-gold/5 border border-luxury-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <strong className="text-luxury-ivory block font-semibold">
                    Total Full Redemption Payoff: ${(activeTicket.principalAmount + activeTicket.monthlyInterestFee).toFixed(2)}
                  </strong>
                  <span className="text-luxury-muted text-[11px]">
                    To pay off loan in full and retrieve your collateral from our vault, visit our store in person with valid photo ID.
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-luxury-gold font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Inspected &amp; Vault Sealed
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-end gap-3 border-t border-luxury-borderSubtle">
                <a
                  href={STORE_INFO.phone.telLink}
                  className="px-5 py-3 rounded border border-luxury-borderSubtle hover:border-luxury-gold text-luxury-muted hover:text-luxury-ivory font-semibold text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Store to Redeem</span>
                </a>

                <button
                  type="button"
                  onClick={() => setExtensionModalOpen(true)}
                  className="px-6 py-3.5 rounded bg-gradient-to-r from-luxury-gold to-luxury-goldLight text-luxury-black font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-gold-glow flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Pay ${activeTicket.monthlyInterestFee.toFixed(2)} Fee to Extend 30 Days Online</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* 3. HOW COLLATERAL TRANSACTIONS WORK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
            Informational Overview
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-luxury-ivory">
            Understanding Collateral Pawn Services
          </h2>
          <p className="text-sm text-luxury-muted">
            A collateral loan is a short-term transaction secured solely by physical merchandise that you own and pledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-3">
            <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
              Secured by Your Merchandise
            </h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Unlike traditional bank loans, collateral pawn transactions are based on the appraised value of the physical item you bring into our store — such as gold jewelry, timepieces, electronics, or equipment.
            </p>
          </div>

          <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-3">
            <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
              Secure Item Storage
            </h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              While your item is pledged, it is kept safe and untouched in our secure storage vaults. Once the agreement terms are fulfilled, your item is returned to you in the exact condition received.
            </p>
          </div>

          <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-3">
            <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
              State &amp; Local Compliance
            </h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              All pawn transactions in Georgia are governed by state statutes and local ordinances. Specific interest rates, holding periods, and fees are discussed transparently in person before you decide.
            </p>
          </div>
        </div>
      </section>

      {/* 4. WHAT TO BRING WHEN VISITING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-luxury-darkCard border border-luxury-gold/30 rounded-sm p-8 sm:p-12 space-y-8">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block mb-1">
              Checklist for Consultation
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
              What to Bring to the Store
            </h3>
            <p className="text-sm text-luxury-muted mt-1 max-w-2xl">
              To ensure a smooth, quick, and compliant evaluation, please have the following items ready when visiting:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-sm bg-luxury-charcoal/70 border border-luxury-borderSubtle space-y-2">
              <div className="text-luxury-gold font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
                1. Government-Issued Photo ID
              </div>
              <p className="text-xs text-luxury-muted leading-relaxed">
                A valid state driver's license, Georgia state identification card, or current passport is legally required for all pawn transactions.
              </p>
            </div>

            <div className="p-5 rounded-sm bg-luxury-charcoal/70 border border-luxury-borderSubtle space-y-2">
              <div className="text-luxury-gold font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
                2. The Physical Merchandise
              </div>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Bring the complete item you wish to pledge so our staff can evaluate its condition, authenticity, and functionality.
              </p>
            </div>

            <div className="p-5 rounded-sm bg-luxury-charcoal/70 border border-luxury-borderSubtle space-y-2">
              <div className="text-luxury-gold font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
                3. Associated Accessories
              </div>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Original boxes, chargers, remote controls, extra batteries, or certification documents can enhance your item's valuation.
              </p>
            </div>
          </div>

          {/* Important Regulatory & Business Safety Notice */}
          <div className="p-5 rounded-sm bg-luxury-charcoal/90 border border-luxury-borderSubtle text-xs text-luxury-muted space-y-2">
            <div className="flex items-center gap-2 text-luxury-gold font-semibold uppercase tracking-wider text-[11px]">
              <Info className="w-4 h-4 text-luxury-gold" />
              <span>In-Person Regulatory Notice</span>
            </div>
            <p className="leading-relaxed">
              Peachtree Corners Loan &amp; Pawn conducts all collateral pawn loan agreements strictly in person at 7040 Jimmy Carter Boulevard, Suite 4, Peachtree Corners, GA. In accordance with consumer protection standards and Georgia pawnbroker regulations, initial loans require physical counter inspection and verification of government photo ID. Existing pawn loans may be extended online through monthly renewal fees.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
            Common Inquiries
          </span>
          <h2 className="font-editorial text-3xl font-semibold text-luxury-ivory">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-2">
            <h4 className="font-editorial text-lg font-semibold text-luxury-ivory">
              How does the automated reminder system work?
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Peachtree Corners Loan &amp; Pawn sends automated reminder notices via SMS text message and email 7 days before, 3 days before, and on your due date. If a ticket enters its grace period, a final notice is sent before forfeiture. You can reply STOP at any time to opt out.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-2">
            <h4 className="font-editorial text-lg font-semibold text-luxury-ivory">
              What does paying the monthly fee do?
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Paying your monthly pawn fee covers the service charges and interest for that 30-day period. It advances your maturity due date by an additional 30 calendar days, keeping your loan current and safeguarding your collateral in our vault.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-2">
            <h4 className="font-editorial text-lg font-semibold text-luxury-ivory">
              Will getting a pawn loan impact my credit score?
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              No. Collateral pawn transactions are secured entirely by the physical item you pledge. We do not check credit scores, run credit reports, or report pawn transactions to credit bureaus.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <a
            href={STORE_INFO.phone.telLink}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>Speak With Our Team: (678) 691-1692</span>
          </a>
        </div>
      </section>

      {/* ======================================================== */}
      {/* ONLINE LOAN EXTENSION MODAL (TEST CARD / PAYMENT)        */}
      {/* ======================================================== */}
      {extensionModalOpen && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-luxury-darkCard border border-luxury-gold/50 rounded-sm max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-luxury-borderSubtle pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-luxury-gold" />
                <h3 className="font-editorial text-xl font-bold text-luxury-ivory">
                  Extend Pawn Loan 30 Days Online
                </h3>
              </div>
              <button
                onClick={() => setExtensionModalOpen(false)}
                className="text-luxury-muted hover:text-luxury-ivory text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded bg-luxury-charcoal/80 border border-luxury-borderSubtle space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-luxury-muted">Ticket Number:</span>
                <strong className="text-luxury-gold font-mono">{activeTicket.ticketNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Collateral Pledged:</span>
                <span className="text-luxury-ivory font-medium">{activeTicket.itemDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Current Due Date:</span>
                <span className="text-rose-300 font-semibold">
                  {new Date(activeTicket.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between border-t border-luxury-borderSubtle/60 pt-1 mt-1">
                <span className="text-luxury-muted">New Extended Maturity (+30 Days):</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {(() => {
                    const d = new Date(activeTicket.dueDate);
                    d.setDate(d.getDate() + 30);
                    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-luxury-borderSubtle/60">
                <span className="text-luxury-ivory font-bold">Extension Fee Due:</span>
                <strong className="text-luxury-gold font-mono text-base">${activeTicket.monthlyInterestFee.toFixed(2)}</strong>
              </div>
            </div>

            {/* Test Card Quick Selector */}
            <div className="space-y-2 text-xs">
              <label className="block text-[11px] uppercase tracking-wider text-luxury-muted font-semibold">
                Select Card (Sandbox Demonstration):
              </label>
              <div className="space-y-1.5">
                {TEST_CARDS.map(card => (
                  <button
                    key={card.number}
                    type="button"
                    onClick={() => setSelectedTestCard(card)}
                    className={`w-full p-2.5 rounded border text-left flex items-center justify-between text-xs transition-all ${
                      selectedTestCard.number === card.number
                        ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold font-bold'
                        : 'border-luxury-borderSubtle bg-luxury-charcoal/50 text-luxury-muted hover:text-luxury-ivory'
                    }`}
                  >
                    <div>
                      <span>{card.label}</span>
                      <span className="block text-[10px] font-mono text-luxury-muted">
                        •••• •••• •••• {card.number.slice(-4)} &bull; Exp {card.exp}
                      </span>
                    </div>
                    {selectedTestCard.number === card.number && (
                      <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleProcessExtension} className="space-y-4 text-xs pt-1">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-muted font-semibold mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded px-3 py-2 text-luxury-ivory outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="p-3 rounded bg-luxury-gold/10 border border-luxury-gold/30 text-[11px] text-luxury-goldLight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-luxury-gold shrink-0" />
                <span>
                  Encrypted sandbox tokenization active. Your transaction will sync instantly to Hi-Tech POS register ledger.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-luxury-borderSubtle">
                <button
                  type="button"
                  onClick={() => setExtensionModalOpen(false)}
                  className="px-4 py-2 border border-luxury-borderSubtle text-luxury-muted text-xs uppercase hover:text-luxury-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-5 py-2.5 bg-luxury-gold hover:brightness-110 text-luxury-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-gold-glow"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isProcessingPayment ? 'Processing...' : `Pay $${activeTicket.monthlyInterestFee.toFixed(2)} & Extend`}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
