import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import ProductCard from '../components/ProductCard';
import { 
  Wrench, 
  Hammer, 
  Sparkles, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  HardHat, 
  Gauge
} from 'lucide-react';

export default function Tools({ onSelectProduct, onInquireProduct }) {
  const { navigate } = useRouter();
  const { products } = useApp();
  const [selectedSubcat, setSelectedSubcat] = useState('all');

  const toolProducts = products.filter(p => p.category === 'tools' && p.status !== 'draft' && p.status !== 'archived');

  const filtered = selectedSubcat === 'all'
    ? toolProducts
    : toolProducts.filter(p => p.subcategory?.toLowerCase().includes(selectedSubcat.toLowerCase()));

  const subcategories = [
    { id: 'all', label: 'All Tools' },
    { id: 'power', label: 'Power Tool Kits' },
    { id: 'saw', label: 'Power Saws & Miter' },
    { id: 'diagnostic', label: 'Laser & Diagnostic' },
    { id: 'pneumatic', label: 'Compressors & Pneumatics' },
  ];

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      
      {/* 1. HERO BANNER */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-b border-luxury-borderSubtle">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=2000&q=85"
            alt="Contractor grade cordless power tools and equipment"
            className="w-full h-full object-cover object-center filter brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/75 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-14 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-luxury-gold/20 text-luxury-goldLight border border-luxury-gold/40 text-xs uppercase tracking-widest font-semibold backdrop-blur-md">
            <HardHat className="w-3.5 h-3.5 text-luxury-gold" />
            Contractor & Workshop Equipment
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-luxury-ivory">
            PROFESSIONAL TOOLS & EQUIPMENT
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-luxury-muted font-light leading-relaxed">
            Reliable brushless cordless combo kits, heavy-duty sliding miter saws, self-leveling laser guides, and workshop compressors at substantial savings compared to big-box retail.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={STORE_INFO.phone.telLink}
              className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call (678) 691-1692</span>
            </a>
            <a
              href={STORE_INFO.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Directions to Store</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. DEMONSTRATION NOTICE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-sm bg-luxury-charcoal/80 border border-luxury-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
            <p className="text-xs text-luxury-muted leading-relaxed">
              <strong className="text-luxury-gold font-semibold uppercase tracking-wider block sm:inline mr-1">
                Demonstration Tool Inventory:
              </strong>
              Items shown demonstrate typical contractor-grade inventory categories regularly found at our Peachtree Corners location. Please call 678-691-1692 to confirm current brands and battery platforms in stock.
            </p>
          </div>
        </div>
      </section>

      {/* 3. TOOL CATEGORIES & GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-luxury-borderSubtle pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block">
              Equipment Categories
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
              Commercial Grade Gear
            </h2>
          </div>

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

        {/* Tools Products Grid */}
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

      {/* 4. CONTRACTOR INFORMATION CARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 sm:p-10 space-y-4">
          <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
            Selling Surplus Tools or Upgrading Your Rig?
          </h3>
          <p className="text-sm text-luxury-muted leading-relaxed max-w-3xl">
            Whether you are a tradesperson looking to sell surplus tools or a homeowner tackling weekend renovations, Peachtree Corners Loan & Pawn provides straightforward appraisals and competitive pricing on commercial power tools, laser levels, and air equipment.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/sell-to-us')}
              className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
            >
              Sell Your Tools Today
            </button>
            <button
              onClick={() => navigate('/pawn-loans')}
              className="px-6 py-3 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-wider"
            >
              Pawn Loan On Tools
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
