import React from 'react';
import { Eye, Phone, Sparkles } from 'lucide-react';
import { STORE_INFO } from '../data/storeInfo';

export default function ProductCard({ product, onSelectProduct, onInquireProduct }) {
  return (
    <div className="group relative bg-luxury-darkCard border border-luxury-borderSubtle hover:border-luxury-gold/50 rounded-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-gold-glow">
      
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-luxury-charcoal">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Demo Tag Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase bg-luxury-black/80 text-luxury-goldLight border border-luxury-gold/40 backdrop-blur-sm">
            <Sparkles className="w-2.5 h-2.5 text-luxury-gold" />
            Demo Item
          </span>
        </div>

        {/* Condition Tag */}
        {product.condition && (
          <div className="absolute top-2.5 right-2.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-luxury-charcoal/90 text-luxury-ivory border border-white/10 backdrop-blur-sm">
              {product.condition}
            </span>
          </div>
        )}

        {/* Quick View Overlay Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-luxury-black/30 backdrop-blur-[2px]">
          <button
            onClick={() => onSelectProduct(product)}
            className="px-4 py-2 bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider rounded-sm shadow-xl flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-luxury-gold uppercase tracking-wider font-medium mb-1">
            <span>{product.subcategory || product.category}</span>
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
              Est. In-Store Value
            </span>
            <span className="font-editorial text-base sm:text-lg font-bold text-luxury-gold">
              {product.estimatedValue}
            </span>
          </div>

          <button
            onClick={() => onSelectProduct(product)}
            className="text-xs uppercase tracking-wider font-semibold text-luxury-ivory hover:text-luxury-gold transition-colors underline-offset-4 hover:underline"
          >
            Details →
          </button>
        </div>
      </div>

    </div>
  );
}
