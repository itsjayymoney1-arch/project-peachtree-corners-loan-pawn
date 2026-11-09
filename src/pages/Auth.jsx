import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export default function Auth() {
  const { navigate, queryParams } = useRouter();
  const { customerUser, registerCustomer, loginCustomer, logoutCustomer } = useApp();

  // Mode: 'login', 'register', 'forgot', 'verify'
  const [mode, setMode] = useState(queryParams.mode || 'login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Marketing consent checkboxes (unchecked by default per regulations)
  const [consentWeeklyVault, setConsentWeeklyVault] = useState(false);
  const [consentSmsPromo, setConsentSmsPromo] = useState(false);

  // States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect or display account status
  if (customerUser && mode !== 'verify') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-full bg-luxury-gold/15 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-luxury-ivory">
          Already Signed In
        </h2>
        <p className="text-xs text-luxury-muted">
          You are currently signed in as <strong className="text-luxury-gold">{customerUser.email}</strong>.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate('/account')}
            className="px-6 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider"
          >
            Go to My Account
          </button>
          <button
            onClick={() => logoutCustomer()}
            className="px-6 py-2.5 rounded-sm border border-luxury-borderSubtle text-luxury-muted hover:text-luxury-ivory text-xs uppercase tracking-wider"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        if (!email || !password) throw new Error("Please enter both email and password.");
        await loginCustomer(email, password);
        navigate('/account');
      } else if (mode === 'register') {
        if (!email || !password || !firstName || !lastName) {
          throw new Error("Please fill in all required registration fields.");
        }
        await registerCustomer({
          email,
          password,
          firstName,
          lastName,
          phone: phoneNumber,
          marketingPreferences: {
            emailWeeklyVault: consentWeeklyVault,
            emailNewArrivals: consentWeeklyVault,
            smsOrderUpdates: true,
            smsPromotions: consentSmsPromo
          }
        });
        navigate('/account');
      } else if (mode === 'forgot') {
        if (!email) throw new Error("Please enter your registered email address.");
        // Password reset email simulation
        await new Promise(r => setTimeout(r, 600));
        setSuccessMsg(`A secure password reset link has been dispatched to ${email}. Check your inbox.`);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 space-y-8 animate-fadeIn">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-bold">
          PEACHTREE CORNERS LOAN &amp; PAWN
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-luxury-ivory tracking-wide">
          {mode === 'login' && 'CLIENT SIGN IN'}
          {mode === 'register' && 'ESTABLISH VAULT ACCOUNT'}
          {mode === 'forgot' && 'RESET PASSWORD'}
        </h1>
        <p className="text-xs text-luxury-muted">
          {mode === 'login' && 'Access order history, tracking, and personal Vault preferences.'}
          {mode === 'register' && 'Create your customer profile for streamlined checkout and orders.'}
          {mode === 'forgot' && 'Enter your email to receive a password recovery link.'}
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-luxury-darkCard border border-luxury-gold/30 rounded-sm p-6 sm:p-8 space-y-6 shadow-luxury-card">
        
        {/* Toggle Mode Tabs */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-luxury-charcoal rounded-sm border border-luxury-borderSubtle">
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-all ${
                mode === 'login' ? 'bg-luxury-gold text-luxury-black shadow-sm' : 'text-luxury-muted hover:text-luxury-ivory'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-all ${
                mode === 'register' ? 'bg-luxury-gold text-luxury-black shadow-sm' : 'text-luxury-muted hover:text-luxury-ivory'
              }`}
            >
              Register
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-gold" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm pl-9 pr-3.5 py-2.5 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                Mobile Phone (Optional for Order SMS)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-gold" />
                <input
                  type="tel"
                  placeholder="(678) 555-0100"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm pl-9 pr-3.5 py-2.5 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                />
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] uppercase tracking-wider text-luxury-muted font-medium">
                  Password *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[10px] text-luxury-gold hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-gold" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm pl-9 pr-3.5 py-2.5 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                />
              </div>
            </div>
          )}

          {/* Marketing consent options on registration */}
          {mode === 'register' && (
            <div className="pt-2 border-t border-luxury-borderSubtle space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-luxury-muted select-none">
                <input
                  type="checkbox"
                  checked={consentWeeklyVault}
                  onChange={(e) => setConsentWeeklyVault(e.target.checked)}
                  className="mt-0.5 rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                />
                <span className="text-[11px] leading-snug">
                  Subscribe to <strong>The Vault Weekly</strong> email newsletter for estate drop announcements. Unsubscribe anytime.
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-luxury-muted select-none">
                <input
                  type="checkbox"
                  checked={consentSmsPromo}
                  onChange={(e) => setConsentSmsPromo(e.target.checked)}
                  className="mt-0.5 rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                />
                <span className="text-[11px] leading-snug">
                  Receive promotional SMS messages for new weekly drops. Msg &amp; data rates may apply. Reply STOP to cancel.
                </span>
              </label>
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-sm bg-red-950/80 border border-red-700/60 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-sm bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all shadow-gold-glow flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-luxury-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Sign In to Account'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Instructions'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className="w-full text-center text-xs text-luxury-gold hover:underline pt-2 block"
            >
              &larr; Back to Sign In
            </button>
          )}

        </form>

        {/* Guest Demo Helper */}
        <div className="pt-4 border-t border-luxury-borderSubtle text-center space-y-2">
          <p className="text-[11px] text-luxury-muted">
            Browsing without an account?
          </p>
          <button
            onClick={() => navigate('/vault')}
            className="text-xs uppercase tracking-wider text-luxury-gold hover:underline font-semibold"
          >
            Explore The Vault as Guest &rarr;
          </button>
        </div>

      </div>

    </div>
  );
}
