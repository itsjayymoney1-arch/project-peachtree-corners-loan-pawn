import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { DEMO_PRODUCTS } from '../data/inventory';
import { STORE_INFO } from '../data/storeInfo';
import ProductCard from '../components/ProductCard';
import { 
  Music, 
  Sparkles, 
  Phone, 
  MapPin, 
  Mic, 
  Volume2, 
  Radio
} from 'lucide-react';

export default function MusicalInstruments({ onSelectProduct, onInquireProduct }) {
  const { navigate } = useRouter();
  const [selectedSubcat, setSelectedSubcat] = useState('all');

  const instProducts = DEMO_PRODUCTS.filter(p => p.category === 'instruments');

  const filtered = selectedSubcat === 'all'
    ? instProducts
    : instProducts.filter(p => p.subcategory?.toLowerCase().includes(selectedSubcat.toLowerCase()));

  const subcategories = [
    { id: 'all', label: 'All Instruments' },
    { id: 'guitar', label: 'Guitars (Electric & Acoustic)' },
    { id: 'keyboard', label: 'Keyboards & Pianos' },
    { id: 'amplifier', label: 'Amplifiers & Cabs' },
  ];

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      
      {/* 1. HERO BANNER */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-b border-luxury-borderSubtle">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=2000&q=85"
            alt="Electric and acoustic guitars in music studio setting"
            className="w-full h-full object-cover object-center filter brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/75 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-14 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-luxury-gold/20 text-luxury-goldLight border border-luxury-gold/40 text-xs uppercase tracking-widest font-semibold backdrop-blur-md">
            <Music className="w-3.5 h-3.5 text-luxury-gold" />
            Strings, Keys & Studio Gear
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-luxury-ivory">
            MUSICAL INSTRUMENTS & PRO AUDIO
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-luxury-muted font-light leading-relaxed">
            Discover tone-rich electric and acoustic guitars, weighted stage pianos, tube combo amplifiers, and sound equipment ready for the studio or stage.
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
              <span>Visit Showroom</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. DEMONSTRATION NOTICE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-sm bg-luxury-charcoal/80 border border-luxury-gold/30 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
          <p className="text-xs text-luxury-muted leading-relaxed">
            <strong className="text-luxury-gold font-semibold uppercase tracking-wider block sm:inline mr-1">
              Demonstration Collection:
            </strong>
            The instruments shown illustrate the standard audio and instrument categories we handle. We invite musicians to visit 7040 Jimmy Carter Blvd to play, inspect neck straightness, and test amplifiers in person.
          </p>
        </div>
      </section>

      {/* 3. INSTRUMENTS CATEGORIES & GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-luxury-borderSubtle pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block">
              Music Department
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
              Guitars, Keys & Amplifiers
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

        {/* Instruments Grid */}
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

      {/* 4. SELLING OR PAWNING GEAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 sm:p-10 space-y-4">
          <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
            Have Gear You Want to Sell?
          </h3>
          <p className="text-sm text-luxury-muted leading-relaxed max-w-3xl">
            We evaluate solid-body guitars, vintage tube amps, studio microphones, audio interfaces, and digital keyboards. Bring your instrument into our store with its case and accessories for an honest, in-person assessment.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/sell-to-us')}
              className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
            >
              Sell Your Musical Equipment
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-wider"
            >
              Contact Store Team
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
