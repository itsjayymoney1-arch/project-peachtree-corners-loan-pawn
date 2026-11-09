import React, { useState, useMemo } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import ProductCard from '../components/ProductCard';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  Search, 
  Filter, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  SlidersHorizontal,
  X,
  Tag
} from 'lucide-react';

export default function NewArrivals({ onSelectProduct, onInquireProduct }) {
  const { products } = useApp();
  const { navigate } = useRouter();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { id: 'all', label: 'All New Arrivals' },
    { id: 'jewelry', label: 'Estate Jewelry & Watches' },
    { id: 'electronics', label: 'Electronics & Audio' },
    { id: 'tools', label: 'Contractor Tools' },
    { id: 'instruments', label: 'Musical Instruments' },
  ];

  // Filter products for new arrivals
  const newArrivals = useMemo(() => {
    return products.filter(p => {
      // Exclude draft or archived merchandise
      if (p.status === 'draft' || p.status === 'archived') return false;
      // Must be marked as new arrival
      if (!p.isNewArrival) return false;
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = p.title?.toLowerCase().includes(q);
        const mBrand = p.brand?.toLowerCase().includes(q);
        const mDesc = p.description?.toLowerCase().includes(q);
        const mSku = p.sku?.toLowerCase().includes(q);
        if (!mTitle && !mBrand && !mDesc && !mSku) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.dateAdded || b.createdAt) - new Date(a.dateAdded || a.createdAt);
      }
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-luxury-gold/15 text-luxury-goldLight border border-luxury-gold/30 text-xs uppercase tracking-widest font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
          Fresh Intakes &bull; Showroom Counter
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-luxury-ivory tracking-wide">
          NEW ARRIVALS
        </h1>
        <p className="text-sm sm:text-base text-luxury-muted">
          Our latest verified estate jewelry, Swiss timepieces, contractor power tools, and musical instruments cataloged directly from our appraisal counters in Peachtree Corners.
        </p>
      </div>

      {/* Demonstration Notice */}
      <div className="p-4 rounded-sm bg-luxury-charcoal/80 border border-luxury-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
          <p className="text-xs text-luxury-muted leading-relaxed">
            <strong className="text-luxury-goldLight uppercase tracking-wider block sm:inline mr-1">
              High Turnover Inventory:
            </strong>
            Merchandise in our new arrival section moves quickly. Most high-ticket items are one-of-a-kind estate pieces. Call our showroom at{' '}
            <a href={STORE_INFO.phone.telLink} className="text-luxury-gold hover:underline font-semibold">
              {STORE_INFO.phone.formatted}
            </a>{' '}
            to reserve or verify today's physical showcase availability.
          </p>
        </div>

        <a
          href={STORE_INFO.phone.telLink}
          className="shrink-0 px-4 py-2 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Showroom</span>
        </a>
      </div>

      {/* Search & Filtering Bar */}
      <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-luxury-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search new arrivals by brand, model, or category..."
              className="w-full pl-10 pr-10 py-2.5 bg-luxury-charcoal border border-luxury-borderSubtle focus:border-luxury-gold rounded-sm text-sm text-luxury-ivory placeholder-luxury-muted/60 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-luxury-ivory"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-luxury-muted whitespace-nowrap">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-luxury-charcoal border border-luxury-borderSubtle focus:border-luxury-gold rounded-sm px-3 py-2 text-xs text-luxury-ivory focus:outline-none"
            >
              <option value="newest">Most Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-luxury-borderSubtle/60">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-luxury-gold text-luxury-black font-bold shadow-sm'
                  : 'bg-luxury-charcoal/60 text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {newArrivals.length === 0 ? (
        <div className="text-center py-20 space-y-4 bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm">
          <p className="text-luxury-muted text-base">
            No new arrivals matching your search query.
          </p>
          <button
            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
            className="px-5 py-2 rounded-sm bg-luxury-charcoal border border-luxury-gold/40 text-luxury-gold text-xs uppercase tracking-wider font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-all"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-luxury-muted">
            <span>Showing <strong className="text-luxury-gold">{newArrivals.length}</strong> new arrivals</span>
            <span>Showroom: 7040 Jimmy Carter Blvd, Suite 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onInquire={onInquireProduct}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA to The Vault */}
      <div className="bg-gradient-to-r from-luxury-charcoal via-luxury-darkCard to-luxury-charcoal border border-luxury-gold/40 rounded-sm p-8 text-center space-y-4 shadow-luxury-card">
        <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-luxury-gold">
          LOOKING FOR OUR MOST EXCLUSIVE ESTATE PIECES?
        </h3>
        <p className="text-xs sm:text-sm text-luxury-muted max-w-xl mx-auto">
          Visit The Vault for rare vintage timepieces, certified diamond estate jewelry, and weekly drops released before reaching general showroom display.
        </p>
        <button
          onClick={() => navigate('/vault')}
          className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-gold-glow transition-all"
        >
          Enter The Vault
        </button>
      </div>

    </div>
  );
}