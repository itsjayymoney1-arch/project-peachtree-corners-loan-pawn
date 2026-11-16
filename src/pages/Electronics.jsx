import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import ProductCard from '../components/ProductCard';
import { 
  Laptop, 
  Smartphone, 
  Headphones, 
  Gamepad2, 
  Tv, 
  Sparkles, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';

export default function Electronics({ onSelectProduct, onInquireProduct }) {
  const { navigate } = useRouter();
  const { products } = useApp();
  const [selectedSubcat, setSelectedSubcat] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const elecProducts = products.filter(p => p.category === 'electronics' && p.status !== 'draft' && p.status !== 'archived');

  const filtered = elecProducts.filter(p => {
    if (selectedSubcat !== 'all' && !p.subcategory?.toLowerCase().includes(selectedSubcat.toLowerCase())) {
      return false;
    }
    const price = p.price || 0;
    if (priceRange === 'under-100' && price >= 100) return false;
    if (priceRange === '100-300' && (price < 100 || price > 300)) return false;
    if (priceRange === '300-600' && (price < 300 || price > 600)) return false;
    if (priceRange === 'over-600' && price <= 600) return false;
    return true;
  });

  const subcategories = [
    { id: 'all', label: 'All Electronics' },
    { id: 'laptop', label: 'Computers & Laptops' },
    { id: 'phone', label: 'Phones & Mobile' },
    { id: 'audio', label: 'Audio & Headphones' },
    { id: 'gaming', label: 'Gaming Consoles' },
    { id: 'camera', label: 'Cameras & Video' },
  ];

  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-100', label: 'Under $100' },
    { id: '100-300', label: '$100 – $300' },
    { id: '300-600', label: '$300 – $600' },
    { id: 'over-600', label: '$600+' },
  ];

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      
      {/* 1. HERO BANNER */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden border-b border-luxury-borderSubtle">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=2000&q=85"
            alt="Modern premium electronics, laptops, and audio gear"
            className="w-full h-full object-cover object-center filter brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/75 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-14 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-luxury-gold/20 text-luxury-goldLight border border-luxury-gold/40 text-xs uppercase tracking-widest font-semibold backdrop-blur-md">
            <Cpu className="w-3.5 h-3.5 text-luxury-gold" />
            Tested Tech & Entertainment
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-luxury-ivory">
            PREMIUM ELECTRONICS & COMPUTING
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-luxury-muted font-light leading-relaxed">
            From modern performance laptops and unlocked smartphones to noise-canceling audio equipment and high-definition gaming gear.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={STORE_INFO.phone.telLink}
              className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call (678) 691-1692</span>
            </a>
            <button
              onClick={() => navigate('/sell-to-us')}
              className="px-6 py-3 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-wider transition-all"
            >
              Sell Your Electronics
            </button>
          </div>
        </div>
      </section>

      {/* 2. DEMONSTRATION & DAILY AVAILABILITY NOTICE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-sm bg-luxury-charcoal/80 border border-luxury-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
            <p className="text-xs text-luxury-muted leading-relaxed">
              <strong className="text-luxury-gold font-semibold uppercase tracking-wider block sm:inline mr-1">
                Notice On Inventory Availability:
              </strong>
              Electronics availability changes daily as items are bought and sold. All items below are demonstration representations. Please contact our Peachtree Corners store to verify current items and exact specifications before traveling.
            </p>
          </div>

          <a
            href={STORE_INFO.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2 rounded-sm border border-luxury-gold/60 text-luxury-gold text-xs uppercase tracking-wider font-semibold hover:bg-luxury-gold/10 transition-all flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Store Directions</span>
          </a>
        </div>
      </section>

      {/* 3. ELECTRONICS SUBCATEGORY FILTER & PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-luxury-borderSubtle pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold block">
              Device Catalog
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
              Inspected Electronics
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            <div className="flex items-center gap-2 pl-2 border-l border-luxury-borderSubtle">
              <span className="text-[11px] uppercase tracking-wider text-luxury-muted whitespace-nowrap">Price:</span>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-2.5 py-1.5 bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm text-xs text-luxury-ivory focus:outline-none focus:border-luxury-gold"
              >
                {priceRanges.map(pr => (
                  <option key={pr.id} value={pr.id}>{pr.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
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

      {/* 4. DIAGNOSTIC & DEVICE TESTING COMMITMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 sm:p-10 space-y-6">
          <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
            Our Inspection & Testing Process
          </h3>
          <p className="text-sm text-luxury-muted leading-relaxed max-w-3xl">
            We understand purchasing pre-owned electronics requires confidence. Whenever possible, our team powers on, cleans, and diagnostic-tests electronics before placing them in our showroom. We verify charging capabilities, battery health status, and ensure all previous owner account data is thoroughly factory wiped.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-sm bg-luxury-charcoal/60 border border-luxury-borderSubtle space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-gold block">
                Factory Reset & Data Wipe
              </span>
              <p className="text-xs text-luxury-muted">
                All cloud accounts (iCloud, Google, Windows) are verified removed prior to evaluation.
              </p>
            </div>

            <div className="p-4 rounded-sm bg-luxury-charcoal/60 border border-luxury-borderSubtle space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-gold block">
                Hardware & Ports Verified
              </span>
              <p className="text-xs text-luxury-muted">
                Buttons, speakers, cameras, touchscreens, and charging ports are physically verified.
              </p>
            </div>

            <div className="p-4 rounded-sm bg-luxury-charcoal/60 border border-luxury-borderSubtle space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-luxury-gold block">
                In-Store Hands-On Testing
              </span>
              <p className="text-xs text-luxury-muted">
                Visitors are encouraged to handle and test gear on-site before making any decision.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
