// Core Database and Persistence Service for Peachtree Corners Loan & Pawn - THE VAULT
import { DEMO_PRODUCTS } from '../data/inventory.js';
import { STORE_INFO } from '../data/storeInfo.js';
import { DEFAULT_MARKDOWN_TIERS, getCurrentTier, calculateMarkdownPrice } from './markdownEngine.js';
import { DEFAULT_HITECH_SETTINGS } from './hiTechPawnService.js';

const DB_STORAGE_KEY = 'pc_vault_database_v2';

// Initial admin accounts
const INITIAL_ADMINS = [
  {
    id: 'admin-owner-01',
    email: 'owner@pawnshopnorcross.com',
    name: 'Executive Store Owner',
    role: 'OWNER',
    status: 'active',
    invitedBy: 'SYSTEM_BOOTSTRAP',
    createdAt: '2026-01-01T08:00:00Z',
    lastLogin: '2026-11-09T08:30:00Z',
    mfaEnabled: true
  },
  {
    id: 'admin-inv-02',
    email: 'inventory@pawnshopnorcross.com',
    name: 'Marcus Vance',
    role: 'INVENTORY_MANAGER',
    status: 'active',
    invitedBy: 'admin-owner-01',
    createdAt: '2026-01-15T10:00:00Z',
    lastLogin: '2026-11-08T17:15:00Z',
    mfaEnabled: true
  },
  {
    id: 'admin-ord-03',
    email: 'fulfillment@pawnshopnorcross.com',
    name: 'Sarah Jenkins',
    role: 'ORDER_MANAGER',
    status: 'active',
    invitedBy: 'admin-owner-01',
    createdAt: '2026-02-01T09:30:00Z',
    lastLogin: '2026-11-09T07:45:00Z',
    mfaEnabled: false
  },
  {
    id: 'admin-mkt-04',
    email: 'marketing@pawnshopnorcross.com',
    name: 'Elena Rostova',
    role: 'MARKETING_MANAGER',
    status: 'active',
    invitedBy: 'admin-owner-01',
    createdAt: '2026-03-10T11:00:00Z',
    lastLogin: '2026-11-07T14:20:00Z',
    mfaEnabled: false
  }
];

// Initial customer account
const INITIAL_CUSTOMERS = [
  {
    id: 'cust-demo-01',
    email: 'customer@peachtreecorners.demo',
    firstName: 'David',
    lastName: 'Harrison',
    phone: '(404) 555-0192',
    emailVerified: true,
    marketingPreferences: {
      emailWeeklyVault: true,
      emailNewArrivals: true,
      smsOrderUpdates: true,
      smsPromotions: false
    },
    createdAt: '2026-09-12T14:32:00Z',
    savedAddresses: [
      {
        id: 'addr-01',
        isDefault: true,
        street: '3400 Holcomb Bridge Rd, Apt 204',
        city: 'Peachtree Corners',
        state: 'GA',
        zip: '30092'
      }
    ]
  }
];

// Seed inventory transformed into full-stack commerce records
function generateInitialProducts() {
  return DEMO_PRODUCTS.map((item, index) => {
    // Parse numeric price from estimatedValue string like "$2,450"
    const numPrice = parseFloat(item.estimatedValue.replace(/[^0-9.]/g, '')) || 450;
    
    // Assign brands & SKUs
    let brand = "Verified Brand";
    if (item.category === 'jewelry') {
      if (item.title.includes("Swiss")) brand = "Swiss Heritage";
      else if (item.title.includes("Solitaire")) brand = "Estate Fine Diamond";
      else brand = "Estate Gold Collection";
    } else if (item.category === 'electronics') {
      if (item.title.includes("MacBook")) brand = "Apple";
      else if (item.title.includes("Sony")) brand = "Sony";
      else if (item.title.includes("iPad")) brand = "Apple";
      else if (item.title.includes("Gaming")) brand = "Sony PlayStation";
      else brand = "Premium Electronics";
    } else if (item.category === 'tools') {
      if (item.title.includes("Cordless")) brand = "DeWalt";
      else if (item.title.includes("Miter")) brand = "Milwaukee Tool";
      else brand = "Contractor Pro";
    } else if (item.category === 'instruments') {
      if (item.title.includes("Stratocaster") || item.title.includes("Fender")) brand = "Fender";
      else if (item.title.includes("Acoustic")) brand = "Martin & Co.";
      else brand = "Studio Sound";
    } else {
      brand = "Vault Collectible";
    }

    // SKU format: PC-[CAT]-[YEAR]-[INDEX]
    const catCode = item.category.slice(0, 3).toUpperCase();
    const sku = `PC-${catCode}-2026-${String(index + 101).padStart(4, '0')}`;
    
    // Dates added - staggered across life cycle and test ages (7d, 20d, 40d, 55d, 75d, 100d)
    const testAges = [3, 7, 10, 12, 18, 20, 25, 35, 40, 50, 55, 65, 75, 85, 95, 100, 110, 14, 22];
    const daysAgo = testAges[index % testAges.length];
    const dateAdded = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    // Vault Drops and New Arrivals
    const isNewArrival = daysAgo <= 14;
    const isVaultDrop = item.featured || index % 3 === 0;

    // Markdown calculation based on arrival date
    const tier = getCurrentTier(daysAgo, DEFAULT_MARKDOWN_TIERS);
    // On the 100-day item (index 15), enforce a floor price of 85% of original price
    const minimumPrice = (daysAgo === 100) ? Math.round(numPrice * 0.85) : null;
    const currentPrice = tier.discountPercent > 0
      ? calculateMarkdownPrice(numPrice, tier.discountPercent, minimumPrice)
      : numPrice;

    const initialHistory = tier.discountPercent > 0 ? [
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        fromPrice: numPrice,
        toPrice: currentPrice,
        discountPercent: tier.discountPercent,
        tier: tier.id,
        appliedBy: 'system_markdown_engine',
        reason: `Aging markdown — ${tier.label} (${daysAgo} days in inventory)`
      }
    ] : [];

    return {
      id: item.id,
      sku: sku,
      title: item.title,
      description: item.description,
      category: item.category,
      subcategory: item.subcategory || 'General',
      brand: brand,
      model: item.specs ? Object.values(item.specs)[0] || '' : '',
      condition: item.condition || 'Polished & Inspected',
      price: currentPrice,
      estimatedValue: `$${numPrice.toLocaleString()}`,
      quantity: 1, // High-value pawn inventory typically 1 of a kind
      images: [
        item.image,
        // Optional second lifestyle or macro shot
        item.image + '&auto=format&fit=crop&w=1200&q=80'
      ],
      primaryImage: item.image,
      dateAdded: dateAdded,
      status: index === 3 ? 'sold' : (index === 7 ? 'reserved' : 'available'),
      featured: item.featured || false,
      isNewArrival: isNewArrival,
      isVaultDrop: isVaultDrop,
      tags: [item.category, item.subcategory || '', brand, item.condition].filter(Boolean),
      specs: item.specs || {},
      aiGenerated: false,
      aiConfidence: {
        title: 'confirmed',
        category: 'confirmed',
        brand: 'verified',
        condition: 'human_inspected'
      },
      createdBy: 'admin-owner-01',
      modifiedBy: 'admin-inv-02',
      createdAt: dateAdded,
      updatedAt: dateAdded,
      // Markdown / aging fields
      inventoryArrivalDate: dateAdded,
      originalApprovedPrice: numPrice,
      minimumPrice: minimumPrice,
      markdownPaused: index === 11, // Test manual pause on one aged item
      markdownHistory: initialHistory,
      currentMarkdownTier: tier.id,
      currentDiscountPercent: tier.discountPercent,
    };
  });
}

// Initial demonstration orders
function generateInitialOrders() {
  return [
    {
      id: 'PC-2026-9104',
      orderNumber: 'PC-2026-9104',
      customerId: 'cust-demo-01',
      customerEmail: 'customer@peachtreecorners.demo',
      customerName: 'David Harrison',
      customerPhone: '(404) 555-0192',
      fulfillmentMethod: 'pickup',
      shippingAddress: null,
      pickupStoreInfo: {
        name: STORE_INFO.name,
        address: STORE_INFO.address.full,
        phone: STORE_INFO.phone.formatted,
        hours: 'Mon-Sat 9:30 AM - 6:00 PM'
      },
      items: [
        {
          productId: 'jewel-04',
          sku: 'PC-JEW-2026-0104',
          title: 'Vintage 18K Yellow Gold Diamond Tennis Bracelet (7")',
          price: 3200,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1611591475879-1662497672ec?auto=format&fit=crop&w=800&q=80'
        }
      ],
      subtotal: 3200.00,
      tax: 192.00, // 6% GA sales tax
      shippingCost: 0.00,
      total: 3392.00,
      paymentStatus: 'paid',
      orderStatus: 'ready_for_pickup',
      paymentMethod: 'card_online',
      paymentTransactionId: 'txn_sq_live_9941a8043c',
      paymentProvider: 'Square Sandbox (Simulated)',
      internalNotes: [
        {
          id: 'note-01',
          text: 'Customer requested evening pickup. Government ID verification required upon counter release.',
          author: 'Sarah Jenkins (Order Manager)',
          createdAt: '2026-11-08T11:20:00Z'
        }
      ],
      trackingNumber: '',
      createdAt: '2026-11-08T10:15:00Z',
      updatedAt: '2026-11-08T11:20:00Z'
    },
    {
      id: 'PC-2026-8842',
      orderNumber: 'PC-2026-8842',
      customerId: 'cust-demo-01',
      customerEmail: 'customer@peachtreecorners.demo',
      customerName: 'David Harrison',
      customerPhone: '(404) 555-0192',
      fulfillmentMethod: 'shipping',
      shippingAddress: {
        street: '3400 Holcomb Bridge Rd, Apt 204',
        city: 'Peachtree Corners',
        state: 'GA',
        zip: '30092'
      },
      items: [
        {
          productId: 'tool-02',
          sku: 'PC-TOO-2026-0109',
          title: 'Commercial 12" Dual-Bevel Sliding Compound Miter Saw',
          price: 495,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80'
        }
      ],
      subtotal: 495.00,
      tax: 29.70,
      shippingCost: 35.00,
      total: 559.70,
      paymentStatus: 'paid',
      orderStatus: 'completed',
      paymentMethod: 'card_online',
      paymentTransactionId: 'txn_sq_live_8841c109',
      paymentProvider: 'Stripe Sandbox (Simulated)',
      internalNotes: [
        {
          id: 'note-02',
          text: 'Inspected motor carbon brushes before shipping. Packed with custom foam corners.',
          author: 'Marcus Vance (Inventory)',
          createdAt: '2026-11-04T14:10:00Z'
        }
      ],
      trackingNumber: '1Z9999999999999999',
      createdAt: '2026-11-04T12:00:00Z',
      updatedAt: '2026-11-06T15:30:00Z'
    }
  ];
}

// Initial audit logs
function generateInitialAuditLogs() {
  return [
    {
      id: 'audit-001',
      timestamp: '2026-11-09T08:12:00Z',
      actorId: 'admin-owner-01',
      actorEmail: 'owner@pawnshopnorcross.com',
      actorRole: 'OWNER',
      action: 'SYSTEM_SETTINGS_UPDATE',
      entityType: 'system',
      entityId: 'global_config',
      details: { message: 'Verified production store tax configuration and in-store pickup policy.' },
      ipAddress: '192.168.1.1'
    },
    {
      id: 'audit-002',
      timestamp: '2026-11-08T16:45:00Z',
      actorId: 'admin-inv-02',
      actorEmail: 'inventory@pawnshopnorcross.com',
      actorRole: 'INVENTORY_MANAGER',
      action: 'PRODUCT_STATUS_UPDATE',
      entityType: 'product',
      entityId: 'jewel-04',
      details: { from: 'available', to: 'sold', reason: 'Online order PC-2026-9104 checkout completed' },
      ipAddress: '192.168.1.4'
    },
    {
      id: 'audit-003',
      timestamp: '2026-11-08T11:20:00Z',
      actorId: 'admin-ord-03',
      actorEmail: 'fulfillment@pawnshopnorcross.com',
      actorRole: 'ORDER_MANAGER',
      action: 'ORDER_STATUS_UPDATE',
      entityType: 'order',
      entityId: 'PC-2026-9104',
      details: { from: 'paid', to: 'ready_for_pickup', note: 'Customer notified via SMS & Email' },
      ipAddress: '192.168.1.7'
    }
  ];
}

// Initial marketing campaigns
function generateInitialCampaigns() {
  return [
    {
      id: 'camp-01',
      title: 'Weekly Vault Drop — Vol. 44',
      subject: 'THE VAULT: Just came in. Fresh estate gold and pro audio.',
      preheader: 'Discover what is new at Peachtree Corners Loan & Pawn before someone else does.',
      templateId: 'vault_drop',
      status: 'sent',
      scheduledFor: '2026-11-07T14:00:00Z',
      sentAt: '2026-11-07T14:01:00Z',
      featuredProductIds: ['jewel-01', 'jewel-02', 'inst-01'],
      stats: {
        recipientsCount: 428,
        openedCount: 231,
        clickedCount: 89
      },
      createdBy: 'admin-mkt-04'
    },
    {
      id: 'camp-02',
      title: 'Treasure Hunt Saturday Announcement',
      subject: 'This Saturday: Fresh Estate Jewelry & Contractor Gear Arrivals',
      preheader: 'Walk through 7040 Jimmy Carter Blvd Suite 4 for in-store preview.',
      templateId: 'treasure_saturday',
      status: 'draft',
      scheduledFor: null,
      sentAt: null,
      featuredProductIds: ['tool-01', 'jewel-03'],
      stats: {
        recipientsCount: 0,
        openedCount: 0,
        clickedCount: 0
      },
      createdBy: 'admin-mkt-04'
    }
  ];
}

// Recurring Vault Promotional drops configuration
export const INITIAL_PROMOTIONS = [
  {
    id: 'promo-mon',
    title: 'Monday Fresh Finds',
    dayOfWeek: 'Monday',
    tagline: 'First Look at Weekend Acquisitions',
    description: 'First look at weekend appraisal acquisitions. Live estate gold, diamond solitaires, and precision tools cataloged before general showroom display.',
    active: true,
    bannerColor: '#C5A15A',
    scheduleTime: 'Every Monday at 10:00 AM EST',
    featuredCategories: ['jewelry', 'tools'],
    discountNote: 'Showroom Verified Value',
    badgeText: 'MONDAY DROP'
  },
  {
    id: 'promo-wed',
    title: 'Wednesday Under-the-Radar Deals',
    dayOfWeek: 'Wednesday',
    tagline: 'Staff Curated Tech & Studio Gear',
    description: 'Staff-curated specialty finds and value discoveries in inspected electronics, contractor equipment, and studio audio gear.',
    active: true,
    bannerColor: '#A7A7A7',
    scheduleTime: 'Every Wednesday at 12:00 PM EST',
    featuredCategories: ['electronics', 'instruments'],
    discountNote: 'Value Worth Discovering',
    badgeText: 'MIDWEEK SPECIAL'
  },
  {
    id: 'promo-fri',
    title: 'Friday Vault Drop',
    dayOfWeek: 'Friday',
    tagline: 'Marquee High-End Estate Release',
    description: 'Our marquee weekly drop: High-end Swiss timepieces, solid 14K & 18K gold Cuban link chains, and premium contractor tool combos.',
    active: true,
    bannerColor: '#DFBE76',
    scheduleTime: 'Every Friday at 2:00 PM EST',
    featuredCategories: ['jewelry', 'tools', 'collectibles'],
    discountNote: 'Marquee Weekly Event',
    badgeText: 'SIGNATURE DROP'
  },
  {
    id: 'promo-sat',
    title: 'Saturday Treasure Hunt',
    dayOfWeek: 'Saturday',
    tagline: 'In-Store Showcase Discovery',
    description: 'In-person discovery event at 7040 Jimmy Carter Blvd. Walk our showcase floor for newly uncrated estate items and rare collectibles.',
    active: true,
    bannerColor: '#E2C37A',
    scheduleTime: 'Every Saturday at 9:30 AM EST',
    featuredCategories: ['jewelry', 'collectibles', 'instruments'],
    discountNote: 'In-Person Showcase Preview',
    badgeText: 'SATURDAY IN-STORE'
  }
];

export const INITIAL_CATEGORIES = [
  {
    id: 'jewelry',
    name: 'Fine Jewelry & Luxury Watches',
    slug: 'jewelry',
    description: 'Curated solid gold chains, diamond solitaire rings, engagement bands, and verified luxury timepieces.',
    itemCount: '50+ rotating items',
    active: true,
    requiresInspectionNotice: true
  },
  {
    id: 'electronics',
    name: 'Modern Electronics & Tech',
    slug: 'electronics',
    description: 'Inspected smartphones, premium laptops, noise-canceling headphones, 4K displays, and modern gaming consoles.',
    itemCount: 'Daily tested units',
    active: true,
    requiresInspectionNotice: true
  },
  {
    id: 'tools',
    name: 'Tools & Contractor Equipment',
    slug: 'tools',
    description: 'Commercial grade cordless brushless combo kits, heavy-duty compressors, diagnostic tools, and workshop gear.',
    itemCount: 'Commercial contractor stock',
    active: true,
    requiresInspectionNotice: true
  },
  {
    id: 'instruments',
    name: 'Musical Instruments & Pro Audio',
    slug: 'musical-instruments',
    description: 'Electric and acoustic guitars, keyboards, studio amplifiers, pro audio mixers, and performance gear.',
    itemCount: 'Studio & stage verified',
    active: true,
    requiresInspectionNotice: true
  },
  {
    id: 'collectibles',
    name: 'Collectibles & Specialty Finds',
    slug: 'collectibles',
    description: 'Vintage numismatics, rare coins, collectible timepieces, sports memorabilia, and unique curiosities.',
    itemCount: 'Unique estate finds',
    active: true,
    requiresInspectionNotice: true
  }
];

export const INITIAL_SETTINGS = {
  storeName: STORE_INFO.name,
  address: STORE_INFO.address.full,
  phone: STORE_INFO.phone.formatted,
  email: 'info@pawnshopnorcross.com',
  website: STORE_INFO.existingWebsite,
  hours: 'Monday – Saturday: 9:30 AM – 6:00 PM | Sunday: Closed',
  salesTaxRate: 0.06,
  flatShippingRate: 35.00,
  paymentProcessor: 'Square Sandbox (Simulated)',
  paymentProcessorStatus: 'sandbox_active',
  paymentProcessorUnderwritingNeeded: true,
  posIntegrationType: 'Bravo Pawn POS / Manual Counter Sync',
  posLastSync: '2026-11-09T08:30:00Z',
  smsProvider: 'Twilio Gateway (Simulated)',
  emailProvider: 'SendGrid / SMTP (Simulated)',
  reviewPlatformUrl: `${STORE_INFO.existingWebsite}#reviews`,
  reviewDelayHours: 48,
  requireGovIdOnPickup: true
};

// Initial database state
function createDefaultDatabase() {
  return {
    version: 2,
    products: generateInitialProducts(),
    orders: generateInitialOrders(),
    admins: INITIAL_ADMINS,
    customers: INITIAL_CUSTOMERS,
    promotions: INITIAL_PROMOTIONS,
    categories: INITIAL_CATEGORIES,
    settings: {
      ...INITIAL_SETTINGS,
      markdownSettings: {
        enabled: true,
        requireApproval: false,
        tiers: DEFAULT_MARKDOWN_TIERS,
        excludedProductIds: [],
        excludedCategories: [],
        categoryOverrides: {},
        businessTimezone: 'America/New_York',
        lastRunAt: null,
        lastRunBy: 'system',
      },
    },
    suppressionList: [],
    adminInvites: [
      {
        id: 'inv-01',
        email: 'appraiser@pawnshopnorcross.com',
        role: 'INVENTORY_MANAGER',
        token: 'tok_appr_883a9',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      }
    ],
    auditLogs: generateInitialAuditLogs(),
    campaigns: generateInitialCampaigns(),
    subscribers: [
      {
        id: 'sub-01',
        email: 'customer@peachtreecorners.demo',
        firstName: 'David',
        phone: '(404) 555-0192',
        emailConsent: true,
        smsConsent: false,
        source: 'vault_modal',
        subscribedAt: '2026-09-12T14:32:00Z',
        status: 'active'
      },
      {
        id: 'sub-02',
        email: 'collector.atlanta@gmail.com',
        firstName: 'Marcus',
        phone: '',
        emailConsent: true,
        smsConsent: false,
        source: 'footer',
        subscribedAt: '2026-10-01T09:15:00Z',
        status: 'active'
      }
    ],
    reviewInvitations: [
      {
        id: 'rev-01',
        orderId: 'PC-2026-8842',
        customerEmail: 'customer@peachtreecorners.demo',
        customerName: 'David Harrison',
        channel: 'email',
        scheduledFor: '2026-11-06T15:30:00Z',
        sentAt: '2026-11-06T15:30:00Z',
        status: 'sent',
        reviewUrl: 'https://pawnshopnorcross.com#reviews'
      }
    ],
    notificationLogs: [
      {
        id: 'notif-01',
        type: 'email',
        recipient: 'customer@peachtreecorners.demo',
        subject: 'Order Confirmed: #PC-2026-9104 | Peachtree Corners Loan & Pawn',
        previewText: 'Thank you for your order! Your 14K Miami Cuban Link is being prepared.',
        status: 'delivered',
        timestamp: '2026-11-08T10:15:30Z'
      },
      {
        id: 'notif-02',
        type: 'sms',
        recipient: '(404) 555-0192',
        subject: 'SMS: Ready for Pickup',
        previewText: 'Peachtree Corners Loan & Pawn: Your order #PC-2026-9104 is ready for pickup at 7040 Jimmy Carter Blvd.',
        status: 'delivered',
        timestamp: '2026-11-08T11:20:10Z'
      }
    ],
    // In-memory active reservations map { productId: { cartId, quantity, expiresAt } }
    reservations: {}
  };
}

// In-memory fallback cache for Node/SSR environments
let memoryStore = null;

// Database helper functions
export const dbService = {
  getSnapshot() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        if (!memoryStore) {
          memoryStore = createDefaultDatabase();
        }
        return memoryStore;
      }
      const raw = localStorage.getItem(DB_STORAGE_KEY);
      if (!raw) {
        const initial = createDefaultDatabase();
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      const parsed = JSON.parse(raw);
      // Auto-reconcile new tables if missing from previous version
      let changed = false;
      if (!parsed.promotions) {
        parsed.promotions = INITIAL_PROMOTIONS;
        changed = true;
      }
      if (!parsed.categories) {
        parsed.categories = INITIAL_CATEGORIES;
        changed = true;
      }
      if (!parsed.settings) {
        parsed.settings = INITIAL_SETTINGS;
        changed = true;
      }
      if (!parsed.suppressionList) {
        parsed.suppressionList = [];
        changed = true;
      }
      if (!parsed.settings.markdownSettings) {
        parsed.settings.markdownSettings = {
          enabled: true,
          requireApproval: false,
          tiers: DEFAULT_MARKDOWN_TIERS,
          excludedProductIds: [],
          excludedCategories: [],
          categoryOverrides: {},
          businessTimezone: 'America/New_York',
          lastRunAt: null,
          lastRunBy: 'system',
        };
        changed = true;
      }
      if (changed) {
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      console.warn("Storage access fallback to default database", e);
      if (!memoryStore) memoryStore = createDefaultDatabase();
      return memoryStore;
    }
  },

  saveSnapshot(data) {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        memoryStore = data;
        return;
      }
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save database snapshot", e);
      memoryStore = data;
    }
  },

  resetToDefault() {
    const initial = createDefaultDatabase();
    this.saveSnapshot(initial);
    return initial;
  },

  // Audit Logger
  logAudit(actor, action, entityType, entityId, details) {
    const data = this.getSnapshot();
    const newLog = {
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      actorId: actor?.id || 'system',
      actorEmail: actor?.email || 'system@peachtreecorners.pawn',
      actorRole: actor?.role || 'SYSTEM',
      action,
      entityType,
      entityId,
      details,
      ipAddress: '127.0.0.1 (Local Session)'
    };
    data.auditLogs = [newLog, ...(data.auditLogs || [])];
    this.saveSnapshot(data);
    return newLog;
  }
};
