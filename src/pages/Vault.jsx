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
  ArrowRight, 
  Mail, 
  CheckCircle2, 
  SlidersHorizontal,
  X,
  AlertCircle,
  TrendingDown
} from 'lucide-react';

export default function Vault({ onSelectProduct, onInquireProduct }) {
  const { products, subscribeToVaultWeekly } = useApp();
  const { queryParams, navigate } = useRouter();

  // Filter states
  const [activeTab, setActiveTab] = useState(queryParams.tab || 'all'); // 'all', 'new_arrivals', 'weekly_drops', 'jewelry', 'electronics', 'tools', 'instruments'
  const [searchQuery, setSearchQuery] = useState(queryParams.search || '');
  const [sortBy, setSortBy] = useState('newest');

  // Newsletter Subscription Modal/Inline state
  const [subEmail, setSubEmail] = useState('');
  const [subFirstName, setSubFirstName] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);
  const [subError, setSubError] = useState('');

  // Tab definitions
  const tabs = [
    { id: 'all', label: 'All Vault Merchandise' },
    { id: 'new_arrivals', label: 'Just Came In (New Arrivals)', icon: Sparkles },
    { id: 'weekly_drops', label: 'Weekly Vault Drops', icon: Flame },
    { id: 'price_drops', label: 'Price Drops', icon: TrendingDown },
    { id: 'last_chance', label: 'Last Chance', icon: Flame },
    { id: 'recently_reduced', label: 'Recently Reduced', icon: Clock },
    { id: 'jewelry', label: 'Estate Jewelry & Watches' },
    { id: 'tools', label: 'Contractor Equipment' },
    { id: 'electronics', label: 'Inspected Tech' },
    { id: 'instruments', label: 'Guitars & Pro Sound' }
  ];

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Exclude draft or archived merchandise from customer view
      if (product.status === 'draft' || product.status === 'archived') {
        return false;
      }

      // Tab matching
      if (activeTab === 'new_arrivals' && !product.isNewArrival) return false;
      if (activeTab === 'weekly_drops' && !product.isVaultDrop) return false;
      if (activeTab === 'jewelry' && product.category !== 'jewelry') return false;
      if (activeTab === 'tools' && product.category !== 'tools') return false;
      if (activeTab === 'electronics' && product.category !== 'electronics') return false;
      if (activeTab === 'instruments' && product.category !== 'instruments') return false;
      if (activeTab === 'price_drops' && !(product.currentDiscountPercent > 0)) return false;
      if (activeTab === 'last_chance' && !(product.currentDiscountPercent >= 20)) return false;
      if (activeTab === 'recently_reduced' && !(product.currentDiscountPercent >= 5 && product.currentDiscountPercent < 20)) return false;

      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = product.title?.toLowerCase().includes(q);
        const brandMatch = product.brand?.toLowerCase().includes(q);
        const descMatch = product.description?.toLowerCase().includes(q);
        const skuMatch = product.sku?.toLowerCase().includes(q);
        const tagMatch = product.tags?.some(t => t.toLowerCase().includes(q));
        if (!titleMatch && !brandMatch && !descMatch && !skuMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.dateAdded || b.createdAt) - new Date(a.dateAdded || a.createdAt);
      }
      if (sortBy === 'price-low') {
        return a.price - b.price;
      }
      if (sortBy === 'price-high') {
        return b.price - a.price;
      }
      if (sortBy === 'featured') {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      return 0;
    });
  }, [products, activeTab, searchQuery, sortBy]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubError('');
    try {
      if (!subEmail || !subEmail.includes('@')) {
        throw new Error("Please enter a valid email address.");
      }
      await subscribeToVaultWeekly({
        email: subEmail,
        firstName: subFirstName,
        consentEmail: true,
        consentSms: false
      });
      setSubSuccess(true);
      setSubEmail('');
      setSubFirstName('');
    } catch (err) {
      setSubError(err.message || 'Subscription failed.');
    }
  };

  return (
    <div className="space-y-12 pb-20 animate-fadeIn">
      
      {/* 1. VAULT HERO / DROP COUNTDOWN HEADER */}
      <section className="relative bg-luxury-black border-b border-luxury-gold/30 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-luxury-gold/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-luxury-charcoal/90 border border-luxury-gold/40 shadow-gold-glow">
            <Flame className="w-4 h-4 text-luxury-gold" />
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-luxury-goldLight">
              THE VAULT &bull; LIVE RETAIL SHOWROOM
            </span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-luxury-ivory leading-none">
            JUST CAME IN.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-luxury-muted font-light leading-relaxed">
            "Discover what's new before somebody else does."
          </p>

          <p className="text-xs sm:text-sm text-luxury-muted/90 max-w-xl mx-auto">
            Live authentic merchandise cataloged straight from our 7040 Jimmy Carter Blvd facility. Every piece is photographed, inspected, and priced for immediate showroom sale or online acquisition.
          </p>

          {/* Quick Drop Pulse Indicator */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-luxury-goldLight">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-luxury-ivory">Live Inventory Sync</span>
            </div>
            <span className="text-luxury-border">&bull;</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-luxury-gold" />
              <span>Next Weekly Drop: <strong>Saturday 10:00 AM EST</strong></span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. THE VAULT WEEKLY PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-luxury-black via-luxury-charcoal to-luxury-black border border-luxury-gold/40 rounded-sm p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-luxury-card">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-luxury-gold">
              THE VAULT WEEKLY
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-luxury-ivory">
              THE BEST FINDS DON'T STAY SECRET.
            </h2>
            <p className="text-xs text-luxury-muted max-w-md">
              Get first looks at new arrivals, featured weekly drops, and rare estate jewelry before it is announced to the general public.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0">
            {subSuccess ? (
              <div className="flex items-center gap-2 p-3 rounded bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>You're on the Vault VIP list! Check your inbox for confirmation.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="First Name (optional)"
                    value={subFirstName}
                    onChange={(e) => setSubFirstName(e.target.value)}
                    className="bg-luxury-black border border-luxury-borderSubtle rounded-sm px-3 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none w-full sm:w-36"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    className="bg-luxury-black border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none w-full sm:w-56"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-md shrink-0"
                  >
                    Subscribe Free
                  </button>
                </div>
                {subError && (
                  <p className="text-[11px] text-red-400">{subError}</p>
                )}
                <p className="text-[10px] text-luxury-muted text-center sm:text-left">
                  Explicit consent required. Unsubscribe at any time. We never share your data.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3. FILTER CONTROLS & SEARCH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Search & Sort Bar */}
        <div className="bg-luxury-darkCard border border-luxury-borderSubtle p-4 rounded-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-gold" />
            <input
              type="text"
              placeholder="Search by brand, model, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm pl-10 pr-8 py-2 text-xs text-luxury-ivory placeholder-luxury-muted focus:border-luxury-gold outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-luxury-ivory"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-luxury-muted hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
            >
              <option value="newest">Recently Cataloged (Newest)</option>
              <option value="featured">Featured Drops First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap gap-2 pb-2">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-sm text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-luxury-gold text-luxury-black shadow-gold-glow'
                    : 'bg-luxury-charcoal/80 text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle hover:border-luxury-gold/40'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Counter & Fast-Moving Stock Alert */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-luxury-muted border-b border-luxury-borderSubtle pb-3">
          <p>
            Displaying <strong className="text-luxury-goldLight">{filteredProducts.length}</strong> items in The Vault
            {activeTab !== 'all' && ` (${tabs.find(t => t.id === activeTab)?.label})`}
          </p>

          <div className="flex items-center gap-2 text-luxury-gold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-medium tracking-wide">
              Fast Moving Stock &bull; Items held for counter pickup or instant purchase
            </span>
          </div>
        </div>

        {/* 4. PRODUCTS SHOWCASE GRID */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onInquireProduct={onInquireProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-luxury-charcoal flex items-center justify-center text-luxury-muted">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-editorial text-2xl font-semibold text-luxury-ivory">
              No Vault Merchandise Found
            </h3>
            <p className="text-xs text-luxury-muted max-w-sm mx-auto">
              No published items currently match your chosen criteria. Check back soon or call our showroom directly at {STORE_INFO.phone.formatted}.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="px-5 py-2 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        )}

      </section>

      {/* 5. IN-STORE EVALUATION CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-8 sm:p-10 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">
            Peachtree Corners &bull; Norcross &bull; Gwinnett County
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
            Have High-End Merchandise to Sell or Consign?
          </h3>
          <p className="text-xs sm:text-sm text-luxury-muted max-w-xl mx-auto leading-relaxed">
            We actively acquire verified estate gold jewelry, Rolex &amp; Swiss timepieces, professional cordless tool kits, and vintage guitars. Walk-ins always welcome for private appraisals.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/sell-to-us')}
              className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider hover:brightness-110"
            >
              Sell Your Merchandise
            </button>
            <a
              href={STORE_INFO.phone.telLink}
              className="px-6 py-3 rounded-sm border border-luxury-gold text-luxury-gold font-medium text-xs uppercase tracking-wider hover:bg-luxury-gold/10"
            >
              Call {STORE_INFO.phone.formatted}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
