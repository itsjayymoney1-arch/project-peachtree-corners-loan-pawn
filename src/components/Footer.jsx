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
  Clock,
  Compass
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
              Discover exceptional jewelry, authenticated timepieces, commercial tools, and premium electronics in Peachtree Corners.
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
            <a
              href={STORE_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm border border-luxury-gold/50 text-luxury-gold font-medium text-xs uppercase tracking-wider hover:bg-luxury-gold/10 transition-all"
            >
              <MapPin className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
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
                  LOAN & PAWN
                </span>
              </div>
            </div>

            <p className="text-sm text-luxury-muted leading-relaxed max-w-sm">
              Providing respectful, professional pawn loan services and an elevated retail discovery experience for jewelry, electronics, musical instruments, and contractor equipment.
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
              Merchandise
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/jewelry')} className="hover:text-luxury-ivory transition-colors">
                  Jewelry & Watches
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/electronics')} className="hover:text-luxury-ivory transition-colors">
                  Electronics & Tech
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tools')} className="hover:text-luxury-ivory transition-colors">
                  Tools & Equipment
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/musical-instruments')} className="hover:text-luxury-ivory transition-colors">
                  Musical Instruments
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-luxury-ivory transition-colors">
                  All Demonstration Items
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Services Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
              Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('/sell-to-us')} className="hover:text-luxury-ivory transition-colors">
                  Sell to Us
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
                  Contact & Map
                </button>
              </li>
              <li>
                <a 
                  href={STORE_INFO.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-luxury-ivory transition-colors inline-flex items-center gap-1"
                >
                  <span>Google Directions</span>
                  <ExternalLink className="w-3 h-3 text-luxury-gold" />
                </a>
              </li>
            </ul>
          </div>

          {/* In-Store Visit Note */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
              Plan Your Visit
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Operating hours may vary during holidays. We encourage calling ahead to verify current hours or check specific merchandise before visiting:
            </p>
            <div className="p-3 rounded-sm bg-luxury-charcoal/70 border border-luxury-gold/20">
              <span className="text-xs text-luxury-gold font-semibold block uppercase tracking-wider mb-1">
                Store Phone Line
              </span>
              <a href={STORE_INFO.phone.telLink} className="text-sm font-semibold text-luxury-ivory hover:text-luxury-gold">
                {STORE_INFO.phone.formatted}
              </a>
              <span className="block text-[11px] text-luxury-muted mt-1">
                Located on Jimmy Carter Blvd
              </span>
            </div>
          </div>

        </div>

        {/* Prototype & Legal Demonstration Disclosure */}
        <div className="mt-12 pt-8 border-t border-luxury-borderSubtle">
          <div className="p-4 rounded-sm bg-luxury-charcoal/40 border border-luxury-gold/20 text-xs text-luxury-muted space-y-2">
            <div className="flex items-center gap-2 text-luxury-gold font-semibold uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Independent Digital Agency Demonstration Prototype</span>
            </div>
            <p>
              This website prototype was independently designed and developed as a visual and functional showcase for the ownership of Peachtree Corners Loan & Pawn. It does not replace or modify live store systems. All merchandise items listed are demonstration representations; visitors should contact the store directly at 678-691-1692 or visit in person at 7040 Jimmy Carter Blvd, Suite 4, Peachtree Corners, GA to verify current in-store selection, appraisal criteria, and pawn terms.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} Peachtree Corners Loan & Pawn. All rights reserved.</p>
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
