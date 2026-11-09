import React from 'react';
import { STORE_INFO } from '../data/storeInfo';
import InquiryForm from '../components/InquiryForm';
import { 
  DollarSign, 
  Sparkles, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Gem, 
  Laptop, 
  Wrench, 
  Music, 
  Coins, 
  Watch,
  HelpCircle
} from 'lucide-react';

export default function SellToUs() {
  const categoriesList = [
    { title: "Gold & Diamond Jewelry", desc: "Solid yellow and white gold (10k-24k), diamond solitaires, chains, rings, bracelets, and scrap gold.", icon: Gem },
    { title: "Luxury Watches", desc: "Swiss mechanical timepieces, luxury automatic chronographs, vintage collectibles, and complete box sets.", icon: Watch },
    { title: "High-End Electronics", desc: "Modern laptops, unlocked smartphones, tablets, mirrorless cameras, and premium wireless headphones.", icon: Laptop },
    { title: "Contractor Power Tools", desc: "Cordless brushless tool combo kits, sliding compound miter saws, rotary laser levels, and air compressors.", icon: Wrench },
    { title: "Musical Instruments", desc: "Electric and acoustic guitars, tube amplifiers, synthesizers, weighted digital pianos, and sound gear.", icon: Music },
    { title: "Precious Metals & Coins", desc: "Gold and silver bullion coins, sovereign mint rounds, rare numismatics, and sterling silver collections.", icon: Coins },
  ];

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-b border-luxury-borderSubtle">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=2000&q=85"
            alt="Customer evaluating jewelry at store counter"
            className="w-full h-full object-cover object-center filter brightness-[0.25]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-luxury-gold/20 text-luxury-goldLight border border-luxury-gold/40 text-xs uppercase tracking-widest font-semibold backdrop-blur-md">
            <DollarSign className="w-3.5 h-3.5 text-luxury-gold" />
            Sell or Trade Your Merchandise
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-luxury-ivory leading-tight">
            TURN WHAT YOU OWN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold">
              INTO AN OPPORTUNITY.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-luxury-muted font-light leading-relaxed">
            Looking to sell jewelry, fine watches, electronics, tools, or musical equipment? Peachtree Corners Loan & Pawn provides straightforward in-person evaluations in a welcoming, professional environment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={STORE_INFO.phone.telLink}
              className="px-6 py-3.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-gold-glow flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call (678) 691-1692</span>
            </a>
            <a
              href={STORE_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. HOW THE SELLING PROCESS WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
            Simple 4-Step Process
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-luxury-ivory">
            How Selling To Us Works
          </h2>
          <p className="text-sm text-luxury-muted">
            All merchandise is evaluated in person at our physical store on Jimmy Carter Boulevard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-luxury-gold/15 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold font-editorial text-xl font-bold">
              1
            </div>
            <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
              Gather Your Items
            </h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Bring the item you wish to sell along with any original packaging, chargers, accessories, certificates, or extra links you may have.
            </p>
          </div>

          <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-luxury-gold/15 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold font-editorial text-xl font-bold">
              2
            </div>
            <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
              Bring Valid Photo ID
            </h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Georgia law requires sellers to present a valid government-issued photo identification (such as a Driver's License, State ID, or Passport).
            </p>
          </div>

          <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-luxury-gold/15 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold font-editorial text-xl font-bold">
              3
            </div>
            <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
              In-Person Evaluation
            </h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              Our experienced staff carefully inspects your item, tests functionality, verifies gold content or diamond specifications, and explains the valuation.
            </p>
          </div>

          <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-3 relative">
            <div className="w-10 h-10 rounded-full bg-luxury-gold/15 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold font-editorial text-xl font-bold">
              4
            </div>
            <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
              Immediate Payout
            </h3>
            <p className="text-xs text-luxury-muted leading-relaxed">
              If you accept the evaluation, transactions are completed on the spot with zero waiting periods. There is never any obligation to accept.
            </p>
          </div>
        </div>
      </section>

      {/* 3. MERCHANDISE CATEGORIES WE EVALUATE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-luxury-borderSubtle pb-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block">
            What We Buy & Evaluate
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
            Merchandise Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesList.map((cat, idx) => {
            const IconComponent = cat.icon;
            return (
              <div key={idx} className="p-5 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle hover:border-luxury-gold/40 transition-all space-y-2">
                <div className="flex items-center gap-2.5 text-luxury-gold">
                  <IconComponent className="w-5 h-5" />
                  <h3 className="font-editorial text-lg font-semibold text-luxury-ivory">
                    {cat.title}
                  </h3>
                </div>
                <p className="text-xs text-luxury-muted leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. INTERACTIVE FRONTEND INQUIRY FORM */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-luxury-darkCard border border-luxury-gold/40 rounded-sm p-6 sm:p-10 shadow-2xl space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-luxury-gold/15 text-luxury-goldLight border border-luxury-gold/30 text-xs uppercase tracking-wider font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
              Online Item Inquiry (Demonstration)
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-luxury-ivory">
              Tell Us About Your Merchandise
            </h2>
            <p className="text-xs sm:text-sm text-luxury-muted mt-1 leading-relaxed">
              Use this interactive prototype form to test how customers can describe items before visiting the store.
            </p>
          </div>

          {/* Embedded Form Component */}
          <InquiryForm />

          {/* Privacy & Prototype Protections Disclaimer */}
          <div className="pt-4 border-t border-luxury-borderSubtle text-[11px] text-luxury-muted leading-relaxed space-y-1">
            <p>
              <strong className="text-luxury-ivory">Demonstration Privacy Guarantee:</strong> This form does not collect government ID numbers, bank details, credit card numbers, or passwords. Data entered remains in your local browser session and is not stored or shared.
            </p>
          </div>
        </div>
      </section>

      {/* 5. DIRECT STORE CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-sm bg-gradient-to-r from-luxury-black via-luxury-charcoal to-luxury-black border border-luxury-gold/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
              Prefer to Discuss Directly Over the Phone?
            </h3>
            <p className="text-xs sm:text-sm text-luxury-muted">
              Call our store team during business hours. We're happy to discuss your items:
            </p>
          </div>
          <a
            href={STORE_INFO.phone.telLink}
            className="px-6 py-3.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 transition-all shrink-0 flex items-center gap-2 shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>Call (678) 691-1692</span>
          </a>
        </div>
      </section>

    </div>
  );
}
