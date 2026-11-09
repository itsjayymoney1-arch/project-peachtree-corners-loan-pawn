import React from 'react';
import { useRouter } from '../context/RouterContext';
import { STORE_INFO } from '../data/storeInfo';
import { 
  Phone, 
  MapPin, 
  ArrowUp, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Flame,
  ShoppingBag,
  User,
  KeyRound
} from 'lucide-react';

export default function Footer() {
  const { navigate } = useRouter();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-luxury-black border-t border-luxury-gold/20 text-luxury-muted">
      
      {/* Top Value Banner */}
      <div className="border-b border-luxury-borderSubtle bg-gradient-to-r from-luxury-black via-luxury-charcoal/40 to-luxury-black py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="font-editorial text-2xl sm:text-3xl text-luxury-ivory font-semibold tracking-wide">
              {STORE_INFO.tagline}
            </h3>
            <p className="text-sm text-luxury-muted mt-1 max-w-xl">
              Discover verified fine jewelry, Swiss automatic chronographs, contractor-grade tools, and musical instruments in Peachtree Corners, GA.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={STORE_INFO.phone.telLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>Call (678) 691-1692</span>
            </a>
            <button
              onClick={() => navigate('/vault')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm border border-luxury-gold text-luxury-gold font-medium text-xs uppercase tracking-wider hover:bg-luxury-gold/10 transition-all"
            >
              <Flame className="w-4 h-4" />
              <span>Explore The Vault</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Location Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-luxury-charcoal border border-luxury-gold/50 flex items-center justify-center shadow-gold-glow">
                <span className="font-editorial text-xl font-bold text-luxury-gold">PC</span>
              </div>
              <div>
                <span className="block font-editorial text-xl font-semibold tracking-wide text-luxury-ivory">
                  PEACHTREE CORNERS
                </span>
                <span className="block text-[11px] uppercase tracking-[0.25em] text-luxury-gold font-medium">
                  LOAN &amp; PAWN &bull; THE VAULT
                </span>
              </div>
            </div>

            <p className="text-sm text-luxury-muted leading-relaxed max-w-sm">
              Providing respectful collateral pawn loan services and an elevated retail discovery platform for fine estate jewelry, luxury watches, electronics, tools, and guitars.
            </p>

            <div className="pt-2 space-y-2 text-sm text-luxury-ivory">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-luxury-gold shrink-0 mt-1" />
                <div>
                  <p>{STORE_INFO.address.street}</p>
                  <p className="text-luxury-muted text-xs">{STORE_INFO.address.city}, {STORE_INFO.address.state} {STORE_INFO.address.zip}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-luxury-gold shrink-0" />
                <a href={STORE_INFO.phone.telLink} className="hover:text-luxury-gold transition-colors font-medium">
                  {STORE_INFO.phone.formatted}
                </a>
              </div>
            </div>
          </div>

          {/* Department / Category Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
              The Vault &bull; Shop
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/vault')} className="hover:text-luxury-ivory transition-colors flex items-center gap-1.5 text-luxury-goldLight font-medium">
                  <Flame className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>The Vault (Live Drops)</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/jewelry')} className="hover:text-luxury-ivory transition-colors">
                  Jewelry &amp; Luxury Watches
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/electronics')} className="hover:text-luxury-ivory transition-colors">
                  Electronics &amp; Computing
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools')} className="hover:text-luxury-ivory transition-colors">
                  Tools &amp; Equipment
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/musical-instruments')} className="hover:text-luxury-ivory transition-colors">
                  Musical Instruments
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-luxury-ivory transition-colors">
                  Showroom Catalog
                </button>
              </li>
            </ul>
          </div>

          {/* Client Account & Services */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
              Client &amp; Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/account')} className="hover:text-luxury-ivory transition-colors flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>Client Account</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/account?tab=orders')} className="hover:text-luxury-ivory transition-colors">
                  Order Tracking
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/account?tab=marketing')} className="hover:text-luxury-ivory transition-colors">
                  Email &amp; SMS Preferences
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/sell-to-us')} className="hover:text-luxury-ivory transition-colors">
                  Sell Your Merchandise
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/pawn-loans')} className="hover:text-luxury-ivory transition-colors">
                  Collateral Pawn Loans
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-luxury-ivory transition-colors">
                  About Our Store
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-luxury-ivory transition-colors">
                  Contact &amp; Map
                </button>
              </li>
            </ul>
          </div>

          {/* Staff Access & In-Store Coordinates */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
              Store &amp; Operations
            </h4>
            <div className="p-3.5 rounded-sm bg-luxury-charcoal/70 border border-luxury-gold/20 space-y-2">
              <span className="text-xs text-luxury-gold font-semibold block uppercase tracking-wider">
                Store Phone Line
              </span>
              <a href={STORE_INFO.phone.telLink} className="text-sm font-semibold text-luxury-ivory hover:text-luxury-gold">
                {STORE_INFO.phone.formatted}
              </a>
              <span className="block text-[11px] text-luxury-muted">
                7040 Jimmy Carter Blvd &bull; Suite 4
              </span>
              <p className="text-[11px] text-luxury-muted pt-1">
                Mon - Sat 9:30 AM - 6:00 PM
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/admin')}
                className="w-full py-2 px-3 rounded-sm bg-luxury-surface border border-luxury-gold/40 hover:border-luxury-gold text-luxury-gold hover:text-luxury-goldLight text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Store Staff Admin (/admin)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Prototype & Legal Disclosure */}
        <div className="mt-12 pt-8 border-t border-luxury-borderSubtle">
          <div className="p-4 rounded-sm bg-luxury-charcoal/40 border border-luxury-gold/20 text-xs text-luxury-muted space-y-2">
            <div className="flex items-center gap-2 text-luxury-gold font-semibold uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Digital Retail Architecture &bull; The Vault</span>
            </div>
            <p>
              Peachtree Corners Loan &amp; Pawn: 7040 Jimmy Carter Boulevard, Suite 4, Peachtree Corners, GA 30092 &bull; Phone: (678) 691-1692. Regulated pawn services require physical in-person inspection and state ID. Retail merchandise is available for secure online acquisition or showroom pickup.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} Peachtree Corners Loan &amp; Pawn. All rights reserved.</p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-luxury-gold hover:text-luxury-goldLight transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
