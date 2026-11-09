import React from 'react';
import { useRouter } from '../context/RouterContext';
import { STORE_INFO } from '../data/storeInfo';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  Gem,
  Award
} from 'lucide-react';

export default function About() {
  const { navigate } = useRouter();

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      
      {/* 1. HERO BANNER */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-b border-luxury-borderSubtle">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=85"
            alt="Upscale retail showroom interior"
            className="w-full h-full object-cover object-center filter brightness-[0.25]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-luxury-gold/20 text-luxury-goldLight border border-luxury-gold/40 text-xs uppercase tracking-widest font-semibold backdrop-blur-md">
            <Building2 className="w-3.5 h-3.5 text-luxury-gold" />
            About Our Store
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-luxury-ivory leading-tight">
            PEACHTREE CORNERS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold">
              LOAN & PAWN
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-luxury-muted font-light leading-relaxed">
            A refined retail destination providing transparent evaluations, authenticated fine jewelry, contractor equipment, and professional collateral services.
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
              <span>Visit Jimmy Carter Blvd</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. THE RETAIL PHILOSOPHY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block">
              Our Retail Philosophy
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-luxury-ivory leading-tight">
              An Elevated Discovery Experience
            </h2>
            <p className="text-sm text-luxury-muted leading-relaxed">
              Peachtree Corners Loan & Pawn was established with a singular focus: to redefine the pawn and specialty retail experience by creating a clean, welcoming, and professional atmosphere where clients feel valued and comfortable.
            </p>
            <p className="text-sm text-luxury-muted leading-relaxed">
              Whether you are shopping for a solid gold necklace, hunting for a high-end guitar, upgrading your contractor tools, or seeking short-term collateral financing, our goal is to deliver honest evaluations and fair market values.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                <p className="text-xs text-luxury-ivory leading-relaxed">
                  <strong>Curated Merchandise:</strong> Every piece in our showroom is inspected for authenticity, condition, and functionality before being displayed.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                <p className="text-xs text-luxury-ivory leading-relaxed">
                  <strong>Respectful Atmosphere:</strong> We treat every client with dignity, confidentiality, and attentive care.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                <p className="text-xs text-luxury-ivory leading-relaxed">
                  <strong>Transparent Communication:</strong> We clearly explain how items are tested and valued, ensuring you have total clarity.
                </p>
              </div>
            </div>
          </div>

          <div className="relative rounded-sm overflow-hidden border border-luxury-gold/30 shadow-2xl aspect-[4/3] bg-luxury-charcoal">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80"
              alt="Peachtree Corners Loan and Pawn jewelry showcase"
              className="w-full h-full object-cover brightness-[0.8]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/90 via-transparent to-transparent flex flex-col justify-end p-6">
              <span className="text-xs uppercase tracking-wider text-luxury-gold font-semibold">
                Showroom Showcase
              </span>
              <p className="text-xs text-luxury-muted">
                Located in Peachtree Corners, GA — Serving Gwinnett County.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. MERCHANDISE SPECIALTIES */}
      <section className="bg-luxury-charcoal/40 border-y border-luxury-borderSubtle py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
              What We Do
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-luxury-ivory">
              Specialized Merchandise & Services
            </h2>
            <p className="text-sm text-luxury-muted">
              We specialize in tangible assets of enduring value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-gold block">
                01. Fine Jewelry & Watches
              </span>
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
                Precious Metals & Gems
              </h3>
              <p className="text-xs text-luxury-muted leading-relaxed">
                We handle 10K, 14K, 18K yellow and white gold, platinum, loose diamonds, vintage engagement rings, and automatic luxury timepieces.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-gold block">
                02. Tech & Equipment
              </span>
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
                Modern Tools & Devices
              </h3>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Contractors and tech enthusiasts explore our selection of tested cordless brushless tools, laptops, smartphones, and audio gear.
              </p>
            </div>

            <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-gold block">
                03. Collateral Transactions
              </span>
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
                Short-Term Pawn Loans
              </h3>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Confidential collateral loans secured by your personal property with clear terms and secure storage in our physical vaults.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. STORE VISIT INVITATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-luxury-black via-luxury-charcoal to-luxury-black border border-luxury-gold/40 rounded-sm p-8 sm:p-12 text-center space-y-6">
          <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block">
            We Welcome Your Visit
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-luxury-ivory">
            Experience Our Showroom Today
          </h2>
          <p className="text-sm text-luxury-muted max-w-xl mx-auto leading-relaxed">
            Visit us at <strong>7040 Jimmy Carter Boulevard, Suite 4, Peachtree Corners, GA 30092</strong>. We invite you to call ahead at <strong>678-691-1692</strong> to confirm current inventory or schedule a jewelry appraisal.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={STORE_INFO.phone.telLink}
              className="px-8 py-3.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-md flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call (678) 691-1692</span>
            </a>
            <a
              href={STORE_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Open Google Maps</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
