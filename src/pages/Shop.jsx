import React, { useState, useMemo } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/inventory';
import { STORE_INFO } from '../data/storeInfo';
import ProductCard from '../components/ProductCard';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Phone, 
  MapPin, 
  SlidersHorizontal,
  X,
  ChevronDown
} from 'lucide-react';

export default function Shop({ onSelectProduct, onInquireProduct }) {
  const { queryParams, navigate } = useRouter();
  const { products } = useApp();

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState(queryParams.category || 'all');
  const [searchQuery, setSearchQuery] = useState(queryParams.search || '');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all'); // 'all', 'under-150', '150-500', '500-1000', 'over-1000'

  // Filter categories list
  const categoryFilters = [
    { id: 'all', label: 'All Departments' },
    { id: 'jewelry', label: 'Jewelry & Watches' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'tools', label: 'Tools & Equipment' },
    { id: 'instruments', label: 'Musical Instruments' },
    { id: 'collectibles', label: 'Collectibles' },
  ];

  // Price range options
  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-150', label: 'Under $150' },
    { id: '150-500', label: '$150 – $500' },
    { id: '500-1000', label: '$500 – $1,000' },
    { id: 'over-1000', label: '$1,000+' },
  ];

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Exclude draft or archived merchandise from customer view
      if (product.status === 'draft' || product.status === 'archived') {
        return false;
      }
      // Category match
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Price range match
      const price = product.price || 0;
      if (priceRange === 'under-150' && price >= 150) return false;
      if (priceRange === '150-500' && (price < 150 || price > 500)) return false;
      if (priceRange === '500-1000' && (price < 500 || price > 1000)) return false;
      if (priceRange === 'over-1000' && price <= 1000) return false;

      // Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = product.title?.toLowerCase().includes(query);
        const subMatch = product.subcategory?.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        const brandMatch = product.brand?.toLowerCase().includes(query);
        if (!titleMatch && !subMatch && !descMatch && !brandMatch) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'featured') {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setPriceRange('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      
      {/* Editorial Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-luxury-gold/15 text-luxury-goldLight border border-luxury-gold/30 text-xs uppercase tracking-widest font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
          Demonstration Inventory Catalog
        </div>
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-luxury-ivory tracking-wide">
          DISCOVER OUR SHOWROOM
        </h1>
        <p className="text-sm sm:text-base text-luxury-muted">
          Browse our representative catalog of inspected fine jewelry, Swiss and luxury watches, contractor tools, audio gear, and electronics.
        </p>
      </div>

      {/* Demonstration Disclaimer Bar */}
      <div className="p-4 rounded-sm bg-luxury-charcoal/80 border border-luxury-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-luxury-gold shrink-0 mt-0.5" />
          <p className="text-xs text-luxury-muted leading-relaxed">
            <strong className="text-luxury-goldLight uppercase tracking-wider block sm:inline mr-1">
              Demonstration Notice:
            </strong>
            Items listed below represent typical in-store merchandise categories. Because physical store inventory turns over continuously, please contact Peachtree Corners Loan & Pawn at{' '}
            <a href={STORE_INFO.phone.telLink} className="text-luxury-gold hover:underline font-semibold">
              {STORE_INFO.phone.formatted}
            </a>{' '}
            to verify today's in-store availability.
          </p>
        </div>

        <a
          href={STORE_INFO.phone.telLink}
          className="shrink-0 px-4 py-2 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 transition-all flex items-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Store</span>
        </a>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-4 sm:p-6 space-y-4">
        
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-luxury-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g., gold chain, watch, DeWalt, guitar)..."
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

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-luxury-muted whitespace-nowrap">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm text-xs uppercase tracking-wider text-luxury-ivory focus:outline-none focus:border-luxury-gold transition-colors"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Est. Value: Low to High</option>
              <option value="price-high">Est. Value: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-luxury-borderSubtle">
          {categoryFilters.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-sm text-xs uppercase tracking-wider font-medium transition-all ${
                  isSelected
                    ? 'bg-luxury-gold text-luxury-black font-semibold shadow-gold-glow'
                    : 'bg-luxury-charcoal text-luxury-muted hover:text-luxury-ivory hover:bg-luxury-charcoal/80 border border-luxury-borderSubtle'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Active Results Summary */}
      <div className="flex items-center justify-between text-xs text-luxury-muted">
        <span>
          Showing <strong className="text-luxury-goldLight">{filteredProducts.length}</strong> demonstration items
          {selectedCategory !== 'all' && ` in ${categoryFilters.find(c => c.id === selectedCategory)?.label}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>

        {(selectedCategory !== 'all' || searchQuery || sortBy !== 'featured') && (
          <button
            onClick={clearFilters}
            className="text-luxury-gold hover:underline flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onInquireProduct={onInquireProduct}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-luxury-charcoal flex items-center justify-center text-luxury-muted">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-editorial text-2xl font-semibold text-luxury-ivory">
            No Matching Demonstration Items Found
          </h3>
          <p className="text-sm text-luxury-muted max-w-md mx-auto">
            We couldn't find any demonstration inventory matching your criteria. Try adjusting your search query or selecting a different category.
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* In-Store Inquiry Card */}
      <div className="bg-gradient-to-r from-luxury-black via-luxury-charcoal to-luxury-black border border-luxury-gold/30 rounded-sm p-8 text-center space-y-4">
        <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory">
          Looking for Something Specific?
        </h3>
        <p className="text-sm text-luxury-muted max-w-xl mx-auto">
          Our store receives new merchandise daily. Give us a call or visit in person on Jimmy Carter Blvd — we are happy to check our current inventory for you!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={STORE_INFO.phone.telLink}
            className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
          >
            Call {STORE_INFO.phone.formatted}
          </a>
          <button
            onClick={() => navigate('/contact')}
            className="px-6 py-3 rounded-sm border border-luxury-gold text-luxury-gold font-medium text-xs uppercase tracking-wider hover:bg-luxury-gold/10"
          >
            Contact & Location Details
          </button>
        </div>
      </div>

    </div>
  );
}
