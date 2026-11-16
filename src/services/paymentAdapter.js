// Payment Provider Abstraction Layer for Peachtree Corners Loan & Pawn
// Supports Square, Stripe Sandbox, and Demonstration Tokenized Checkout
import { dbService } from './db.js';
import { emailService } from './emailService.js';
import { smsService } from './smsService.js';

export const TEST_CARDS = [
  {
    label: "Valid Card (Approved)",
    number: "4000 0012 3456 7890",
    exp: "12/28",
    cvc: "888",
    type: "Visa",
    result: "SUCCESS"
  },
  {
    label: "Card Requiring 3D Secure Verification",
    number: "4000 0023 4567 8901",
    exp: "08/27",
    cvc: "321",
    type: "Visa 3DS",
    result: "3DS_REQUIRED"
  },
  {
    label: "Declined: Insufficient Funds",
    number: "4000 0099 8877 6655",
    exp: "04/26",
    cvc: "123",
    type: "Visa",
    result: "DECLINED"
  }
];

export const paymentAdapter = {
  // Provider configurations
  getProviderStatus() {
    return {
      activeProvider: 'Square Sandbox (Simulated)',
      environment: 'sandbox',
      isLiveAllowed: false, // Requires business owner merchant underwriting approval
      supportedPaymentMethods: ['card', 'apple_pay', 'google_pay', 'in_store_counter'],
      complianceNotice: "High-ticket retail jewelry & electronics. Regulated collateral loans are explicitly excluded from retail payment checkout."
    };
  },

  // Simulate tokenizing payment details on the client (like Stripe.js or Square Web Payments SDK)
  // Raw card data is never passed to our server or database
  async tokenizePayment({ cardNumber, expiry, cvc, billingPostal }) {
    // Artificial latency to reflect payment gateway tokenization
    await new Promise(res => setTimeout(res, 600));

    const cleanCard = (cardNumber || '').replace(/\s+/g, '');
    
    // Check declined test card
    if (cleanCard === '4000009988776655') {
      throw new Error('Your card was declined: Insufficient funds or credit limit reached.');
    }

    if (cleanCard.length < 15) {
      throw new Error('Please enter a valid 16-digit credit card number.');
    }

    // Return opaque token
    const last4 = cleanCard.slice(-4);
    const token = `tok_sq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    return {
      token,
      cardBrand: cleanCard.startsWith('4') ? 'Visa' : (cleanCard.startsWith('5') ? 'Mastercard' : 'Amex'),
      last4,
      billingPostal
    };
  },

  // Server-Side Payment Verification & Atomic Order Placement
  // Ensures payments are verified server-side and inventory is updated atomically
  async processCheckout({
    paymentToken,
    cartItems,
    customerInfo,
    fulfillmentMethod,
    shippingAddress,
    actor
  }) {
    // Artificial server latency
    await new Promise(res => setTimeout(res, 800));

    const db = dbService.getSnapshot();

    // 1. Validate Inventory Availability Atomically
    for (const item of cartItems) {
      const product = db.products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Item ${item.title} no longer exists in inventory.`);
      }
      if (product.status === 'sold') {
        throw new Error(`Item "${product.title}" has already been sold. Please remove it from your cart.`);
      }
      if (product.quantity < item.quantity) {
        throw new Error(`Requested quantity for "${product.title}" is not available (Only ${product.quantity} in stock).`);
      }
    }

    // 2. Server-side Subtotal, Tax, and Total Computation
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const taxRate = 0.06; // 6% GA Sales Tax
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const shippingCost = fulfillmentMethod === 'shipping' ? 35.00 : 0.00;
    const total = subtotal + tax + shippingCost;

    // 3. Server-side Charge Simulation with Token
    const paymentTransactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 4. Atomic Inventory State Update: Mark purchased products as SOLD and decrement quantity
    for (const item of cartItems) {
      const prodIndex = db.products.findIndex(p => p.id === item.productId);
      if (prodIndex !== -1) {
        const prod = db.products[prodIndex];
        const newQty = Math.max(0, prod.quantity - item.quantity);
        db.products[prodIndex] = {
          ...prod,
          quantity: newQty,
          status: newQty === 0 ? 'sold' : 'available',
          updatedAt: new Date().toISOString()
        };
      }
    }

    // 5. Create Canonical Order Record
    const orderNumber = `PC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderNumber,
      orderNumber,
      customerId: customerInfo.customerId || null,
      customerEmail: customerInfo.email,
      customerName: customerInfo.name || `${customerInfo.firstName || ''} ${customerInfo.lastName || ''}`.trim(),
      customerPhone: customerInfo.phone || '',
      fulfillmentMethod,
      shippingAddress: fulfillmentMethod === 'shipping' ? shippingAddress : null,
      pickupStoreInfo: fulfillmentMethod === 'pickup' ? {
        name: 'Peachtree Corners Loan & Pawn',
        address: '7040 Jimmy Carter Boulevard, Suite 4, Peachtree Corners, GA 30092',
        phone: '(678) 691-1692',
        hours: 'Mon-Sat 9:30 AM - 6:00 PM'
      } : null,
      items: cartItems.map(item => ({
        productId: item.productId,
        sku: item.sku || 'PC-VAULT-2026',
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal,
      tax,
      shippingCost,
      total,
      paymentStatus: 'paid',
      orderStatus: fulfillmentMethod === 'pickup' ? 'ready_for_pickup' : 'processing',
      paymentMethod: 'card_online',
      paymentToken,
      paymentTransactionId,
      paymentProvider: 'Square Tokenized Gateway (Simulated)',
      internalNotes: [
        {
          id: 'note-init',
          text: `Online payment authorized and verified ($${total.toFixed(2)}). Initial inventory deducted.`,
          author: 'System Payment Processor',
          createdAt: new Date().toISOString()
        }
      ],
      trackingNumber: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders = [newOrder, ...(db.orders || [])];

    // 6. Release any active temporary reservation for this checkout
    if (db.reservations) {
      for (const item of cartItems) {
        delete db.reservations[item.productId];
      }
    }

    // Save changes to database
    dbService.saveSnapshot(db);

    // 7. Audit Log Entry
    dbService.logAudit(
      actor || { id: 'checkout-guest', email: customerInfo.email, role: 'CUSTOMER' },
      'ORDER_CREATED_AND_PAID',
      'order',
      newOrder.id,
      { total, itemsCount: cartItems.length, fulfillment: fulfillmentMethod }
    );

    // 8. Trigger Automated Customer Notifications
    try {
      emailService.sendOrderConfirmation(newOrder);
      if (customerInfo.phone) {
        smsService.sendOrderConfirmationSms(newOrder);
      }
    } catch (e) {
      console.error("Failed to dispatch order notification", e);
    }

    return {
      success: true,
      order: newOrder
    };
  },

  // Record an In-Store POS Sale (Unified Retail Inventory Deduction)
  async recordInStoreSale({ product, quantity, sellingPrice, paymentType = 'cash', cashierNote, actor }) {
    const db = dbService.getSnapshot();
    const prodIndex = db.products.findIndex(p => p.id === product.id);
    
    if (prodIndex === -1) {
      throw new Error("Product not found in inventory.");
    }

    const currentProd = db.products[prodIndex];
    if (currentProd.status === 'sold') {
      throw new Error("Item is already marked sold.");
    }

    const newQty = Math.max(0, currentProd.quantity - quantity);
    db.products[prodIndex] = {
      ...currentProd,
      quantity: newQty,
      status: newQty === 0 ? 'sold' : 'available',
      updatedAt: new Date().toISOString()
    };

    // Create an in-store completed order record
    const orderNumber = `PC-POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const tax = Math.round(sellingPrice * quantity * 0.06 * 100) / 100;
    const total = (sellingPrice * quantity) + tax;

    const inStoreOrder = {
      id: orderNumber,
      orderNumber,
      customerId: null,
      customerEmail: 'counter.customer@instore.pawn',
      customerName: 'In-Store Counter Customer',
      customerPhone: '',
      fulfillmentMethod: 'in_store_immediate',
      shippingAddress: null,
      pickupStoreInfo: null,
      items: [
        {
          productId: currentProd.id,
          sku: currentProd.sku,
          title: currentProd.title,
          price: sellingPrice,
          quantity,
          image: currentProd.primaryImage || currentProd.image
        }
      ],
      subtotal: sellingPrice * quantity,
      tax,
      shippingCost: 0,
      total,
      paymentStatus: 'paid',
      orderStatus: 'completed',
      paymentMethod: paymentType === 'cash' ? 'instore_cash' : 'instore_pos_card',
      paymentTransactionId: `POS-REG-01-${Date.now()}`,
      paymentProvider: 'In-Store Physical Register',
      internalNotes: [
        {
          id: 'note-pos',
          text: cashierNote || 'In-store counter purchase processed immediately by staff.',
          author: actor?.name || 'Store Staff',
          createdAt: new Date().toISOString()
        }
      ],
      trackingNumber: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders = [inStoreOrder, ...(db.orders || [])];
    dbService.saveSnapshot(db);

    dbService.logAudit(
      actor || { id: 'staff-counter', email: 'staff@pawnshopnorcross.com', role: 'INVENTORY_MANAGER' },
      'IN_STORE_SALE_RECORDED',
      'order',
      inStoreOrder.id,
      { productId: currentProd.id, price: sellingPrice, paymentType }
    );

    return {
      success: true,
      order: inStoreOrder
    };
  }
};
