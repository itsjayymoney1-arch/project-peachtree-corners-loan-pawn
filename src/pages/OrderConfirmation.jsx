import React, { useMemo } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Calendar, 
  Mail, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck,
  Printer
} from 'lucide-react';

export default function OrderConfirmation() {
  const { queryParams, navigate } = useRouter();
  const { orders } = useApp();

  const orderId = queryParams.orderId;
  const order = useMemo(() => {
    return orders.find(o => o.id === orderId) || orders[0];
  }, [orders, orderId]);

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-editorial font-bold text-luxury-ivory">Order Record Not Found</h2>
        <p className="text-luxury-muted text-sm">Please return to the showroom catalog or check your customer dashboard.</p>
        <button
          onClick={() => navigate('/vault')}
          className="px-6 py-2.5 bg-luxury-gold text-luxury-black font-semibold text-xs uppercase"
        >
          Return to Showroom
        </button>
      </div>
    );
  }

  const isPickup = order.fulfillmentMethod === 'pickup' || order.fulfillmentMethod === 'in_store_immediate';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fadeIn">
      
      {/* Top Success Banner */}
      <div className="text-center space-y-4 border-b border-luxury-borderSubtle pb-10">
        <div className="w-16 h-16 mx-auto rounded-full bg-luxury-gold/15 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold shadow-gold-glow">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-luxury-gold font-semibold block">
          Payment Verified &bull; Inventory Reserved
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-luxury-ivory tracking-wide">
          THANK YOU FOR YOUR PURCHASE
        </h1>
        <p className="text-sm sm:text-base text-luxury-muted max-w-xl mx-auto">
          Your order has been officially recorded. A confirmation receipt has been sent to{' '}
          <strong className="text-luxury-ivory font-mono">{order.customerEmail}</strong>.
        </p>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-luxury-muted block">
            Order Reference
          </span>
          <span className="font-mono text-sm font-bold text-luxury-gold">
            #{order.orderNumber}
          </span>
        </div>

        <div className="p-4 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-luxury-muted block">
            Payment Status
          </span>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Authorized (${order.total.toFixed(2)})
          </span>
        </div>

        <div className="p-4 rounded-sm bg-luxury-darkCard border border-luxury-borderSubtle space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-luxury-muted block">
            Fulfillment Status
          </span>
          <span className="text-xs font-semibold text-luxury-goldLight uppercase tracking-wider">
            {order.orderStatus.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Fulfillment Instructions Box */}
      <div className="p-6 rounded-sm bg-luxury-charcoal/80 border border-luxury-gold/30 space-y-4">
        <div className="flex items-center gap-2 text-luxury-gold">
          <MapPin className="w-5 h-5" />
          <h3 className="font-editorial text-lg font-bold uppercase tracking-wider">
            {isPickup ? 'In-Store Counter Pickup Instructions' : 'Courier Shipping Information'}
          </h3>
        </div>

        {isPickup ? (
          <div className="space-y-3 text-xs leading-relaxed text-luxury-muted">
            <p className="text-luxury-ivory text-sm">
              Your merchandise is held in our store vault at:
            </p>
            <div className="p-3 bg-luxury-black/60 rounded border border-white/5 space-y-1 text-luxury-ivory font-medium">
              <p>Peachtree Corners Loan &amp; Pawn</p>
              <p>7040 Jimmy Carter Boulevard, Suite 4, Peachtree Corners, GA 30092</p>
              <p className="text-luxury-gold">Hours: Monday &ndash; Saturday, 9:30 AM &ndash; 6:00 PM</p>
            </div>
            <p>
              <strong>Pickup Requirements:</strong> Please present a government-issued photo ID matching <strong>{order.customerName}</strong> and have your Order Number (<strong>#{order.orderNumber}</strong>) ready at the counter.
            </p>
          </div>
        ) : (
          <p className="text-xs text-luxury-muted leading-relaxed">
            Your merchandise is being packed with tamper-evident foam and will be dispatched via insured courier to:
            <br />
            <strong className="text-luxury-ivory">
              {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
            </strong>
          </p>
        )}

        <div className="pt-2 flex flex-wrap gap-4">
          <a
            href={STORE_INFO.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
          >
            Get Driving Directions
          </a>
          <a
            href={STORE_INFO.phone.telLink}
            className="px-4 py-2 rounded-sm border border-luxury-gold text-luxury-gold font-medium text-xs uppercase tracking-wider hover:bg-luxury-gold/10"
          >
            Call Store: {STORE_INFO.phone.formatted}
          </a>
        </div>
      </div>

      {/* Purchased Items List */}
      <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 space-y-6">
        <h3 className="font-editorial text-base font-bold text-luxury-ivory uppercase tracking-wider border-b border-luxury-borderSubtle pb-3">
          Purchased Merchandise
        </h3>

        <div className="divide-y divide-luxury-borderSubtle/60">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-4 first:pt-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-sm border border-luxury-borderSubtle bg-luxury-charcoal shrink-0"
                />
                <div>
                  <span className="text-[10px] font-mono text-luxury-gold uppercase tracking-wider block">
                    {item.sku}
                  </span>
                  <h4 className="text-sm font-medium text-luxury-ivory">
                    {item.title}
                  </h4>
                  <span className="text-xs text-luxury-muted">Qty: {item.quantity}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-editorial text-lg font-bold text-luxury-gold">
                  ${(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="pt-4 border-t border-luxury-borderSubtle space-y-2 text-xs text-right max-w-xs ml-auto">
          <div className="flex justify-between text-luxury-muted">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-luxury-muted">
            <span>GA Sales Tax</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-luxury-muted">
            <span>Fulfillment</span>
            <span>{order.shippingCost ? `$${order.shippingCost.toFixed(2)}` : 'FREE'}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-luxury-ivory pt-2 border-t border-luxury-borderSubtle">
            <span>Total Paid</span>
            <span className="font-editorial text-xl text-luxury-gold">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-luxury-borderSubtle">
        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-sm border border-luxury-borderSubtle text-luxury-muted hover:text-luxury-ivory text-xs uppercase tracking-wider flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Print Receipt</span>
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/account?tab=orders')}
            className="px-5 py-2.5 rounded-sm border border-luxury-gold text-luxury-gold font-medium text-xs uppercase tracking-wider hover:bg-luxury-gold/10"
          >
            View in Account
          </button>
          <button
            onClick={() => navigate('/vault')}
            className="px-6 py-2.5 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
          >
            Explore The Vault
          </button>
        </div>
      </div>

    </div>
  );
}
