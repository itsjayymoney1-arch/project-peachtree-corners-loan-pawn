import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import { paymentAdapter, TEST_CARDS } from '../services/paymentAdapter';
import { 
  ShieldCheck, 
  Lock, 
  MapPin, 
  CreditCard, 
  Store, 
  Truck, 
  ArrowLeft, 
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function Checkout() {
  const { cart, customerUser, clearCart } = useApp();
  const { navigate } = useRouter();

  // Form states
  const [firstName, setFirstName] = useState(customerUser?.firstName || 'David');
  const [lastName, setLastName] = useState(customerUser?.lastName || 'Harrison');
  const [email, setEmail] = useState(customerUser?.email || 'customer@peachtreecorners.demo');
  const [phone, setPhone] = useState(customerUser?.phone || '(404) 555-0192');

  const [fulfillmentMethod, setFulfillmentMethod] = useState('pickup'); // 'pickup' or 'shipping'
  const [street, setStreet] = useState('3400 Holcomb Bridge Rd, Apt 204');
  const [city, setCity] = useState('Peachtree Corners');
  const [state, setState] = useState('GA');
  const [zip, setZip] = useState('30092');

  // Marketing consents (UNCHECKED by default per requirements)
  const [emailConsent, setEmailConsent] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);

  // Card details (Tokenized in-memory, never stored on server)
  const [cardNumber, setCardNumber] = useState('4000 0012 3456 7890');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [billingZip, setBillingZip] = useState('30092');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Cart financial calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.06 * 100) / 100;
  const shippingCost = fulfillmentMethod === 'shipping' ? 35.00 : 0.00;
  const total = subtotal + tax + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="font-editorial text-3xl font-bold text-luxury-ivory">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-luxury-muted text-sm">
          You do not have any items reserved for checkout. Browse our showroom selections in The Vault.
        </p>
        <button
          onClick={() => navigate('/vault')}
          className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-wider hover:brightness-110"
        >
          Return to The Vault
        </button>
      </div>
    );
  }

  const fillTestCard = (testCard) => {
    setCardNumber(testCard.number);
    setExpiry(testCard.exp);
    setCvc(testCard.cvc);
    setErrorMessage('');
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    try {
      if (!email || !firstName || !lastName) {
        throw new Error("Please complete all required contact information.");
      }

      if (fulfillmentMethod === 'shipping' && (!street || !city || !state || !zip)) {
        throw new Error("Please provide complete delivery address for insured courier shipping.");
      }

      // Step 1: Tokenize payment (client-side card gateway simulation)
      const tokenResult = await paymentAdapter.tokenizePayment({
        cardNumber,
        expiry,
        cvc,
        billingPostal: billingZip
      });

      // Step 2: Server-side payment execution & atomic order placement
      const checkoutResult = await paymentAdapter.processCheckout({
        paymentToken: tokenResult.token,
        cartItems: cart,
        customerInfo: {
          customerId: customerUser?.id || null,
          email,
          firstName,
          lastName,
          phone
        },
        fulfillmentMethod,
        shippingAddress: fulfillmentMethod === 'shipping' ? { street, city, state, zip } : null,
        actor: customerUser ? { id: customerUser.id, email: customerUser.email, role: 'CUSTOMER' } : null
      });

      // Clear local cart
      clearCart();

      // Navigate to order confirmation
      navigate(`/order-confirmation`, { orderId: checkoutResult.order.id });
    } catch (err) {
      setErrorMessage(err.message || 'Payment processing failed. Please check your information.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      
      {/* Navigation & Header */}
      <div className="flex items-center justify-between border-b border-luxury-borderSubtle pb-4">
        <button
          onClick={() => navigate('/vault')}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-luxury-muted hover:text-luxury-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
        <div className="flex items-center gap-2 text-xs text-luxury-goldLight">
          <Lock className="w-3.5 h-3.5 text-luxury-gold" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Checkout Forms */}
        <div className="lg:col-span-7 space-y-8">
          
          <form onSubmit={handleCompleteOrder} className="space-y-8">
            
            {/* 1. Contact Information */}
            <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-editorial font-bold text-luxury-ivory tracking-wide">
                  1. CUSTOMER CONTACT
                </h3>
                {customerUser ? (
                  <span className="text-xs text-luxury-gold">Logged in as {customerUser.email}</span>
                ) : (
                  <span className="text-xs text-luxury-muted">Guest Checkout</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2.5 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2.5 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                    Email Address (For Receipt) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2.5 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                    Mobile Phone (For Order SMS) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2.5 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Fulfillment Method Selection */}
            <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 space-y-4">
              <h3 className="text-base font-editorial font-bold text-luxury-ivory tracking-wide">
                2. FULFILLMENT METHOD
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Free In-Store Pickup */}
                <div 
                  onClick={() => setFulfillmentMethod('pickup')}
                  className={`p-4 rounded-sm border cursor-pointer transition-all ${
                    fulfillmentMethod === 'pickup' 
                      ? 'border-luxury-gold bg-luxury-gold/10 shadow-gold-glow' 
                      : 'border-luxury-borderSubtle bg-luxury-charcoal hover:border-luxury-gold/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-luxury-gold">
                      <Store className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">In-Store Counter Pickup</span>
                    </div>
                    <span className="text-xs font-bold text-luxury-goldLight">FREE</span>
                  </div>
                  <p className="text-xs text-luxury-muted leading-relaxed">
                    Pick up at 7040 Jimmy Carter Blvd, Suite 4, Peachtree Corners, GA. Ready within 2 hours of store opening.
                  </p>
                </div>

                {/* Insured Shipping */}
                <div 
                  onClick={() => setFulfillmentMethod('shipping')}
                  className={`p-4 rounded-sm border cursor-pointer transition-all ${
                    fulfillmentMethod === 'shipping' 
                      ? 'border-luxury-gold bg-luxury-gold/10 shadow-gold-glow' 
                      : 'border-luxury-borderSubtle bg-luxury-charcoal hover:border-luxury-gold/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-luxury-gold">
                      <Truck className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Insured Courier</span>
                    </div>
                    <span className="text-xs font-bold text-luxury-ivory">$35.00</span>
                  </div>
                  <p className="text-xs text-luxury-muted leading-relaxed">
                    Discreet armored delivery with adult signature requirement upon delivery.
                  </p>
                </div>
              </div>

              {/* Shipping Address Inputs if Shipping Selected */}
              {fulfillmentMethod === 'shipping' && (
                <div className="pt-4 border-t border-luxury-borderSubtle space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-semibold text-luxury-gold uppercase tracking-wider">
                    Shipping Address
                  </h4>
                  <input
                    type="text"
                    placeholder="Street Address"
                    required={fulfillmentMethod === 'shipping'}
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2.5 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      required={fulfillmentMethod === 'shipping'}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required={fulfillmentMethod === 'shipping'}
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      required={fulfillmentMethod === 'shipping'}
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Payment Processing Integration */}
            <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-editorial font-bold text-luxury-ivory tracking-wide flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-luxury-gold" />
                  <span>3. PAYMENT INFORMATION</span>
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-luxury-charcoal border border-luxury-gold/30 text-luxury-goldLight">
                  Sandbox Active
                </span>
              </div>

              {/* 1-Click Test Cards Bar */}
              <div className="p-3 rounded-sm bg-luxury-charcoal/60 border border-luxury-borderSubtle space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-luxury-muted block font-semibold">
                  Sandbox Demonstration Cards:
                </span>
                <div className="flex flex-wrap gap-2">
                  {TEST_CARDS.map((tc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => fillTestCard(tc)}
                      className="px-2.5 py-1 text-[11px] rounded-sm bg-luxury-surface border border-luxury-borderSubtle hover:border-luxury-gold text-luxury-ivory hover:text-luxury-gold transition-colors"
                    >
                      {tc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tokenized Card Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4000 0000 0000 0000"
                    className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2.5 text-xs text-luxury-ivory focus:border-luxury-gold outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                      Expiration
                    </label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="CVC"
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-luxury-muted mb-1 font-medium">
                      Billing ZIP
                    </label>
                    <input
                      type="text"
                      required
                      value={billingZip}
                      onChange={(e) => setBillingZip(e.target.value)}
                      placeholder="ZIP"
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-xs text-luxury-ivory focus:border-luxury-gold outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Pawn Regulatory Notice */}
              <div className="p-3 rounded-sm bg-luxury-gold/5 border border-luxury-gold/20 text-[11px] text-luxury-muted leading-relaxed">
                <strong className="text-luxury-goldLight block">Retail Merchant Disclosure:</strong>
                This checkout processes inspected retail sales only. Collateral pawn loans require in-person identity verification at our 7040 Jimmy Carter Blvd facility and cannot be settled via retail card checkout.
              </div>
            </div>

            {/* 4. Granular Marketing Consent (Unchecked by default per TCPA / CTIA rules) */}
            <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 space-y-3">
              <h4 className="text-xs font-bold text-luxury-ivory uppercase tracking-wider">
                COMMUNICATION &amp; VAULT PREFERENCES
              </h4>

              <label className="flex items-start gap-3 cursor-pointer text-xs text-luxury-muted select-none">
                <input
                  type="checkbox"
                  checked={emailConsent}
                  onChange={(e) => setEmailConsent(e.target.checked)}
                  className="mt-0.5 rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                />
                <span>
                  Subscribe to <strong>The Vault Weekly</strong> newsletter for early access drops, estate jewelry releases, and new arrival announcements. You can unsubscribe at any time.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-xs text-luxury-muted select-none">
                <input
                  type="checkbox"
                  checked={smsConsent}
                  onChange={(e) => setSmsConsent(e.target.checked)}
                  className="mt-0.5 rounded border-luxury-borderSubtle text-luxury-gold focus:ring-0 bg-luxury-charcoal"
                />
                <span>
                  Send me promotional SMS alerts regarding rare drops from Peachtree Corners Loan &amp; Pawn. Msg &amp; data rates may apply. Reply STOP to cancel at any time. (Transactional order alerts sent regardless).
                </span>
              </label>
            </div>

            {/* Error Display */}
            {errorMessage && (
              <div className="p-4 rounded-sm bg-red-950/80 border border-red-700/60 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all shadow-gold-glow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-luxury-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying &amp; Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize &amp; Complete Order &bull; ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </>
              )}
            </button>

          </form>

        </div>

        {/* Right Column: Order Summary & Review */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-luxury-darkCard border border-luxury-gold/30 rounded-sm p-6 space-y-6 sticky top-28 shadow-xl">
            <h3 className="font-editorial text-lg font-bold text-luxury-ivory tracking-wide border-b border-luxury-borderSubtle pb-3">
              ORDER SUMMARY ({cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'})
            </h3>

            {/* Items list */}
            <div className="space-y-4 max-h-72 overflow-y-auto divide-y divide-luxury-borderSubtle/60 pr-1">
              {cart.map(item => (
                <div key={item.productId} className="pt-3 first:pt-0 flex gap-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-14 h-14 object-cover rounded-sm border border-luxury-borderSubtle bg-luxury-charcoal shrink-0"
                  />
                  <div className="flex-1 text-xs">
                    <span className="text-[10px] text-luxury-gold uppercase font-mono block">
                      {item.sku}
                    </span>
                    <h5 className="font-medium text-luxury-ivory line-clamp-1">
                      {item.title}
                    </h5>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-luxury-muted">Qty: {item.quantity}</span>
                      <span className="font-editorial font-bold text-luxury-gold text-sm">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-4 border-t border-luxury-borderSubtle text-xs">
              <div className="flex justify-between text-luxury-muted">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-luxury-muted">
                <span>GA Sales Tax (6%)</span>
                <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-luxury-muted">
                <span>Fulfillment ({fulfillmentMethod === 'pickup' ? 'In-Store Pickup' : 'Courier'})</span>
                <span className={fulfillmentMethod === 'pickup' ? 'text-luxury-goldLight font-semibold' : ''}>
                  {fulfillmentMethod === 'pickup' ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-luxury-ivory pt-3 border-t border-luxury-borderSubtle">
                <span>Total Amount Due</span>
                <span className="font-editorial text-2xl text-luxury-gold">
                  ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* In-Store Pickup Details Box */}
            <div className="p-3.5 rounded-sm bg-luxury-charcoal/80 border border-luxury-gold/20 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-luxury-gold font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Showroom Location</span>
              </div>
              <p className="text-luxury-ivory font-medium">
                {STORE_INFO.address.street}, Suite 4<br />
                {STORE_INFO.address.city}, {STORE_INFO.address.state} {STORE_INFO.address.zip}
              </p>
              <p className="text-[11px] text-luxury-muted">
                Mon - Sat 9:30 AM - 6:00 PM &bull; Call {STORE_INFO.phone.formatted}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
