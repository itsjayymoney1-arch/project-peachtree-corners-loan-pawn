import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import { CATEGORIES } from '../data/inventory';
import ProductCard from '../components/ProductCard';
import { 
  ArrowRight, 
  Phone, 
  MapPin, 
  Sparkles, 
  Flame,
  ShieldCheck, 
  RefreshCw, 
  Users, 
  Compass, 
  ChevronRight,
  ExternalLink,
  Award,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function Home({ onSelectProduct, onInquireProduct }) {
  const { navigate } = useRouter();
  const { products, subscribeToVaultWeekly } = useApp();

  // Newsletter state
  const [vaultEmail, setVaultEmail] = useState('');
  const [subStatus, setSubStatus] = useState('');

  // Top fresh new arrivals and featured vault drops
  const vaultNewArrivals = products
    .filter(p => p.status !== 'draft' && p.status !== 'archived')
    .slice(0, 8);

  const handleVaultSubscribe = async (e) => {
    e.preventDefault();
    if (!vaultEmail || !vaultEmail.includes('@')) return;
    try {
      await subscribeToVaultWeekly({ email: vaultEmail, consentEmail: true });
      setSubStatus('subscribed');
      setVaultEmail('');
    } catch (err) {
      setSubStatus('error');
    }
  };

  return (
    <div className="space-y-20 pb-16 animate-fadeIn">
      
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-luxury-borderSubtle">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=85"
            alt="Fine jewelry and luxury retail showcase"
            className="w-full h-full object-cover object-center filter brightness-[0.35] scale-105 transform motion-safe:animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/75 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-luxury-black/60 to-luxury-black" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 space-y-8 animate-fadeIn">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-charcoal/80 border border-luxury-gold/40 backdrop-blur-md shadow-gold-glow">
            <Sparkles className="w-4 h-4 text-luxury-gold" />
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-luxury-goldLight">
              Peachtree Corners &amp; Norcross, GA
            </span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-luxury-ivory leading-[1.05]">
            VALUE WORTH <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold">
              DISCOVERING.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-luxury-muted font-light leading-relaxed">
            A refined retail destination where fine estate gold, luxury Swiss timepieces, contractor power equipment, and musical instruments meet professional collateral loan services.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/vault')}
              className="px-8 py-3.5 rounded-sm bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center gap-2"
            >
              <span>Explore The Vault</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/sell-to-us')}
              className="px-8 py-3.5 rounded-sm border border-luxury-gold/60 text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-[0.15em] transition-all"
            >
              Sell Your Merchandise
            </button>
          </div>

          {/* Store Quick Coordinates */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-luxury-muted border-t border-luxury-borderSubtle max-w-xl mx-auto">
            <a 
              href={STORE_INFO.phone.telLink} 
              className="flex items-center gap-1.5 hover:text-luxury-gold transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-luxury-gold" />
              <span>{STORE_INFO.phone.formatted}</span>
            </a>
            <span>&bull;</span>
            <a 
              href={STORE_INFO.directionsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-luxury-gold transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-luxury-gold" />
              <span>7040 Jimmy Carter Blvd, Suite 4</span>
            </a>
          </div>

        </div>
      </section>

      {/* 2. THE VAULT: JUST CAME IN (CENTRAL ATTRACTION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="bg-gradient-to-b from-luxury-darkCard to-luxury-black border border-luxury-gold/40 rounded-sm p-8 sm:p-12 relative overflow-hidden shadow-luxury-card">
          <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-gold/5 blur-[100px] rounded-full pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-luxury-borderSubtle pb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-luxury-gold/15 text-luxury-goldLight border border-luxury-gold/30 text-xs uppercase tracking-widest font-bold">
                <Flame className="w-3.5 h-3.5 text-luxury-gold" />
                THE VAULT
              </div>
              <h2 className="font-editorial text-3xl sm:text-5xl md:text-6xl font-bold text-luxury-ivory tracking-wide leading-tight">
                JUST CAME IN.
              </h2>
              <p className="font-editorial text-lg sm:text-xl text-luxury-goldLight italic">
                "Discover what's new before somebody else does."
              </p>
              <p className="text-xs sm:text-sm text-luxury-muted max-w-xl">
                Fresh arrivals from our daily store appraisals. Available for immediate counter pickup in Peachtree Corners or insured delivery.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/vault')}
                className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center justify-center gap-2"
              >
                <span>View Full Vault Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10">
            {vaultNewArrivals.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onInquireProduct={onInquireProduct}
              />
            ))}
          </div>

          {/* Footer Callout */}
          <div className="mt-10 pt-6 border-t border-luxury-borderSubtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-luxury-muted">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-luxury-gold" />
              <span>Showroom inventory turns over rapidly. Call (678) 691-1692 to check holding status.</span>
            </div>
            <button
              onClick={() => navigate('/vault')}
              className="text-luxury-gold hover:underline font-semibold uppercase tracking-wider text-xs"
            >
              See All Weekly Vault Drops &rarr;
            </button>
          </div>

        </div>

      </section>

      {/* 3. FEATURED CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-luxury-gold">
            Curated Specialties
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-luxury-ivory tracking-wide">
            Explore By Department
          </h2>
          <p className="text-sm text-luxury-muted">
            From authenticated precious metals and timepieces to contractor-grade tools and audio instruments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={cat.id}
              onClick={() => navigate(cat.href)}
              className={`group relative overflow-hidden rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle hover:border-luxury-gold/50 transition-all duration-300 hover:shadow-gold-glow cursor-pointer ${
                idx === 0 ? 'md:col-span-2 lg:col-span-2 aspect-[16/9]' : 'aspect-square md:aspect-[4/3]'
              }`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.6] group-hover:brightness-[0.7]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/40 to-transparent" />

              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-luxury-gold">
                  {cat.tagline}
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory group-hover:text-luxury-goldLight transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs sm:text-sm text-luxury-muted line-clamp-2 max-w-md">
                  {cat.description}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-luxury-gold">
                  <span>Browse Department</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. VALUE PROPOSITION / TRUST PILLARS */}
      <section className="bg-luxury-charcoal/40 border-y border-luxury-borderSubtle py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-3 p-4 rounded-sm hover:bg-luxury-surface/40 transition-colors">
              <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
                Carefully Inspected
              </h3>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Every precious metal hallmark is verified and tested. Electronics, watches, and contractor tools undergo thorough bench testing before offering.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-sm hover:bg-luxury-surface/40 transition-colors">
              <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
                Constant New Arrivals
              </h3>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Unlike mass-market retail, our showroom rotates daily. Unique estate pieces, rare watches, and distinctive gear arrive every week.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-sm hover:bg-luxury-surface/40 transition-colors">
              <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
                Local Integrity
              </h3>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Proudly rooted in Peachtree Corners and Norcross, GA. Straightforward pricing, transparent valuations, and professional service.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-sm hover:bg-luxury-surface/40 transition-colors">
              <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
                Exceptional Value
              </h3>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Experience luxury and commercial performance without traditional retail markup. Real gold, authentic stones, and professional brands.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. NEWSLETTER SUBSCRIPTION CALLOUT */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-sm bg-luxury-darkCard border border-luxury-gold/30 space-y-6">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-luxury-gold">
            STAY AHEAD OF THE DROP
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-luxury-ivory">
            Join The Vault Weekly
          </h2>
          <p className="text-xs sm:text-sm text-luxury-muted max-w-lg mx-auto">
            "The best finds don't stay secret." Receive immediate alerts when rare estate jewelry, Swiss watches, or contractor tool bundles are published.
          </p>

          {subStatus === 'subscribed' ? (
            <div className="p-4 rounded bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs font-medium max-w-md mx-auto">
              Thank you! You are subscribed to The Vault Weekly announcements.
            </div>
          ) : (
            <form onSubmit={handleVaultSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={vaultEmail}
                onChange={(e) => setVaultEmail(e.target.value)}
                className="flex-1 bg-luxury-black border border-luxury-borderSubtle rounded-sm px-4 py-2.5 text-xs text-luxury-ivory placeholder-luxury-muted focus:border-luxury-gold outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider rounded-sm hover:brightness-110 shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-[10px] text-luxury-muted">
            Unsubscribe anytime. We respect your inbox privacy.
          </p>
        </div>
      </section>

    </div>
  );
}
