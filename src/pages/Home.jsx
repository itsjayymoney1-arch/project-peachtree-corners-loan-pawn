import React from 'react';
import { useRouter } from '../context/RouterContext';
import { STORE_INFO } from '../data/storeInfo';
import { CATEGORIES, DEMO_PRODUCTS } from '../data/inventory';
import ProductCard from '../components/ProductCard';
import { 
  ArrowRight, 
  Phone, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  Users, 
  Compass, 
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';

export default function Home({ onSelectProduct, onInquireProduct }) {
  const { navigate } = useRouter();

  // Pick top featured products
  const featuredProducts = DEMO_PRODUCTS.filter(p => p.featured).slice(0, 6);

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-luxury-borderSubtle">
        {/* Hero Background Image with Subtle Parallax Feel */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=85"
            alt="Fine jewelry and luxury retail showcase"
            className="w-full h-full object-cover object-center filter brightness-[0.35] scale-105 transform motion-safe:animate-pulse-slow"
          />
          {/* Subtle Radial Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/75 to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-luxury-black/60 to-luxury-black" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 space-y-8 animate-fadeIn">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-charcoal/80 border border-luxury-gold/40 backdrop-blur-md shadow-gold-glow">
            <Sparkles className="w-4 h-4 text-luxury-gold" />
            <span className="text-xs uppercase tracking-[0.2em] font-medium text-luxury-goldLight">
              Peachtree Corners & Norcross, GA
            </span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-luxury-ivory leading-[1.05]">
            VALUE WORTH <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold">
              DISCOVERING.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-luxury-muted font-light leading-relaxed">
            {STORE_INFO.supportingText}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/shop')}
              className="w-full sm:w-auto px-8 py-4 rounded-sm bg-gradient-to-r from-luxury-gold to-luxury-goldLight text-luxury-black font-semibold text-xs sm:text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-gold-glow flex items-center justify-center gap-2"
            >
              <span>Explore Merchandise</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={STORE_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-sm border border-luxury-gold/70 text-luxury-gold hover:bg-luxury-gold/10 hover:border-luxury-gold font-medium text-xs sm:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Visit Our Store</span>
            </a>
          </div>

          {/* Location Anchor */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-luxury-muted">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-luxury-gold" />
              7040 Jimmy Carter Blvd, Suite 4
            </span>
            <span className="hidden sm:inline text-luxury-borderSubtle">•</span>
            <a href={STORE_INFO.phone.telLink} className="flex items-center gap-1.5 hover:text-luxury-gold transition-colors">
              <Phone className="w-3.5 h-3.5 text-luxury-gold" />
              Direct Line: {STORE_INFO.phone.formatted}
            </a>
          </div>

        </div>
      </section>


      {/* 2. FEATURED CATEGORIES SECTION */}
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
                  <span>Browse Collection</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* 3. FEATURED MERCHANDISE SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-luxury-borderSubtle pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-luxury-gold">
              <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
              Demonstration Showcase
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-luxury-ivory">
              Featured Merchandise
            </h2>
            <p className="text-sm text-luxury-muted max-w-xl">
              Representative examples of fine jewelry, electronics, and tools routinely evaluated and offered at our Peachtree Corners location.
            </p>
          </div>

          <button
            onClick={() => navigate('/shop')}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-luxury-gold hover:text-luxury-goldLight transition-colors shrink-0"
          >
            <span>View All Inventory</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onInquireProduct={onInquireProduct}
            />
          ))}
        </div>

        {/* Demonstration Disclaimer Notice Banner */}
        <div className="p-4 rounded-sm bg-luxury-charcoal/60 border border-luxury-gold/25 text-xs text-luxury-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-luxury-gold shrink-0" />
            <span>
              <strong>Demonstration Notice:</strong> Products shown illustrate typical inventory categories. Contact the store at 678-691-1692 to verify current pieces.
            </span>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="px-4 py-1.5 rounded-sm bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30 uppercase tracking-wider text-[11px] font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all shrink-0"
          >
            Explore Shop
          </button>
        </div>
      </section>


      {/* 4. WHY VISIT US SECTION */}
      <section className="bg-luxury-charcoal/40 border-y border-luxury-borderSubtle py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-luxury-gold">
              In-Store Experience
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-luxury-ivory">
              Why Visit Peachtree Corners Loan & Pawn?
            </h2>
            <p className="text-sm text-luxury-muted">
              We provide a transparent, upscale environment for customers seeking value, rare merchandise, or professional collateral solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle hover:border-luxury-gold/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
                Discover Unique Merchandise
              </h3>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Explore an eclectic, ever-changing selection of authenticated gold jewelry, watches, modern electronics, and specialty goods you won't find at standard retail stores.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle hover:border-luxury-gold/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
                Changing Daily Inventory
              </h3>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Our inventory rotates continuously as new pieces and contractor equipment are evaluated. Frequent visits often reward customers with outstanding spontaneous finds.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle hover:border-luxury-gold/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
                Dedicated Store Team
              </h3>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Our in-store specialists provide straightforward, respectful assistance whether you are shopping, asking questions about collateral loans, or selling your items.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle hover:border-luxury-gold/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-sm bg-luxury-charcoal border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-xl font-semibold text-luxury-ivory">
                Accessible Location
              </h3>
              <p className="text-xs text-luxury-muted leading-relaxed">
                Centrally located on Jimmy Carter Boulevard in Suite 4, convenient for residents of Peachtree Corners, Norcross, Lilburn, and the greater Gwinnett corridor.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* 5. STORE VISIT & LOCATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-sm overflow-hidden border border-luxury-gold/30 bg-gradient-to-r from-luxury-black via-luxury-charcoal to-luxury-black p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-6">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-luxury-gold">
                Convenient Store Visit
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold text-luxury-ivory leading-tight">
                Visit Us on Jimmy Carter Boulevard
              </h2>
              <p className="text-sm text-luxury-muted leading-relaxed max-w-lg">
                We invite you to visit our store in person to inspect jewelry under magnification, test equipment, or discuss collateral services in a private, professional setting.
              </p>

              <div className="space-y-3 pt-2 text-sm text-luxury-ivory">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-luxury-goldLight font-medium">Store Address:</strong>
                    <span>{STORE_INFO.address.street}</span><br />
                    <span>{STORE_INFO.address.city}, {STORE_INFO.address.state} {STORE_INFO.address.zip}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-luxury-gold shrink-0" />
                  <div>
                    <strong className="block text-luxury-goldLight font-medium">Direct Telephone:</strong>
                    <a href={STORE_INFO.phone.telLink} className="hover:text-luxury-gold transition-colors">
                      {STORE_INFO.phone.formatted}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href={STORE_INFO.phone.telLink}
                  className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call the Store</span>
                </a>

                <a
                  href={STORE_INFO.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>

            {/* Storefront Visual & Map Preview Placeholder */}
            <div className="relative rounded-sm overflow-hidden border border-luxury-gold/20 shadow-2xl aspect-[4/3] bg-luxury-charcoal">
              <img
                src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80"
                alt="Peachtree Corners Loan and Pawn showroom showcase"
                className="w-full h-full object-cover brightness-[0.75]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/90 via-luxury-black/30 to-transparent flex flex-col justify-end p-6 space-y-2">
                <span className="text-xs uppercase tracking-wider text-luxury-gold font-semibold">
                  Suite 4 • Peachtree Corners, GA
                </span>
                <p className="text-xs text-luxury-muted">
                  Ample free parking available directly in front of the store. Call 678-691-1692 before visiting to confirm today's hours.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
