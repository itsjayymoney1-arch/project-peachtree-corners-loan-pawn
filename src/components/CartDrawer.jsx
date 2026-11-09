import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useRouter } from '../context/RouterContext';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateCartQuantity } = useApp();
  const { navigate } = useRouter();

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.06 * 100) / 100;
  const total = subtotal + tax;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-luxury-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0" 
        onClick={() => setIsCartOpen(false)} 
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-luxury-darkCard border-l border-luxury-gold/30 h-full flex flex-col justify-between shadow-2xl z-10">
        
        {/* Header */}
        <div className="p-5 border-b border-luxury-borderSubtle flex items-center justify-between bg-luxury-black">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-luxury-gold" />
            <h2 className="font-editorial text-xl font-bold tracking-wide text-luxury-ivory">
              YOUR VAULT BAG
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-luxury-gold/20 text-luxury-goldLight border border-luxury-gold/30">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-sm text-luxury-muted hover:text-luxury-ivory hover:bg-luxury-charcoal transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Temporary Reservation Notice */}
        <div className="bg-luxury-gold/10 px-4 py-2 border-b border-luxury-gold/20 flex items-center gap-2 text-xs text-luxury-goldLight">
          <Clock className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
          <span>Items reserved for 15 minutes during your checkout session.</span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-luxury-borderSubtle/60">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
              <div className="w-16 h-16 rounded-full bg-luxury-charcoal flex items-center justify-center text-luxury-muted border border-luxury-borderSubtle">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-base font-editorial text-luxury-ivory">
                Your bag is empty
              </p>
              <p className="text-xs text-luxury-muted max-w-xs">
                Explore our fine jewelry, Swiss chronographs, pro tools, and electronics in The Vault.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/vault');
                }}
                className="px-5 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
              >
                Browse The Vault
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="pt-4 first:pt-0 flex gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-sm border border-luxury-borderSubtle shrink-0 bg-luxury-charcoal"
                />
                
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-luxury-gold tracking-wider block">
                        {item.sku || 'PC-VAULT'}
                      </span>
                      <h4 className="text-xs font-medium text-luxury-ivory line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-luxury-muted hover:text-red-400 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-editorial text-base font-bold text-luxury-gold">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>

                    <div className="flex items-center border border-luxury-borderSubtle rounded-sm bg-luxury-charcoal">
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        className="px-2 py-0.5 text-luxury-muted hover:text-luxury-ivory transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-medium text-luxury-ivory">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        className="px-2 py-0.5 text-luxury-muted hover:text-luxury-ivory transition-colors"
                        disabled={item.quantity >= (item.maxAvailable || 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-luxury-gold/30 bg-luxury-black space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-luxury-muted">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-luxury-muted">
                <span>Estimated GA Sales Tax (6%)</span>
                <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-luxury-muted">
                <span>In-Store Counter Pickup</span>
                <span className="text-luxury-goldLight font-medium">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold text-luxury-ivory pt-2 border-t border-luxury-borderSubtle">
                <span>Estimated Total</span>
                <span className="text-luxury-gold font-editorial text-xl">
                  ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full py-3.5 px-4 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-gold-glow"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-luxury-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-luxury-gold" />
              <span>Tokenized Checkout &bull; Government ID verified at counter</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
