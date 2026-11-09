import React from 'react';
import { useRouter } from '../context/RouterContext';
import { STORE_INFO } from '../data/storeInfo';
import { 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Lock, 
  FileText, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function PawnLoans() {
  const { navigate } = useRouter();

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      
      {/* 1. HERO BANNER */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-b border-luxury-borderSubtle">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=85"
            alt="Professional financial and collateral consultation setting"
            className="w-full h-full object-cover object-center filter brightness-[0.22]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-luxury-gold/20 text-luxury-goldLight border border-luxury-gold/40 text-xs uppercase tracking-widest font-semibold backdrop-blur-md">
            <Lock className="w-3.5 h-3.5 text-luxury-gold" />
            Confidential Collateral Services
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-luxury-ivory leading-tight">
            QUESTIONS ABOUT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold">
              PAWN SERVICES?
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-luxury-muted font-light leading-relaxed">
            Peachtree Corners Loan & Pawn provides confidential, collateral-based pawn services. Contact our store team directly to discuss terms, documentation, and applicable requirements.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={STORE_INFO.phone.telLink}
              className="px-6 py-3.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-gold-glow flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Direct: (678) 691-1692</span>
            </a>
            <a
              href={STORE_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Visit Store Location</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. HOW COLLATERAL TRANSACTIONS WORK */}
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
              State & Local Compliance
            </h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              All pawn transactions in Georgia are governed by state statutes and local ordinances. Specific interest rates, holding periods, and fees are discussed transparently in person before you decide.
            </p>
          </div>
        </div>
      </section>

      {/* 3. WHAT TO BRING WHEN VISITING */}
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
              Peachtree Corners Loan & Pawn conducts all collateral pawn loan agreements strictly in person at 7040 Jimmy Carter Boulevard, Suite 4, Peachtree Corners, GA. In accordance with consumer protection standards and Georgia pawnbroker regulations, we do not issue loans online or collect private financial credentials through the website. Contact our store team directly at <strong>(678) 691-1692</strong> for current terms, eligibility criteria, and redemption details.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
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
              Will getting a pawn loan impact my credit score?
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              No. Collateral pawn transactions are secured entirely by the physical item you pledge. We do not check credit scores, run credit reports, or report pawn transactions to credit bureaus.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-2">
            <h4 className="font-editorial text-lg font-semibold text-luxury-ivory">
              How is my collateral item stored while in pawn?
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Your merchandise is sealed, logged, and placed in our secure in-store vaults or monitored equipment storage until your agreement is redeemed.
            </p>
          </div>

          <div className="p-5 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-2">
            <h4 className="font-editorial text-lg font-semibold text-luxury-ivory">
              Can I sell my item outright instead of pawning it?
            </h4>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Yes, absolutely. Customers can choose between pawning their items (retaining ownership to redeem later) or selling outright for immediate payout. Our team will explain both options.
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

    </div>
  );
}
