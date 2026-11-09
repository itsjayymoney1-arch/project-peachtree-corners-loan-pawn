import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Unsubscribe() {
  const { navigate, queryParams } = useRouter();
  const { subscribers, reloadDb } = useApp();
  
  const initialEmail = queryParams.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('Too frequent');

  const handleUnsubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    try {
      // Find subscriber in localStorage database and mark inactive / suppress
      const dbRaw = localStorage.getItem('pc_vault_database_v2');
      if (dbRaw) {
        const db = JSON.parse(dbRaw);
        let found = false;

        // Update subscribers
        if (db.subscribers) {
          db.subscribers = db.subscribers.map(sub => {
            if (sub.email.toLowerCase() === email.trim().toLowerCase()) {
              found = true;
              return {
                ...sub,
                status: 'unsubscribed',
                emailConsent: false,
                smsConsent: false,
                unsubscribedAt: new Date().toISOString(),
                unsubscribeReason: reason
              };
            }
            return sub;
          });
        }

        // Also update any matching customer marketing preferences
        if (db.customers) {
          db.customers = db.customers.map(c => {
            if (c.email.toLowerCase() === email.trim().toLowerCase()) {
              return {
                ...c,
                marketingPreferences: {
                  ...c.marketingPreferences,
                  emailWeeklyVault: false,
                  emailNewArrivals: false,
                  smsPromotions: false
                }
              };
            }
            return c;
          });
        }

        // Add to suppression list if not already there
        if (!db.suppressionList) db.suppressionList = [];
        if (!db.suppressionList.includes(email.trim().toLowerCase())) {
          db.suppressionList.push(email.trim().toLowerCase());
        }

        // Audit log
        db.auditLogs = [
          {
            id: 'audit-unsub-' + Date.now(),
            timestamp: new Date().toISOString(),
            actorId: 'customer',
            actorEmail: email,
            actorRole: 'CUSTOMER',
            action: 'MARKETING_UNSUBSCRIBED',
            entityType: 'subscriber',
            entityId: email,
            details: { reason }
          },
          ...(db.auditLogs || [])
        ];

        localStorage.setItem('pc_vault_database_v2', JSON.stringify(db));
        reloadDb();
      }

      setUnsubscribed(true);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to process unsubscribe request.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-8 animate-fadeIn">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-bold">
          PEACHTREE CORNERS LOAN &amp; PAWN
        </span>
        <h1 className="font-editorial text-3xl font-bold text-luxury-ivory tracking-wide">
          COMMUNICATION PREFERENCES
        </h1>
        <p className="text-xs text-luxury-muted">
          Manage your email and promotional message subscriptions.
        </p>
      </div>

      <div className="bg-luxury-darkCard border border-luxury-gold/30 rounded-sm p-6 sm:p-8 space-y-6 shadow-luxury-card">
        {unsubscribed ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-950/80 border border-emerald-600/60 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-luxury-ivory">You Have Been Unsubscribed</h2>
            <p className="text-xs text-luxury-muted leading-relaxed">
              <strong className="text-luxury-ivory">{email}</strong> has been removed from The Vault Weekly and all promotional distribution lists.
            </p>
            <p className="text-[11px] text-luxury-muted">
              Note: You will still receive essential transactional confirmations (such as purchase receipts and in-store pickup ready notices) if you place an order.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider hover:brightness-110"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <p className="text-xs text-luxury-muted leading-relaxed">
              We respect your privacy and inbox. Please confirm your email address below to opt out of marketing communications.
            </p>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-700/50 text-red-200 text-xs rounded-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-luxury-muted font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-luxury-gold absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-luxury-charcoal border border-luxury-borderSubtle focus:border-luxury-gold rounded-sm text-xs text-luxury-ivory focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider text-luxury-muted font-medium">
                Reason for leaving (Optional)
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-luxury-charcoal border border-luxury-borderSubtle focus:border-luxury-gold rounded-sm text-xs text-luxury-ivory focus:outline-none"
              >
                <option value="Too frequent">Emails are too frequent</option>
                <option value="No longer interested">No longer interested in pawn/estate merchandise</option>
                <option value="Never signed up">I didn't sign up for this list</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-sm bg-red-900/80 hover:bg-red-800 text-red-100 font-bold text-xs uppercase tracking-wider border border-red-700/60 transition-colors"
            >
              Unsubscribe from All Marketing
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs text-luxury-muted hover:text-luxury-gold inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel and return to storefront</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="text-center text-[11px] text-luxury-muted space-y-1">
        <p>Peachtree Corners Loan &amp; Pawn &bull; 7040 Jimmy Carter Blvd, Suite 4, Peachtree Corners, GA 30092</p>
        <p>Direct Phone: {STORE_INFO.phone.formatted}</p>
      </div>

    </div>
  );
}