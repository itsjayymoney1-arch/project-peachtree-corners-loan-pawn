import React, { useEffect } from 'react';
import { X, Phone, MapPin, Sparkles, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { STORE_INFO } from '../data/storeInfo';

export default function ProductModal({ product, onClose, onInquire }) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-luxury-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-luxury-darkCard border border-luxury-gold/40 rounded-sm shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-luxury-black/70 border border-luxury-gold/30 text-luxury-ivory hover:text-luxury-gold hover:border-luxury-gold transition-colors focus:outline-none"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Product Image Section */}
          <div className="relative aspect-square md:aspect-auto bg-luxury-charcoal flex items-center justify-center overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/70 via-transparent to-transparent md:hidden" />
            
            {/* Demo Badge */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-luxury-black/90 text-luxury-goldLight border border-luxury-gold/40 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-luxury-gold" />
                Demonstration Inventory
              </span>
            </div>
          </div>

          {/* Details & Specs Section */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-widest font-semibold text-luxury-gold">
                  {product.subcategory || product.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-luxury-charcoal text-luxury-ivory border border-luxury-borderSubtle">
                  {product.condition}
                </span>
              </div>

              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-luxury-ivory leading-tight">
                {product.title}
              </h2>

              <div className="p-3 rounded-sm bg-luxury-charcoal/50 border border-luxury-gold/20 flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-luxury-muted">
                  Demonstration Valuation
                </span>
                <span className="font-editorial text-2xl font-bold text-luxury-gold">
                  {product.estimatedValue}
                </span>
              </div>

              <p className="text-sm text-luxury-muted leading-relaxed">
                {product.description}
              </p>

              {/* Specifications List */}
              {product.specs && (
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

              {/* Notice Banner */}
              <div className="p-3 rounded-sm bg-luxury-gold/10 border border-luxury-gold/30 text-xs text-luxury-goldLight flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-luxury-gold shrink-0 mt-0.5" />
                <p>
                  Demonstration inventory item. In-store selections rotate daily. Please contact Peachtree Corners Loan & Pawn to confirm current inventory or discuss similar pieces.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-luxury-borderSubtle space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={STORE_INFO.phone.telLink}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md text-center"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call (678) 691-1692</span>
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onInquire(product);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-wider transition-all text-center"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Inquire Online</span>
                </button>
              </div>

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
