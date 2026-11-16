import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  MapPin, 
  Sparkles, 
  ShoppingBag, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { STORE_INFO } from '../data/storeInfo';
import { useApp } from '../context/AppContext';

export default function ProductModal({ product, onClose, onInquire }) {
  const { addToCart } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!product) return null;

  const images = product.images?.length 
    ? product.images 
    : [product.primaryImage || product.image];

  const isSold = product.status === 'sold';
  const isReserved = product.status === 'reserved';
  const hasDiscount = (product.currentDiscountPercent ?? 0) > 0;
  const pct = product.currentDiscountPercent ?? 0;
  const discountLabel = pct >= 20 ? 'LAST CHANCE'
                      : pct >= 15 ? 'VAULT PRICE DROP'
                      : pct >= 5  ? 'RECENTLY REDUCED'
                      : null;
  const currentPriceFormatted = product.price != null
    ? `$${product.price.toLocaleString()}`
    : (product.estimatedValue || '$0');
  const originalPriceFormatted = product.originalApprovedPrice != null
    ? `$${product.originalApprovedPrice.toLocaleString()}`
    : currentPriceFormatted;
  const displayPrice = currentPriceFormatted;

  const handleAddToCart = () => {
    if (isSold || isReserved) return;
    try {
      addToCart(product, 1);
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-luxury-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-luxury-darkCard border border-luxury-gold/40 rounded-sm shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-luxury-black/80 border border-luxury-gold/30 text-luxury-ivory hover:text-luxury-gold hover:border-luxury-gold transition-colors focus:outline-none"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Product Image Section */}
          <div className="relative bg-luxury-charcoal flex flex-col justify-between overflow-hidden">
            <div className="relative aspect-square w-full">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/70 via-transparent to-transparent md:hidden" />
              
              {/* Status Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                {isSold ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-950/90 text-red-300 border border-red-700/60 backdrop-blur-sm">
                    Sold Out
                  </span>
                ) : isReserved ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950/90 text-amber-300 border border-amber-600/60 backdrop-blur-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Currently Reserved
                  </span>
                ) : product.isVaultDrop ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-luxury-gold text-luxury-black border border-luxury-goldLight shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-luxury-black" />
                    Vault Drop
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-luxury-black/90 text-luxury-goldLight border border-luxury-gold/40 backdrop-blur-sm">
                    Verified In-Store
                  </span>
                )}
              </div>

              {/* Image Carousel Controls if multiple images */}
              {images.length > 1 && (
                <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="p-1.5 rounded-full bg-luxury-black/70 text-luxury-ivory hover:text-luxury-gold pointer-events-auto border border-white/10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="p-1.5 rounded-full bg-luxury-black/70 text-luxury-ivory hover:text-luxury-gold pointer-events-auto border border-white/10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="p-3 bg-luxury-black/90 flex gap-2 overflow-x-auto border-t border-luxury-borderSubtle">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 shrink-0 rounded-sm overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-luxury-gold shadow-gold-glow' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Specs Section */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
                  {product.subcategory || product.category}
                </span>
                <span className="text-xs text-luxury-muted font-mono">
                  {product.sku || 'PC-VAULT'}
                </span>
              </div>

              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory leading-tight">
                {product.title}
              </h2>

              {/* Price Banner */}
              <div className="p-3.5 rounded-sm bg-luxury-charcoal/80 border border-luxury-gold/30 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-luxury-muted block">
                    {isSold ? 'Sold Price' : 'Actual Store Price'}
                  </span>
                  {hasDiscount && !isSold ? (
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2.5 flex-wrap">
                        <span className="font-editorial text-3xl font-bold text-luxury-gold">{currentPriceFormatted}</span>
                        <span className="text-luxury-muted text-sm line-through">{originalPriceFormatted}</span>
                        <span className="px-2 py-0.5 text-xs font-bold uppercase rounded-full bg-emerald-900/90 text-emerald-300 border border-emerald-600/50">
                          −{pct}%
                        </span>
                      </div>
                      {discountLabel && (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-900/70 text-emerald-400 border border-emerald-600/40">
                          {discountLabel}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className={`font-editorial text-3xl font-bold ${isSold ? 'text-luxury-muted line-through' : 'text-luxury-gold'}`}>
                      {displayPrice}
                    </span>
                  )}
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-luxury-muted block">
                    Showroom Stock
                  </span>
                  <span className="text-xs font-semibold text-luxury-ivory">
                    {isSold ? '0 in stock' : `${product.quantity || 1} Available`}
                  </span>
                </div>
              </div>

              {/* Condition & Brand Badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="p-2 rounded bg-luxury-charcoal border border-luxury-borderSubtle flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-luxury-gold" />
                  <span>Condition: <strong>{product.condition}</strong></span>
                </div>
                {product.brand && (
                  <div className="p-2 rounded bg-luxury-charcoal border border-luxury-borderSubtle flex items-center gap-1.5">
                    <span>Brand: <strong>{product.brand}</strong></span>
                  </div>
                )}
              </div>

              <p className="text-sm text-luxury-muted leading-relaxed">
                {product.description}
              </p>

              {/* Specifications List */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-luxury-borderSubtle">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-luxury-gold">
                    Item Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="p-2 rounded bg-luxury-charcoal/40 border border-luxury-borderSubtle">
                        <span className="text-luxury-muted block text-[11px]">{key}</span>
                        <span className="text-luxury-ivory font-medium mt-0.5 block">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification & Pickup Note */}
              <div className="p-3 rounded-sm bg-luxury-gold/10 border border-luxury-gold/30 text-xs text-luxury-goldLight flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
                <p>
                  Available for immediate online purchase with secure in-store counter pickup at 7040 Jimmy Carter Blvd or insured shipping. Call (678) 691-1692 for questions.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-luxury-borderSubtle space-y-3">
              {!isSold && !isReserved ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md text-center"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  <a
                    href={STORE_INFO.phone.telLink}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-wider transition-all text-center"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Store</span>
                  </a>
                </div>
              ) : (
                <div className="p-3 text-center bg-luxury-charcoal border border-white/10 rounded-sm">
                  <p className="text-xs text-luxury-muted">
                    This item has been {isSold ? 'sold' : 'reserved'}. Contact our showroom at{' '}
                    <a href={STORE_INFO.phone.telLink} className="text-luxury-gold font-semibold underline">
                      (678) 691-1692
                    </a>{' '}
                    to request similar pieces.
                  </p>
                </div>
              )}

              <a
                href={STORE_INFO.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-luxury-muted hover:text-luxury-ivory transition-colors text-center"
              >
                <MapPin className="w-3.5 h-3.5 text-luxury-gold" />
                <span>Visit Store: 7040 Jimmy Carter Blvd, Suite 4</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
