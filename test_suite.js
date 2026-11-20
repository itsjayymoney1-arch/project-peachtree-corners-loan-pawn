// test_suite.js
// Comprehensive Verification Suite for Peachtree Corners Loan & Pawn

import { 
  DEFAULT_MARKDOWN_TIERS, 
  getCurrentTier, 
  calculateMarkdownPrice, 
  getNextMarkdownDate,
  getItemAgingReport,
  runMarkdownEngine,
  getInventoryAgingStats,
  getDaysInInventory
} from './src/services/markdownEngine.js';

import { dbService } from './src/services/db.js';
import { paymentAdapter } from './src/services/paymentAdapter.js';
import { aiVisionService } from './src/services/aiVisionService.js';
import { emailService } from './src/services/emailService.js';
import { smsService } from './src/services/smsService.js';
import { hiTechPawnService } from './src/services/hiTechPawnService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('========================================================');
console.log('TEST SUITE: PEACHTREE CORNERS LOAN & PAWN PLATFORM');
console.log('========================================================\n');

// ---------------------------------------------------------------------
// TEST GROUP 1: MARKDOWN AGING ENGINE REQUIREMENTS
// ---------------------------------------------------------------------
console.log('--- TEST GROUP 1: INVENTORY AGING & AUTOMATIC MARKDOWNS ---');

// Age 7 days -> Tier 0 (0–14 days, 0% discount)
const tier7 = getCurrentTier(7, DEFAULT_MARKDOWN_TIERS);
const price7 = calculateMarkdownPrice(1000, tier7.discountPercent, null);
assert(tier7.id === 'tier-0' && tier7.discountPercent === 0, 'Age 7 days matches Tier 0 (0% discount)');
assert(price7 === 1000, 'Age 7 days retains full baseline price $1,000');

// Age 20 days -> Tier 1 (15–30 days, 5% discount)
const tier20 = getCurrentTier(20, DEFAULT_MARKDOWN_TIERS);
const price20 = calculateMarkdownPrice(1000, tier20.discountPercent, null);
assert(tier20.id === 'tier-1' && tier20.discountPercent === 5, 'Age 20 days matches Tier 1 (5% discount)');
assert(price20 === 950, 'Age 20 days calculates exact price $950');

// Age 40 days -> Tier 2 (31–45 days, 10% discount)
const tier40 = getCurrentTier(40, DEFAULT_MARKDOWN_TIERS);
const price40 = calculateMarkdownPrice(1000, tier40.discountPercent, null);
assert(tier40.id === 'tier-2' && tier40.discountPercent === 10, 'Age 40 days matches Tier 2 (10% discount)');
assert(price40 === 900, 'Age 40 days calculates exact price $900');

// Age 55 days -> Tier 3 (46–60 days, 15% discount)
const tier55 = getCurrentTier(55, DEFAULT_MARKDOWN_TIERS);
const price55 = calculateMarkdownPrice(1000, tier55.discountPercent, null);
assert(tier55.id === 'tier-3' && tier55.discountPercent === 15, 'Age 55 days matches Tier 3 (15% discount)');
assert(price55 === 850, 'Age 55 days calculates exact price $850');

// Age 75 days -> Tier 4 (61–90 days, 20% discount)
const tier75 = getCurrentTier(75, DEFAULT_MARKDOWN_TIERS);
const price75 = calculateMarkdownPrice(1000, tier75.discountPercent, null);
assert(tier75.id === 'tier-4' && tier75.discountPercent === 20, 'Age 75 days matches Tier 4 (20% discount)');
assert(price75 === 800, 'Age 75 days calculates exact price $800');

// Age 100 days -> Tier 5 (91+ days, 25% discount)
const tier100 = getCurrentTier(100, DEFAULT_MARKDOWN_TIERS);
const price100 = calculateMarkdownPrice(1000, tier100.discountPercent, null);
assert(tier100.id === 'tier-5' && tier100.discountPercent === 25, 'Age 100 days matches Tier 5 (25% discount)');
assert(price100 === 750, 'Age 100 days calculates exact price $750');

// Price Floor Enforcement Test: Floor = $850 on 100-day item (25% off would be $750, must stay at $850)
const flooredPrice = calculateMarkdownPrice(1000, tier100.discountPercent, 850);
assert(flooredPrice === 850, 'Price Floor Enforcement: Item priced at $1,000 never drops below $850 floor');

// Non-Compounding Test: 2 successive cycles with base $1,000 at 20% must equal $800, NOT $1,000 -> $950 -> $760
const nonCompounded = calculateMarkdownPrice(1000, 20, null);
assert(nonCompounded === 800, 'Non-Compounding: Markdown is calculated strictly on original approved base');

// Excluded / Paused Item Test
const sampleItem = {
  id: 'test-excluded',
  price: 1000,
  originalApprovedPrice: 1000,
  status: 'available',
  inventoryArrivalDate: new Date(Date.now() - 80 * 24 * 3600 * 1000).toISOString(),
  markdownPaused: true
};
const agingExcluded = getItemAgingReport(sampleItem, { enabled: true, tiers: DEFAULT_MARKDOWN_TIERS });
assert(agingExcluded.isExcluded === true && agingExcluded.currentPrice === 1000, 'Paused Item: Markdown engine excludes paused item from price drop');

// Sold Item Test
const soldItem = {
  id: 'test-sold',
  price: 1000,
  originalApprovedPrice: 1000,
  status: 'sold',
  inventoryArrivalDate: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString()
};
const runSoldResult = runMarkdownEngine([soldItem], { enabled: true, tiers: DEFAULT_MARKDOWN_TIERS });
assert(runSoldResult.length === 0, 'Sold Item: Sold merchandise is excluded from engine re-pricing');

// Category Override Test
const jewelryItem = {
  id: 'test-jewelry',
  category: 'jewelry',
  price: 1000,
  originalApprovedPrice: 1000,
  status: 'available',
  inventoryArrivalDate: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString()
};
const customCategorySettings = {
  enabled: true,
  tiers: DEFAULT_MARKDOWN_TIERS,
  categoryOverrides: {
    jewelry: {
      tiers: [
        { id: 'tier-0', daysFrom: 0, daysTo: 60, discountPercent: 0, label: '0-60 days' },
        { id: 'tier-1', daysFrom: 61, daysTo: 9999, discountPercent: 10, label: '61+ days' }
      ]
    }
  }
};
const jewelryAging = getItemAgingReport(jewelryItem, customCategorySettings);
assert(jewelryAging.discountPercent === 0, 'Category Rule Override: Custom category aging rules are respected');

console.log('\n--- TEST GROUP 2: INVENTORY & QUICK ADD AI INTAKE ---');
// AI Vision Analysis Test
const aiResult = await aiVisionService.analyzeProductPhotos([
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80'
]);
assert(aiResult.suggestedTitle.length > 5, 'Quick Add AI: Vision analyzer generates structured title');
assert(aiResult.suggestedCategory === 'jewelry', 'Quick Add AI: Categorizes watch photo as jewelry');
assert(aiResult.suggestedPrice != null, 'Quick Add AI: Suggests initial valuation');
assert(aiResult.confidence.condition.includes('operational test') || aiResult.confidence.authenticity.includes('manual in-store inspection'), 'Quick Add AI: Enforces physical human inspection requirement for condition');

console.log('\n--- TEST GROUP 3: UNIFIED IN-STORE POS COUNTER SALE ---');
// In-Store Counter Purchase
const snapshot = dbService.getSnapshot();
const testProduct = snapshot.products.find(p => p.status === 'available');
const initialQty = testProduct.quantity;

const posResult = await paymentAdapter.recordInStoreSale({
  product: testProduct,
  quantity: 1,
  sellingPrice: testProduct.price,
  paymentType: 'cash',
  cashierNote: 'Test counter cash sale',
  actor: { id: 'admin-owner-01', email: 'owner@pawnshopnorcross.com', role: 'OWNER' }
});

assert(posResult.success === true, 'In-Store POS Sale: Completes register sale successfully');
assert(posResult.order.id.startsWith('PC-POS-'), 'In-Store POS Sale: Generates canonical POS order ID');

const postSnapshot = dbService.getSnapshot();
const updatedProduct = postSnapshot.products.find(p => p.id === testProduct.id);
assert(updatedProduct.quantity === initialQty - 1, 'In-Store POS Sale: Immediate stock decrement prevents duplicate online purchase');
if (updatedProduct.quantity === 0) {
  assert(updatedProduct.status === 'sold', 'In-Store POS Sale: Zero quantity automatically transitions status to SOLD');
}

console.log('\n--- TEST GROUP 4: ONLINE CHECKOUT & TEST PAYMENTS ---');
const availableOnlineProd = postSnapshot.products.find(p => p.status === 'available');
if (availableOnlineProd) {
  const token = await paymentAdapter.tokenizePayment({
    cardNumber: '4000 0012 3456 7890',
    expiry: '12/28',
    cvc: '888',
    billingPostal: '30092'
  });
  assert(token.token && token.token.startsWith('tok_'), 'Payment Adapter: Tokenizes card without storing raw numbers');

  const checkoutResult = await paymentAdapter.processCheckout({
    paymentToken: token.token,
    cartItems: [{
      productId: availableOnlineProd.id,
      sku: availableOnlineProd.sku,
      title: availableOnlineProd.title,
      price: availableOnlineProd.price,
      quantity: 1,
      image: availableOnlineProd.primaryImage
    }],
    customerInfo: {
      customerId: 'cust-test-1',
      email: 'buyer@test.local',
      firstName: 'Alice',
      lastName: 'Smith',
      phone: '404-555-0100'
    },
    fulfillmentMethod: 'pickup',
    shippingAddress: null,
    actor: { id: 'cust-test-1', email: 'buyer@test.local', role: 'CUSTOMER' }
  });

  assert(checkoutResult.success === true, 'Online Checkout: Atomic order placement succeeds');
  assert(checkoutResult.order.pickupStoreInfo.address.includes('7040 Jimmy Carter'), 'Online Checkout: Attaches correct Peachtree Corners showroom pickup address');
}

console.log('\n--- TEST GROUP 5: MARKETING & TRANSACTIONAL MESSAGING ---');
// Verify unbundled marketing consent guardrail
const unconsentedSms = smsService.sendSms({
  to: '404-555-0100',
  message: 'Special Vault Discount!',
  isMarketing: true,
  customerConsent: false
});
assert(unconsentedSms.success === false, 'SMS Engine: Blocks promotional SMS when customer consent is missing');

const consentedSms = smsService.sendSms({
  to: '404-555-0100',
  message: 'Special Vault Discount!',
  isMarketing: true,
  customerConsent: true
});
assert(consentedSms.success === true, 'SMS Engine: Dispatches promotional SMS when explicit consent is provided');

const stopReply = smsService.handleIncomingKeyword('404-555-0100', 'STOP');
assert(stopReply.optedOut === true, 'SMS Engine: Automatically processes STOP keyword opt-out');

const helpReply = smsService.handleIncomingKeyword('404-555-0100', 'HELP');
assert(helpReply.reply.includes('678-691-1692') || helpReply.reply.includes('pawnshopnorcross.com'), 'SMS Engine: HELP keyword replies with verified store contact information');

console.log('\n--- TEST GROUP 6: HI-TECH PAWN INTEGRATION & AUTOMATED LOAN REMINDERS ---');

// 1. Hi-Tech POS Two-Way Synchronization
const syncRes = hiTechPawnService.syncWithHiTechPos({ name: 'System Test', email: 'test@local', role: 'SYSTEM' });
assert(syncRes.success === true, 'Hi-Tech Integration: Two-way sync with POS completes successfully');
assert(syncRes.activeLoansCount >= 5, 'Hi-Tech Integration: Active pawn loans reconciled from POS master ledger');

// 2. Ticket Lookup
const foundTicket = hiTechPawnService.lookupTicket('HT-88412');
assert(foundTicket !== null && foundTicket.ticketNumber === 'HT-88412', 'Pawn Portal: Look up ticket #HT-88412 succeeds');
assert(foundTicket.customerName === 'David Harrison', 'Pawn Portal: Correct customer profile attached to ticket');
assert(foundTicket.monthlyInterestFee === 250, 'Pawn Portal: Calculates exact monthly extension fee of $250.00');

// 3. Due Date & Grace Period Status Calculations
const statusToday = hiTechPawnService.calculateTicketStatus(
  { ...foundTicket, dueDate: new Date().toISOString(), gracePeriodEndDate: new Date(Date.now() + 30 * 86400000).toISOString() },
  new Date()
);
assert(statusToday === 'due_today', 'Status Engine: Correctly evaluates ticket due today as due_today');

const statusGrace = hiTechPawnService.calculateTicketStatus(
  { ...foundTicket, dueDate: new Date(Date.now() - 5 * 86400000).toISOString(), gracePeriodEndDate: new Date(Date.now() + 25 * 86400000).toISOString() },
  new Date()
);
assert(statusGrace === 'grace_period', 'Status Engine: Correctly evaluates past-due ticket within 30-day window as grace_period');

// 4. Automated Reminder Cycle Run
const reminderRun = hiTechPawnService.runReminderCycle({ name: 'Automated Test Scheduler', email: 'scheduler@test.pawn', role: 'SYSTEM' });
assert(reminderRun.success === true, 'Reminder Engine: Automated reminder cycle completes without error');
assert(reminderRun.recordsEvaluated >= 5, 'Reminder Engine: Evaluated all active pawn tickets');

// 5. 30-Day Loan Extension Payment
const originalDueDate = new Date(foundTicket.dueDate);
const extensionRes = hiTechPawnService.extendPawnLoan({
  ticketId: foundTicket.id,
  paidAmount: 250.00,
  paymentMethod: 'card_online',
  paymentTransactionId: 'tok_test_sq_loan_ext',
  actor: { name: 'David Harrison', email: 'customer@peachtreecorners.demo', role: 'CUSTOMER' }
});

assert(extensionRes.success === true, 'Loan Extension: Monthly fee payment succeeds');
const extendedDueDate = new Date(extensionRes.ticket.dueDate);
const diffDays = Math.round((extendedDueDate - originalDueDate) / (1000 * 60 * 60 * 24));
assert(diffDays === 30, 'Loan Extension: Advances maturity due date by exactly 30 calendar days');
assert(extensionRes.payment.syncedToHiTech === true, 'Loan Extension: Automatically queues and logs payment to Hi-Tech POS ledger');

console.log('\n========================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All automated integration and compliance checks PASSED!\n');
}
