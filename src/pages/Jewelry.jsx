import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import ProductCard from '../components/ProductCard';
import { 
  Sparkles, 
  Watch, 
  Gem, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  Eye
} from 'lucide-react';

export default function Jewelry({ onSelectProduct, onInquireProduct }) {
  const { navigate } = useRouter();
  const { products } = useApp();
  const [selectedSubcat, setSelectedSubcat] = useState('all');

  const jewelryProducts = products.filter(p => p.category === 'jewelry' && p.status !== 'draft' && p.status !== 'archived');

  const filtered = selectedSubcat === 'all'
    ? jewelryProducts
    : jewelryProducts.filter(p => p.subcategory?.toLowerCase().includes(selectedSubcat.toLowerCase()));

  const subcategories = [
    { id: 'all', label: 'All Jewelry & Watches' },
    { id: 'watch', label: 'Luxury Watches' },
    { id: 'ring', label: 'Diamond Rings' },
    { id: 'chain', label: 'Gold Chains & Necklaces' },
    { id: 'bracelet', label: 'Bracelets & Bangles' },
  ];

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      
      {/* 1. LUXURY JEWELRY HERO BANNER */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden border-b border-luxury-borderSubtle">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=2000&q=85"
            alt="Luxury fine gold jewelry and diamond collection"
            className="w-full h-full object-cover object-center filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/70 to-luxury-black/40" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-luxury-gold/20 text-luxury-goldLight border border-luxury-gold/40 text-xs uppercase tracking-widest font-semibold backdrop-blur-md">
            <Gem className="w-3.5 h-3.5 text-luxury-gold" />
            Fine Jewelry & Timepieces
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-luxury-ivory leading-tight">
            EXCEPTIONAL CRAFT. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold via-luxury-goldLight to-luxury-gold">
              TIMELESS VALUE.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-luxury-muted leading-relaxed font-light">
            Explore our curated showcase of solid yellow and white gold chains, diamond solitaire rings, fine tennis bracelets, and Swiss-inspired automatic timepieces.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={STORE_INFO.phone.telLink}
              className="px-6 py-3.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-gold-glow flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call to Inquire: (678) 691-1692</span>
            </a>
            <a
              href={STORE_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Visit Showroom</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. JEWELRY CATEGORY FILTER PILLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-luxury-borderSubtle pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block">
              Department Browsing
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
              Jewelry & Watch Showcase
            </h2>
          </div>

          {/* Subcategory Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {subcategories.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcat(sub.id)}
                className={`px-3.5 py-1.5 rounded-sm text-xs uppercase tracking-wider transition-all ${
                  selectedSubcat === sub.id
                    ? 'bg-luxury-gold text-luxury-black font-semibold shadow-gold-glow'
                    : 'bg-luxury-charcoal text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demonstration Disclaimer */}
        <div className="p-3.5 rounded-sm bg-luxury-charcoal/50 border border-luxury-gold/25 text-xs text-luxury-muted flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
          <p>
            <strong className="text-luxury-gold font-medium">Demonstration Collection:</strong> All jewelry and timepiece items shown below are realistic demonstration catalog entries. We welcome visitors to visit our store at 7040 Jimmy Carter Blvd to examine our physical showcase under gemological magnification.
          </p>
        </div>

        {/* Jewelry Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onInquireProduct={onInquireProduct}
            />
          ))}
        </div>

      </section>

      {/* 3. IN-STORE JEWELRY EVALUATION INFORMATION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-luxury-darkCard border border-luxury-gold/30 rounded-sm p-8 sm:p-12">
          <div className="max-w-3xl space-y-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block">
              In-Person Evaluation
            </span>
            <h3 className="font-editorial text-3xl sm:text-4xl font-semibold text-luxury-ivory leading-tight">
              Selling or Pawning Fine Jewelry?
            </h3>
            <p className="text-sm text-luxury-muted leading-relaxed">
              At Peachtree Corners Loan & Pawn, we evaluate gold, platinum, diamonds, and luxury timepieces with care. Every piece is examined in person right before you, checking hallmarks, carat weight, stone settings, and mechanical condition.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-sm bg-luxury-charcoal/70 border border-luxury-borderSubtle space-y-2">
                <h4 className="text-sm font-semibold text-luxury-gold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
                  Precious Metals
                </h4>
                <p className="text-xs text-luxury-muted leading-relaxed">
                  We evaluate 10K, 14K, 18K, 22K, 24K gold, scrap gold, broken jewelry, bullion, and sterling silver based on current market dynamics.
                </p>
              </div>

              <div className="p-4 rounded-sm bg-luxury-charcoal/70 border border-luxury-borderSubtle space-y-2">
                <h4 className="text-sm font-semibold text-luxury-gold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-luxury-gold" />
                  Timepieces & Watches
                </h4>
                <p className="text-xs text-luxury-muted leading-relaxed">
                  We look at automatic movements, dial conditions, original paperwork, boxes, and links to evaluate your watch accurately.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/sell-to-us')}
                className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all"
              >
                Learn About Selling Jewelry
              </button>
              <button
                onClick={() => navigate('/pawn-loans')}
                className="px-6 py-3 rounded-sm border border-luxury-gold text-luxury-gold font-medium text-xs uppercase tracking-wider hover:bg-luxury-gold/10 transition-all"
              >
                Pawn Loan Information
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
