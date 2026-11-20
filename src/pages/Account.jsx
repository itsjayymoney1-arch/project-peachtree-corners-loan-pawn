import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import { 
  User, 
  ShoppingBag, 
  Settings, 
  ShieldAlert, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Mail, 
  Phone, 
  KeyRound, 
  Trash2,
  ChevronRight,
  ExternalLink,
  Landmark,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

export default function Account() {
  const { navigate, queryParams } = useRouter();
  const { 
    customerUser, 
    orders, 
    pawnLoans = [],
    logoutCustomer, 
    updateCustomerProfile, 
    updateMarketingPreferences, 
    requestAccountDeletion 
  } = useApp();

  const [activeTab, setActiveTab] = useState(queryParams.tab || 'orders'); // 'orders', 'profile', 'marketing', 'security'

  // Edit profile state
  const [firstName, setFirstName] = useState(customerUser?.firstName || '');
  const [lastName, setLastName] = useState(customerUser?.lastName || '');
  const [phone, setPhone] = useState(customerUser?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Marketing preferences state
  const [weeklyVaultEmail, setWeeklyVaultEmail] = useState(customerUser?.marketingPreferences?.emailWeeklyVault ?? true);
  const [newArrivalsEmail, setNewArrivalsEmail] = useState(customerUser?.marketingPreferences?.emailNewArrivals ?? true);
  const [smsOrderUpdates, setSmsOrderUpdates] = useState(customerUser?.marketingPreferences?.smsOrderUpdates ?? true);
  const [smsPromotions, setSmsPromotions] = useState(customerUser?.marketingPreferences?.smsPromotions ?? false);
  const [marketingSaved, setMarketingSaved] = useState(false);

  // Security password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  // Delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!customerUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-editorial text-2xl font-bold text-luxury-ivory">Please Sign In</h2>
        <p className="text-xs text-luxury-muted">You must be signed in to view your Vault customer dashboard.</p>
        <button
          onClick={() => navigate('/auth')}
          className="px-6 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  // Filter orders strictly for THIS customer (Data isolation requirement)
  const customerOrders = orders.filter(o => 
    (o.customerId && o.customerId === customerUser.id) ||
    (o.customerEmail && o.customerEmail.toLowerCase() === customerUser.email.toLowerCase())
  );

  // Filter active pawn loans for THIS customer
  const customerLoans = pawnLoans.filter(l => 
    (customerUser?.email && l.customerEmail?.toLowerCase() === customerUser.email.toLowerCase()) ||
    (customerUser?.phone && l.customerPhone && l.customerPhone.replace(/[^0-9]/g, '').endsWith(customerUser.phone.replace(/[^0-9]/g, '').slice(-7)))
  );

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateCustomerProfile({ firstName, lastName, phone });
    setProfileSuccess('Profile updated successfully.');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handleSaveMarketing = (e) => {
    e.preventDefault();
    updateMarketingPreferences({
      emailWeeklyVault: weeklyVaultEmail,
      emailNewArrivals: newArrivalsEmail,
      smsOrderUpdates,
      smsPromotions
    });
    setMarketingSaved(true);
    setTimeout(() => setMarketingSaved(false), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!newPass || newPass.length < 6) {
      setPassMsg('Password must be at least 6 characters.');
      return;
    }
    setPassMsg('Password successfully changed.');
    setCurrentPass('');
    setNewPass('');
    setTimeout(() => setPassMsg(''), 3000);
  };

  const handleDeleteAccount = () => {
    requestAccountDeletion();
    navigate('/');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="bg-luxury-darkCard border border-luxury-gold/30 rounded-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-luxury-card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-luxury-charcoal border border-luxury-gold/50 flex items-center justify-center text-luxury-gold text-2xl font-editorial font-bold shadow-gold-glow">
            {customerUser.firstName ? customerUser.firstName[0].toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-luxury-ivory">
                {customerUser.firstName} {customerUser.lastName}
              </h1>
              {customerUser.emailVerified && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-luxury-muted font-mono">{customerUser.email}</p>
            <p className="text-[11px] text-luxury-muted mt-1">
              Client Member Since {new Date(customerUser.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            logoutCustomer();
            navigate('/');
          }}
          className="self-start md:self-center px-4 py-2 border border-luxury-borderSubtle text-luxury-muted hover:text-luxury-ivory hover:border-luxury-gold/40 text-xs uppercase tracking-wider font-medium rounded-sm flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-luxury-borderSubtle pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-4 text-xs uppercase tracking-wider font-bold rounded-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'orders'
              ? 'bg-luxury-gold text-luxury-black shadow-gold-glow'
              : 'bg-luxury-darkCard text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders ({customerOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pawn')}
          className={`py-3 px-4 text-xs uppercase tracking-wider font-bold rounded-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'pawn'
              ? 'bg-luxury-gold text-luxury-black shadow-gold-glow'
              : 'bg-luxury-darkCard text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Pawn Loans ({customerLoans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-4 text-xs uppercase tracking-wider font-bold rounded-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'profile'
              ? 'bg-luxury-gold text-luxury-black shadow-gold-glow'
              : 'bg-luxury-darkCard text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          onClick={() => setActiveTab('marketing')}
          className={`py-3 px-4 text-xs uppercase tracking-wider font-bold rounded-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'marketing'
              ? 'bg-luxury-gold text-luxury-black shadow-gold-glow'
              : 'bg-luxury-darkCard text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Marketing Consent</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`py-3 px-4 text-xs uppercase tracking-wider font-bold rounded-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'security'
              ? 'bg-luxury-gold text-luxury-black shadow-gold-glow'
              : 'bg-luxury-darkCard text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security &amp; Privacy</span>
        </button>
      </div>

      {/* Tab 1: Order History */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {customerOrders.length === 0 ? (
            <div className="text-center py-16 bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-luxury-muted" />
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">No Orders Found</h3>
              <p className="text-xs text-luxury-muted">You haven't made any purchases yet.</p>
              <button
                onClick={() => navigate('/vault')}
                className="px-5 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase"
              >
                Browse The Vault
              </button>
            </div>
          ) : (
            customerOrders.map(order => (
              <div 
                key={order.id}
                className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 space-y-6 shadow-sm hover:border-luxury-gold/40 transition-colors"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-luxury-borderSubtle pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono text-luxury-gold tracking-wider block">
                      Order Reference: #{order.orderNumber}
                    </span>
                    <span className="text-xs text-luxury-muted">
                      Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-bold bg-luxury-charcoal text-luxury-goldLight border border-luxury-gold/30">
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                    <span className="font-editorial text-xl font-bold text-luxury-gold">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-luxury-borderSubtle/60">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-14 h-14 object-cover rounded-sm border border-luxury-borderSubtle bg-luxury-charcoal shrink-0" 
                        />
                        <div>
                          <h4 className="text-sm font-medium text-luxury-ivory">{item.title}</h4>
                          <span className="text-xs text-luxury-muted font-mono">{item.sku} &bull; Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-editorial text-base font-bold text-luxury-ivory">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fulfillment and pickup details */}
                <div className="p-4 rounded-sm bg-luxury-charcoal/60 border border-luxury-borderSubtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-luxury-muted uppercase font-semibold text-[10px] block">
                      Fulfillment Method
                    </span>
                    <p className="text-luxury-ivory font-medium">
                      {order.fulfillmentMethod === 'pickup' 
                        ? 'In-Store Counter Pickup at 7040 Jimmy Carter Blvd Suite 4' 
                        : (order.fulfillmentMethod === 'in_store_immediate' ? 'In-Store Immediate Counter Sale' : 'Insured Courier Delivery')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/order-confirmation', { orderId: order.id })}
                      className="px-4 py-2 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 1.5: Collateral Pawn Loans */}
      {activeTab === 'pawn' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-luxury-borderSubtle pb-4">
            <div>
              <h2 className="font-editorial text-2xl font-bold text-luxury-ivory">
                Your Collateral Pawn Loans
              </h2>
              <p className="text-xs text-luxury-muted mt-0.5">
                Merchandise actively secured in our showroom vault under confidential pawn loan agreements.
              </p>
            </div>
            <button
              onClick={() => navigate('/pawn-loans')}
              className="px-4 py-2 bg-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-black text-luxury-gold border border-luxury-gold/40 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all self-start sm:self-center flex items-center gap-1.5"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Pawn Portal &amp; Lookup</span>
            </button>
          </div>

          {customerLoans.length === 0 ? (
            <div className="text-center py-16 bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm space-y-3">
              <Landmark className="w-10 h-10 mx-auto text-luxury-muted" />
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">No Active Pawn Loans</h3>
              <p className="text-xs text-luxury-muted max-w-md mx-auto">
                You do not have any active collateral pawn tickets associated with this account. Need short-term collateral funding?
              </p>
              <button
                onClick={() => navigate('/pawn-loans')}
                className="mt-2 px-6 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
              >
                Learn About Pawn Loans
              </button>
            </div>
          ) : (
            customerLoans.map(loan => {
              const formattedDue = new Date(loan.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              return (
                <div
                  key={loan.id}
                  className="bg-luxury-darkCard border border-luxury-borderSubtle hover:border-luxury-gold/50 rounded-sm p-6 space-y-4 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-luxury-borderSubtle pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-lg text-luxury-gold">
                          Ticket #{loan.ticketNumber}
                        </span>
                        {loan.status === 'due_today' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                            DUE TODAY
                          </span>
                        )}
                        {loan.status === 'grace_period' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-700">
                            IN GRACE PERIOD
                          </span>
                        )}
                        {loan.status === 'due_soon' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            DUE SOON
                          </span>
                        )}
                        {loan.renewalCount > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            EXTENDED ({loan.renewalCount}x)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-luxury-muted mt-1 block">
                        Pledged on {new Date(loan.datePawned).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase text-luxury-muted block">Monthly Fee to Extend</span>
                      <strong className="text-lg font-mono font-bold text-luxury-gold">
                        ${loan.monthlyInterestFee.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-editorial text-base font-bold text-luxury-ivory">
                        {loan.itemDescription}
                      </h4>
                      {loan.serialNumber && (
                        <p className="text-xs text-luxury-muted font-mono">
                          Serial: {loan.serialNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded bg-luxury-charcoal/70 border border-luxury-borderSubtle">
                      <span className="text-[10px] uppercase text-luxury-muted block">Loan Principal</span>
                      <span className="font-mono font-bold text-luxury-ivory">${loan.principalAmount.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded bg-luxury-charcoal/70 border border-luxury-borderSubtle">
                      <span className="text-[10px] uppercase text-luxury-muted block">Maturity Due Date</span>
                      <span className="font-medium text-luxury-ivory">{formattedDue}</span>
                    </div>
                    <div className="p-3 rounded bg-luxury-charcoal/70 border border-luxury-borderSubtle">
                      <span className="text-[10px] uppercase text-luxury-muted block">Grace Period Cutoff</span>
                      <span className="text-luxury-muted">{new Date(loan.gracePeriodEndDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-luxury-borderSubtle">
                    <span className="text-[11px] text-luxury-muted">
                      Full redemption requires in-store pickup at 7040 Jimmy Carter Blvd with matching photo ID.
                    </span>
                    <button
                      onClick={() => navigate('/pawn-loans', { ticket: loan.ticketNumber })}
                      className="px-5 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-gold-glow flex items-center justify-center gap-1.5"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Extend 30 Days Online (${loan.monthlyInterestFee.toFixed(2)})</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Profile Details */}
      {activeTab === 'profile' && (
        <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 sm:p-8 space-y-6 max-w-xl">
          <h3 className="font-editorial text-xl font-bold text-luxury-ivory">
            Personal Information
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                Email Address (Managed by Account)
              </label>
              <input
                type="email"
                disabled
                value={customerUser.email}
                className="w-full bg-luxury-charcoal/50 border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-xs text-luxury-muted cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                Phone Number (For Order SMS)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none font-mono"
              />
            </div>

            {profileSuccess && (
              <p className="text-xs text-emerald-400">{profileSuccess}</p>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Marketing Consent Management */}
      {activeTab === 'marketing' && (
        <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 sm:p-8 space-y-6 max-w-xl">
          <div className="space-y-1">
            <h3 className="font-editorial text-xl font-bold text-luxury-ivory">
              Marketing &amp; Notification Subscriptions
            </h3>
            <p className="text-xs text-luxury-muted">
              Configure your granular communication preferences per Federal Trade Commission and TCPA standards.
            </p>
          </div>

          <form onSubmit={handleSaveMarketing} className="space-y-6">
            
            {/* Email Preferences */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-luxury-gold uppercase tracking-wider">
                Email Subscriptions
              </h4>
              
              <label className="flex items-start gap-3 cursor-pointer text-xs text-luxury-ivory select-none">
                <input
                  type="checkbox"
                  checked={weeklyVaultEmail}
                  onChange={(e) => setWeeklyVaultEmail(e.target.checked)}
                  className="mt-0.5 rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                />
                <div>
                  <strong className="block">The Vault Weekly</strong>
                  <span className="text-luxury-muted text-[11px]">Receive our Saturday morning drops featuring curated estate gold and timepieces.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-xs text-luxury-ivory select-none">
                <input
                  type="checkbox"
                  checked={newArrivalsEmail}
                  onChange={(e) => setNewArrivalsEmail(e.target.checked)}
                  className="mt-0.5 rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                />
                <div>
                  <strong className="block">New Arrival Alerts</strong>
                  <span className="text-luxury-muted text-[11px]">Be notified when high-demand contractor tools or guitars are cataloged.</span>
                </div>
              </label>
            </div>

            {/* SMS Preferences */}
            <div className="space-y-3 pt-4 border-t border-luxury-borderSubtle">
              <h4 className="text-xs font-bold text-luxury-gold uppercase tracking-wider">
                SMS Text Messaging
              </h4>

              <label className="flex items-start gap-3 cursor-pointer text-xs text-luxury-ivory select-none">
                <input
                  type="checkbox"
                  checked={smsOrderUpdates}
                  onChange={(e) => setSmsOrderUpdates(e.target.checked)}
                  className="mt-0.5 rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                />
                <div>
                  <strong className="block">Transactional Order Updates (Recommended)</strong>
                  <span className="text-luxury-muted text-[11px]">Instant text alert when your order is ready for in-store counter pickup.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-xs text-luxury-ivory select-none">
                <input
                  type="checkbox"
                  checked={smsPromotions}
                  onChange={(e) => setSmsPromotions(e.target.checked)}
                  className="mt-0.5 rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                />
                <div>
                  <strong className="block">Promotional Vault Drops (SMS)</strong>
                  <span className="text-luxury-muted text-[11px]">Exclusive flash sales and rare collector items. Msg &amp; data rates may apply. Reply STOP anytime.</span>
                </div>
              </label>
            </div>

            {marketingSaved && (
              <p className="text-xs text-emerald-400">Marketing preferences saved and updated in system suppression lists.</p>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
            >
              Update Preferences
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Security & Privacy */}
      {activeTab === 'security' && (
        <div className="space-y-8 max-w-xl">
          
          {/* Password update */}
          <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 sm:p-8 space-y-4">
            <h3 className="font-editorial text-xl font-bold text-luxury-ivory">
              Change Account Password
            </h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                />
              </div>

              {passMsg && (
                <p className="text-xs text-emerald-400">{passMsg}</p>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Account Deletion Request (GDPR / CCPA) */}
          <div className="bg-luxury-darkCard border border-red-900/30 rounded-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              <h3 className="font-editorial text-xl font-bold">
                Account Deletion Request
              </h3>
            </div>
            
            <p className="text-xs text-luxury-muted leading-relaxed">
              In accordance with privacy standards (GDPR/CCPA), you may permanently delete your profile, saved addresses, and marketing subscriptions. Regulatory transaction records required by state pawn legislation will be archived per legal retention requirements.
            </p>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-sm border border-red-800 text-red-400 hover:bg-red-950 text-xs uppercase tracking-wider font-semibold transition-colors"
            >
              Request Account Deletion
            </button>
          </div>

        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/90 backdrop-blur-sm">
          <div className="bg-luxury-darkCard border border-red-800 rounded-sm p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-red-400">Confirm Account Deletion</h3>
            <p className="text-xs text-luxury-muted">
              Are you sure you want to permanently delete your account? This action cannot be reversed.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-luxury-borderSubtle text-luxury-muted text-xs uppercase rounded-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs uppercase rounded-sm hover:bg-red-700"
              >
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
