import React from 'react';
import { Eye, ShoppingBag, Sparkles, Check, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductCard({ product, onSelectProduct, onInquireProduct }) {
  const { addToCart } = useApp();

  const isSold = product.status === 'sold';
  const isReserved = product.status === 'reserved';
  const displayPrice = product.price 
    ? `$${product.price.toLocaleString()}` 
    : (product.estimatedValue || '$0');

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isSold || isReserved) return;
    try {
      addToCart(product, 1);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={`group relative bg-luxury-darkCard border rounded-sm overflow-hidden flex flex-col transition-all duration-300 ${
      isSold 
        ? 'border-white/5 opacity-70 grayscale-[20%]' 
        : 'border-luxury-borderSubtle hover:border-luxury-gold/60 hover:shadow-gold-glow'
    }`}>
      
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-luxury-charcoal">
        <img
          src={product.primaryImage || product.images?.[0] || product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/85 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Status Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isSold ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-red-950/90 text-red-300 border border-red-700/50 backdrop-blur-sm">
              Sold Out
            </span>
          ) : isReserved ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-950/90 text-amber-300 border border-amber-600/50 backdrop-blur-sm">
              <Clock className="w-2.5 h-2.5" />
              Reserved
            </span>
          ) : product.isVaultDrop ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-luxury-gold/90 text-luxury-black border border-luxury-goldLight shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              Vault Drop
            </span>
          ) : product.isNewArrival ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase bg-luxury-black/80 text-luxury-goldLight border border-luxury-gold/40 backdrop-blur-sm">
              Just Came In
            </span>
          ) : null}

          {product.brand && (
            <span className="text-[9px] uppercase tracking-widest text-luxury-ivory/80 font-mono bg-luxury-black/60 px-2 py-0.5 rounded-sm backdrop-blur-sm w-fit border border-white/5">
              {product.brand}
            </span>
          )}
        </div>

        {/* Condition Tag */}
        {product.condition && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-luxury-charcoal/90 text-luxury-ivory border border-white/10 backdrop-blur-sm">
              {product.condition}
            </span>
          </div>
        )}

        {/* Quick View & Add to Cart Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-luxury-black/40 backdrop-blur-[2px] p-4">
          <button
            onClick={() => onSelectProduct(product)}
            className="px-3 py-2 bg-luxury-charcoal border border-luxury-gold/50 text-luxury-ivory hover:text-luxury-gold font-medium text-xs uppercase tracking-wider rounded-sm shadow-xl flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all"
            title="Inspect full details and specifications"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Details</span>
          </button>

          {!isSold && !isReserved && (
            <button
              onClick={handleQuickAdd}
              className="px-3.5 py-2 bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider rounded-sm shadow-xl flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all"
              title="Add to Shopping Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-luxury-gold uppercase tracking-wider font-medium mb-1">
            <span>{product.subcategory || product.category}</span>
            {product.sku && (
              <span className="text-[10px] text-luxury-muted font-mono">{product.sku}</span>
            )}
          </div>

          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-editorial text-base sm:text-lg font-medium text-luxury-ivory group-hover:text-luxury-goldLight transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {product.title}
          </h3>
        </div>

        <div className="pt-2 border-t border-luxury-borderSubtle flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-luxury-muted block">
              {isSold ? 'Sold Price' : 'Store Price'}
            </span>
            <span className={`font-editorial text-lg sm:text-xl font-bold ${isSold ? 'text-luxury-muted line-through' : 'text-luxury-gold'}`}>
              {displayPrice}
            </span>
          </div>

          {!isSold && !isReserved ? (
            <button
              onClick={handleQuickAdd}
              className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-luxury-gold hover:text-luxury-goldLight transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy Now</span>
            </button>
          ) : (
            <span className="text-xs text-luxury-muted font-medium uppercase tracking-wider">
              {isSold ? 'Unavailable' : 'On Hold'}
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
