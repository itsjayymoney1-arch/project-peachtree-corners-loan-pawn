import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { dbService } from '../services/db';
import { emailService } from '../services/emailService';
import { smsService } from '../services/smsService';
import { paymentAdapter } from '../services/paymentAdapter';
import { runMarkdownEngine as markdownEngineRun, getInventoryAgingStats, DEFAULT_MARKDOWN_TIERS } from '../services/markdownEngine';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Load raw snapshot from dbService
  const [db, setDb] = useState(() => dbService.getSnapshot());

  // Customer session state
  const [customerUser, setCustomerUser] = useState(() => {
    // Default to the demo customer logged in for smooth exploration, or check localStorage
    const savedId = localStorage.getItem('pc_current_customer_id');
    const existing = dbService.getSnapshot().customers.find(c => c.id === savedId);
    return existing || dbService.getSnapshot().customers[0] || null;
  });

  // Admin session state
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const savedAdminId = localStorage.getItem('pc_current_admin_id');
    const admins = dbService.getSnapshot().admins;
    const existing = admins.find(a => a.id === savedAdminId);
    // Default to OWNER for full inspection access
    return existing || admins[0];
  });

  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('pc_shopping_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pc_shopping_cart', JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [cart]);

  // Sync DB updates helper
  const reloadDb = useCallback(() => {
    const updated = dbService.getSnapshot();
    setDb(updated);
  }, []);

  // Customer Authentication Methods
  const registerCustomer = useCallback(async ({ email, firstName, lastName, phone, password, marketingPreferences }) => {
    const freshDb = dbService.getSnapshot();
    const existing = freshDb.customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const newCustomer = {
      id: 'cust-' + Date.now(),
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || '',
      emailVerified: false,
      marketingPreferences: marketingPreferences || {
        emailWeeklyVault: false,
        emailNewArrivals: false,
        smsOrderUpdates: true,
        smsPromotions: false
      },
      createdAt: new Date().toISOString()
    };

    freshDb.customers = [newCustomer, ...(freshDb.customers || [])];
    
    // If they checked marketing consent, add to marketing subscribers
    if (newCustomer.marketingPreferences.emailWeeklyVault) {
      freshDb.subscribers = [
        {
          id: 'sub-' + Date.now(),
          email: newCustomer.email,
          firstName: newCustomer.firstName,
          phone: newCustomer.phone,
          emailConsent: true,
          smsConsent: newCustomer.marketingPreferences.smsPromotions,
          source: 'account_registration',
          subscribedAt: new Date().toISOString(),
          status: 'active'
        },
        ...(freshDb.subscribers || [])
      ];
    }

    dbService.saveSnapshot(freshDb);
    reloadDb();

    // Set as active customer
    setCustomerUser(newCustomer);
    localStorage.setItem('pc_current_customer_id', newCustomer.id);

    // Send welcome email
    try {
      emailService.sendWelcomeEmail(newCustomer);
    } catch (e) {
      console.warn("Welcome email failed", e);
    }

    dbService.logAudit(
      { id: newCustomer.id, email: newCustomer.email, role: 'CUSTOMER' },
      'CUSTOMER_REGISTERED',
      'customer',
      newCustomer.id,
      { email: newCustomer.email }
    );

    return newCustomer;
  }, [reloadDb]);

  const loginCustomer = useCallback(async (email, password) => {
    const freshDb = dbService.getSnapshot();
    const customer = freshDb.customers.find(c => c.email.toLowerCase() === email.trim().toLowerCase());
    if (!customer) {
      throw new Error("No customer account found with that email. Please check your credentials or register.");
    }

    setCustomerUser(customer);
    localStorage.setItem('pc_current_customer_id', customer.id);
    return customer;
  }, []);

  const logoutCustomer = useCallback(() => {
    setCustomerUser(null);
    localStorage.removeItem('pc_current_customer_id');
  }, []);

  const updateCustomerProfile = useCallback((updates) => {
    if (!customerUser) return;
    const freshDb = dbService.getSnapshot();
    const index = freshDb.customers.findIndex(c => c.id === customerUser.id);
    if (index !== -1) {
      const updated = { ...freshDb.customers[index], ...updates, updatedAt: new Date().toISOString() };
      freshDb.customers[index] = updated;
      dbService.saveSnapshot(freshDb);
      setCustomerUser(updated);
      reloadDb();
    }
  }, [customerUser, reloadDb]);

  const updateMarketingPreferences = useCallback((newPreferences) => {
    if (!customerUser) return;
    updateCustomerProfile({ marketingPreferences: newPreferences });
    
    // Also update subscribers table
    const freshDb = dbService.getSnapshot();
    freshDb.subscribers = (freshDb.subscribers || []).map(s => {
      if (s.email.toLowerCase() === customerUser.email.toLowerCase()) {
        return {
          ...s,
          emailConsent: newPreferences.emailWeeklyVault,
          smsConsent: newPreferences.smsPromotions
        };
      }
      return s;
    });
    dbService.saveSnapshot(freshDb);
    reloadDb();
  }, [customerUser, updateCustomerProfile, reloadDb]);

  const requestAccountDeletion = useCallback(() => {
    if (!customerUser) return;
    const freshDb = dbService.getSnapshot();
    freshDb.customers = freshDb.customers.filter(c => c.id !== customerUser.id);
    freshDb.subscribers = freshDb.subscribers.filter(s => s.email.toLowerCase() !== customerUser.email.toLowerCase());
    dbService.saveSnapshot(freshDb);
    dbService.logAudit(
      { id: customerUser.id, email: customerUser.email, role: 'CUSTOMER' },
      'CUSTOMER_ACCOUNT_DELETED',
      'customer',
      customerUser.id,
      { email: customerUser.email }
    );
    logoutCustomer();
    reloadDb();
  }, [customerUser, logoutCustomer, reloadDb]);

  // Admin Authentication & RBAC
  const switchAdminRole = useCallback((roleName) => {
    const freshDb = dbService.getSnapshot();
    const matched = freshDb.admins.find(a => a.role === roleName) || freshDb.admins[0];
    if (matched) {
      setCurrentAdmin(matched);
      localStorage.setItem('pc_current_admin_id', matched.id);
    }
  }, []);

  const loginAdmin = useCallback(async (email, password) => {
    const freshDb = dbService.getSnapshot();
    const admin = freshDb.admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!admin) {
      throw new Error("Administrative profile not recognized.");
    }
    if (admin.status === 'suspended') {
      throw new Error("This administrative account has been suspended by the store owner.");
    }
    setCurrentAdmin(admin);
    localStorage.setItem('pc_current_admin_id', admin.id);
    
    dbService.logAudit(
      admin,
      'ADMIN_LOGIN',
      'admin',
      admin.id,
      { email: admin.email, role: admin.role }
    );
    return admin;
  }, []);

  const logoutAdmin = useCallback(() => {
    setCurrentAdmin(null);
    localStorage.removeItem('pc_current_admin_id');
  }, []);

  const checkPermission = useCallback((permissionKey) => {
    if (!currentAdmin) return false;
    const role = currentAdmin.role;
    
    // OWNER has full system access
    if (role === 'OWNER') return true;

    // INVENTORY_MANAGER
    if (role === 'INVENTORY_MANAGER') {
      const allowed = ['view_inventory', 'create_product', 'edit_product', 'archive_product', 'record_instore_sale', 'smart_intake', 'manage_inventory', 'manage_markdown', 'run_markdown_engine'];
      return allowed.includes(permissionKey);
    }

    // ORDER_MANAGER
    if (role === 'ORDER_MANAGER') {
      const allowed = ['view_orders', 'update_order_status', 'add_order_notes', 'process_refund', 'view_customer_contact'];
      return allowed.includes(permissionKey);
    }

    // MARKETING_MANAGER
    if (role === 'MARKETING_MANAGER') {
      const allowed = ['view_marketing', 'create_campaign', 'dispatch_vault_drop', 'view_subscribers'];
      return allowed.includes(permissionKey);
    }

    return false;
  }, [currentAdmin]);

  const inviteAdmin = useCallback(async ({ email, role }) => {
    if (currentAdmin?.role !== 'OWNER') {
      throw new Error("Only an OWNER / SUPER ADMIN may invite new administrative personnel.");
    }

    const freshDb = dbService.getSnapshot();
    const token = 'tok_inv_' + Math.random().toString(36).substring(2, 9);
    const newInvite = {
      id: 'inv-' + Date.now(),
      email: email.trim().toLowerCase(),
      role,
      token,
      invitedBy: currentAdmin.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    };

    freshDb.adminInvites = [newInvite, ...(freshDb.adminInvites || [])];
    
    // Also create the initial placeholder admin profile
    const newAdmin = {
      id: 'admin-' + Date.now(),
      email: email.trim().toLowerCase(),
      name: email.split('@')[0],
      role,
      status: 'invited',
      invitedBy: currentAdmin.id,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      mfaEnabled: false
    };

    freshDb.admins = [newAdmin, ...(freshDb.admins || [])];
    dbService.saveSnapshot(freshDb);
    reloadDb();

    dbService.logAudit(
      currentAdmin,
      'ADMIN_INVITATION_ISSUED',
      'admin',
      newAdmin.id,
      { invitedEmail: email, role, token }
    );

    return newInvite;
  }, [currentAdmin, reloadDb]);

  const updateAdminStatus = useCallback((adminId, newStatus) => {
    if (currentAdmin?.role !== 'OWNER') {
      throw new Error("Only an OWNER / SUPER ADMIN may modify staff credentials.");
    }
    const freshDb = dbService.getSnapshot();
    const target = freshDb.admins.find(a => a.id === adminId);
    if (!target) return;

    if (target.role === 'OWNER' && newStatus === 'suspended') {
      throw new Error("The Primary Owner account cannot be suspended.");
    }

    freshDb.admins = freshDb.admins.map(a => a.id === adminId ? { ...a, status: newStatus } : a);
    dbService.saveSnapshot(freshDb);
    reloadDb();

    dbService.logAudit(
      currentAdmin,
      'ADMIN_STATUS_CHANGED',
      'admin',
      adminId,
      { targetEmail: target.email, newStatus }
    );
  }, [currentAdmin, reloadDb]);

  // Cart & Inventory Operations
  const addToCart = useCallback((product, quantity = 1) => {
    if (product.status === 'sold') {
      throw new Error("This item has already been purchased.");
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.quantity) {
          throw new Error(`Only ${product.quantity} available in showroom stock.`);
        }
        return prev.map(item => item.productId === product.id ? { ...item, quantity: nextQty } : item);
      }
      return [...prev, {
        productId: product.id,
        sku: product.sku,
        title: product.title,
        price: product.price,
        image: product.primaryImage || product.images?.[0] || product.image,
        category: product.category,
        quantity: Math.min(quantity, product.quantity),
        maxAvailable: product.quantity,
        addedAt: new Date().toISOString()
      }];
    });

    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const capped = Math.min(quantity, item.maxAvailable || 1);
        return { ...item, quantity: capped };
      }
      return item;
    }));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Products & Inventory Management
  const addProduct = useCallback((productData) => {
    if (!checkPermission('create_product')) {
      throw new Error("Unauthorized: Staff role does not have permission to add merchandise.");
    }

    const freshDb = dbService.getSnapshot();
    const newId = 'prod-' + Date.now();
    const catCode = (productData.category || 'GEN').slice(0, 3).toUpperCase();
    const sku = productData.sku || `PC-${catCode}-2026-${String(freshDb.products.length + 101).padStart(4, '0')}`;

    const newProduct = {
      id: newId,
      sku,
      title: productData.title,
      description: productData.description || '',
      category: productData.category || 'jewelry',
      subcategory: productData.subcategory || 'General',
      brand: productData.brand || 'Verified Brand',
      model: productData.model || '',
      condition: productData.condition || 'Polished & Inspected',
      price: parseFloat(productData.price) || 0,
      estimatedValue: `$${(parseFloat(productData.price) || 0).toLocaleString()}`,
      quantity: parseInt(productData.quantity, 10) || 1,
      images: productData.images?.length ? productData.images : [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
      ],
      primaryImage: productData.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      dateAdded: new Date().toISOString(),
      status: productData.status || 'available', // available, draft, reserved, sold, archived
      featured: Boolean(productData.featured),
      isNewArrival: Boolean(productData.isNewArrival ?? true),
      isVaultDrop: Boolean(productData.isVaultDrop),
      tags: productData.tags || [],
      specs: productData.specs || {},
      aiGenerated: Boolean(productData.aiGenerated),
      aiConfidence: productData.aiConfidence || null,
      createdBy: currentAdmin?.id || 'admin',
      modifiedBy: currentAdmin?.id || 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    freshDb.products = [newProduct, ...freshDb.products];
    dbService.saveSnapshot(freshDb);
    reloadDb();

    dbService.logAudit(
      currentAdmin,
      'PRODUCT_CREATED',
      'product',
      newProduct.id,
      { sku: newProduct.sku, title: newProduct.title, price: newProduct.price, status: newProduct.status }
    );

    return newProduct;
  }, [checkPermission, currentAdmin, reloadDb]);

  const updateProduct = useCallback((productId, updates) => {
    if (!checkPermission('edit_product')) {
      throw new Error("Unauthorized: Staff role does not have permission to edit merchandise.");
    }

    const freshDb = dbService.getSnapshot();
    const index = freshDb.products.findIndex(p => p.id === productId);
    if (index === -1) throw new Error("Product not found");

    const previous = freshDb.products[index];
    const updated = {
      ...previous,
      ...updates,
      modifiedBy: currentAdmin?.id || 'admin',
      updatedAt: new Date().toISOString()
    };

    if (updates.price) {
      updated.estimatedValue = `$${parseFloat(updates.price).toLocaleString()}`;
    }

    freshDb.products[index] = updated;
    dbService.saveSnapshot(freshDb);
    reloadDb();

    dbService.logAudit(
      currentAdmin,
      'PRODUCT_UPDATED',
      'product',
      productId,
      { changes: updates, previousPrice: previous.price, newPrice: updated.price }
    );

    return updated;
  }, [checkPermission, currentAdmin, reloadDb]);

  // Order Management
  const updateOrderStatus = useCallback((orderId, newStatus, fulfillmentNotes = '') => {
    if (!checkPermission('update_order_status')) {
      throw new Error("Unauthorized: Staff role does not have permission to change order fulfillment.");
    }

    const freshDb = dbService.getSnapshot();
    const orderIndex = freshDb.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");

    const order = freshDb.orders[orderIndex];
    const oldStatus = order.orderStatus;
    
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();

    if (fulfillmentNotes) {
      order.internalNotes = [
        {
          id: 'note-' + Date.now(),
          text: fulfillmentNotes,
          author: `${currentAdmin.name} (${currentAdmin.role})`,
          createdAt: new Date().toISOString()
        },
        ...(order.internalNotes || [])
      ];
    }

    freshDb.orders[orderIndex] = order;
    dbService.saveSnapshot(freshDb);
    reloadDb();

    dbService.logAudit(
      currentAdmin,
      'ORDER_STATUS_UPDATED',
      'order',
      orderId,
      { from: oldStatus, to: newStatus, notes: fulfillmentNotes }
    );

    // Automated notification dispatch on status change
    if (newStatus === 'ready_for_pickup') {
      try {
        emailService.sendReadyForPickup(order);
        if (order.customerPhone) {
          smsService.sendReadyForPickupSms(order);
        }
      } catch (e) {
        console.error("Failed to send ready for pickup notification", e);
      }
    } else if (newStatus === 'completed') {
      // Trigger review workflow schedule
      try {
        emailService.sendReviewInvitation(order);
        if (order.customerPhone) {
          smsService.sendReviewInvitationSms(order);
        }
      } catch (e) {
        console.error("Failed to send review invitation", e);
      }
    }

    return order;
  }, [checkPermission, currentAdmin, reloadDb]);

  const addOrderNote = useCallback((orderId, noteText) => {
    if (!checkPermission('add_order_notes')) {
      throw new Error("Unauthorized: Cannot add order notes.");
    }

    const freshDb = dbService.getSnapshot();
    const order = freshDb.orders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found");

    const newNote = {
      id: 'note-' + Date.now(),
      text: noteText,
      author: `${currentAdmin.name} (${currentAdmin.role})`,
      createdAt: new Date().toISOString()
    };

    order.internalNotes = [newNote, ...(order.internalNotes || [])];
    order.updatedAt = new Date().toISOString();
    dbService.saveSnapshot(freshDb);
    reloadDb();

    return newNote;
  }, [checkPermission, currentAdmin, reloadDb]);

  const processOrderRefund = useCallback((orderId, refundAmount, reason) => {
    if (!checkPermission('process_refund')) {
      throw new Error("Unauthorized: Staff role does not have permission to issue refunds.");
    }

    const freshDb = dbService.getSnapshot();
    const order = freshDb.orders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found");

    order.paymentStatus = 'refunded';
    order.orderStatus = 'refunded';
    order.refundDetails = {
      amount: refundAmount || order.total,
      reason,
      processedBy: currentAdmin.name,
      processedAt: new Date().toISOString()
    };

    order.internalNotes = [
      {
        id: 'note-refund-' + Date.now(),
        text: `REFUND PROCESSED: $${(refundAmount || order.total).toFixed(2)}. Reason: ${reason}`,
        author: `${currentAdmin.name} (${currentAdmin.role})`,
        createdAt: new Date().toISOString()
      },
      ...(order.internalNotes || [])
    ];

    // Optionally restore inventory
    order.items.forEach(item => {
      const prod = freshDb.products.find(p => p.id === item.productId);
      if (prod) {
        prod.quantity += item.quantity;
        if (prod.status === 'sold') {
          prod.status = 'available';
        }
      }
    });

    dbService.saveSnapshot(freshDb);
    reloadDb();

    dbService.logAudit(
      currentAdmin,
      'ORDER_REFUNDED',
      'order',
      orderId,
      { amount: refundAmount, reason }
    );

    return order;
  }, [checkPermission, currentAdmin, reloadDb]);

  // Marketing & Subscribers
  const subscribeToVaultWeekly = useCallback(async ({ email, firstName, phone, consentEmail = true, consentSms = false }) => {
    const freshDb = dbService.getSnapshot();
    const cleanEmail = email.trim().toLowerCase();
    const existing = (freshDb.subscribers || []).find(s => s.email.toLowerCase() === cleanEmail);

    if (existing) {
      existing.emailConsent = consentEmail;
      existing.smsConsent = consentSms;
      existing.status = 'active';
    } else {
      const newSub = {
        id: 'sub-' + Date.now(),
        email: cleanEmail,
        firstName: firstName?.trim() || '',
        phone: phone?.trim() || '',
        emailConsent: consentEmail,
        smsConsent: consentSms,
        source: 'vault_weekly_form',
        subscribedAt: new Date().toISOString(),
        status: 'active'
      };
      freshDb.subscribers = [newSub, ...(freshDb.subscribers || [])];
    }

    dbService.saveSnapshot(freshDb);
    reloadDb();

    // Send instant confirmation campaign preview
    try {
      emailService.sendEmail({
        to: cleanEmail,
        subject: "Welcome to The Vault Weekly | Peachtree Corners Loan & Pawn",
        previewText: "You are subscribed to exclusive new arrivals and weekly drops.",
        contentHtml: `
          <h2 style="color: #C5A15A;">THE BEST FINDS DON'T STAY SECRET.</h2>
          <p style="color: #A7A7A7; line-height: 1.6;">
            Thank you for subscribing to <strong>The Vault Weekly</strong>. Every week, our estate appraisers and inventory specialists release the finest arrivals before they hit the general showroom floor.
          </p>
          <div style="background-color: rgba(197, 161, 90, 0.1); border-left: 3px solid #C5A15A; padding: 14px; margin: 16px 0;">
            <strong>Showroom Address:</strong><br>
            7040 Jimmy Carter Blvd, Suite 4, Peachtree Corners, GA 30092<br>
            Call: (678) 691-1692
          </div>
          <p style="text-align: center;">
            <a href="#/vault" style="display: inline-block; background-color: #C5A15A; color: #090909; padding: 10px 24px; font-weight: bold; text-decoration: none; border-radius: 2px;">Browse This Week's Vault</a>
          </p>
        `,
        category: 'marketing'
      });
    } catch (e) {
      console.warn("Welcome sub email failed", e);
    }

    return { success: true };
  }, [reloadDb]);

  const createAndDispatchCampaign = useCallback(async (campaignData) => {
    if (!checkPermission('create_campaign')) {
      throw new Error("Unauthorized: Staff role cannot dispatch campaigns.");
    }

    const freshDb = dbService.getSnapshot();
    const newCamp = {
      id: 'camp-' + Date.now(),
      title: campaignData.title,
      subject: campaignData.subject,
      preheader: campaignData.preheader,
      templateId: campaignData.templateId || 'vault_drop',
      status: 'sent',
      scheduledFor: null,
      sentAt: new Date().toISOString(),
      featuredProductIds: campaignData.featuredProductIds || [],
      stats: {
        recipientsCount: (freshDb.subscribers || []).filter(s => s.status === 'active' && s.emailConsent).length,
        openedCount: 0,
        clickedCount: 0
      },
      createdBy: currentAdmin.id
    };

    freshDb.campaigns = [newCamp, ...(freshDb.campaigns || [])];
    dbService.saveSnapshot(freshDb);
    reloadDb();

    // Dispatch email to all eligible subscribers
    const activeSubs = (freshDb.subscribers || []).filter(s => s.status === 'active' && s.emailConsent);
    activeSubs.forEach(sub => {
      emailService.sendVaultDropCampaign(newCamp, sub);
    });

    dbService.logAudit(
      currentAdmin,
      'MARKETING_CAMPAIGN_DISPATCHED',
      'campaign',
      newCamp.id,
      { title: newCamp.title, recipientCount: activeSubs.length }
    );

    return newCamp;
  }, [checkPermission, currentAdmin, reloadDb]);

  // Markdown Engine Methods
  const runMarkdownEngine = useCallback(async () => {
    if (!checkPermission('manage_inventory')) {
      throw new Error('Unauthorized: insufficient permissions to run markdown engine.');
    }
    
    const freshDb = dbService.getSnapshot();
    const settings = freshDb.settings?.markdownSettings || {
      enabled: true,
      requireApproval: false,
      tiers: DEFAULT_MARKDOWN_TIERS,
      excludedProductIds: [],
      excludedCategories: [],
    };
    
    if (!settings.enabled) {
      return { processed: 0, changed: 0, message: 'Markdown engine is disabled.' };
    }
    
    const eligibleProducts = freshDb.products || [];
    const results = markdownEngineRun(eligibleProducts, settings);
    
    let changedCount = 0;
    results.forEach(result => {
      if (result.changed) {
        const idx = freshDb.products.findIndex(p => p.id === result.productId);
        if (idx !== -1) {
          const product = freshDb.products[idx];
          // Add to markdown history
          const historyEntry = {
            date: new Date().toISOString(),
            fromPrice: result.previousPrice,
            toPrice: result.newPrice,
            discountPercent: result.discountPercent,
            tier: result.tier,
            appliedBy: 'system_markdown_engine',
          };
          freshDb.products[idx] = {
            ...product,
            price: result.newPrice,
            currentDiscountPercent: result.discountPercent,
            currentMarkdownTier: result.tier,
            markdownHistory: [...(product.markdownHistory || []), historyEntry],
            updatedAt: new Date().toISOString(),
          };
          changedCount++;
          
          // Log audit
          dbService.logAudit(
            currentAdmin || { id: 'system', email: 'system', role: 'SYSTEM' },
            'MARKDOWN_PRICE_UPDATE',
            'product',
            result.productId,
            { 
              previousPrice: result.previousPrice, 
              newPrice: result.newPrice, 
              discountPercent: result.discountPercent,
              reason: result.reason 
            }
          );
        }
      }
    });
    
    // Update lastRunAt
    if (!freshDb.settings) freshDb.settings = {};
    if (!freshDb.settings.markdownSettings) freshDb.settings.markdownSettings = settings;
    freshDb.settings.markdownSettings.lastRunAt = new Date().toISOString();
    freshDb.settings.markdownSettings.lastRunBy = currentAdmin?.email || 'system';
    
    dbService.saveSnapshot(freshDb);
    reloadDb();
    
    return { processed: results.length, changed: changedCount };
  }, [checkPermission, currentAdmin, reloadDb]);

  const getMarkdownSettings = useCallback(() => {
    const freshDb = dbService.getSnapshot();
    return freshDb.settings?.markdownSettings || {
      enabled: true,
      requireApproval: false,
      tiers: DEFAULT_MARKDOWN_TIERS,
      excludedProductIds: [],
      excludedCategories: [],
    };
  }, []);

  const updateMarkdownSettings = useCallback((newSettings) => {
    if (!checkPermission('manage_inventory')) {
      throw new Error('Unauthorized');
    }
    const freshDb = dbService.getSnapshot();
    if (!freshDb.settings) freshDb.settings = {};
    freshDb.settings.markdownSettings = { ...freshDb.settings.markdownSettings, ...newSettings };
    dbService.saveSnapshot(freshDb);
    reloadDb();
    
    dbService.logAudit(
      currentAdmin,
      'MARKDOWN_SETTINGS_UPDATE',
      'system',
      'markdown_settings',
      newSettings
    );
  }, [checkPermission, currentAdmin, reloadDb]);

  const getAgingReport = useCallback(() => {
    const freshDb = dbService.getSnapshot();
    const settings = freshDb.settings?.markdownSettings || {
      enabled: true,
      tiers: DEFAULT_MARKDOWN_TIERS,
      excludedProductIds: [],
      excludedCategories: [],
    };
    return getInventoryAgingStats(freshDb.products || [], settings);
  }, []);

  const overrideProductPrice = useCallback((productId, newPrice, reason) => {
    if (!checkPermission('manage_inventory')) throw new Error('Unauthorized');
    const freshDb = dbService.getSnapshot();
    const idx = freshDb.products.findIndex(p => p.id === productId);
    if (idx === -1) throw new Error('Product not found');
    
    const product = freshDb.products[idx];
    const historyEntry = {
      date: new Date().toISOString(),
      fromPrice: product.price,
      toPrice: parseFloat(newPrice),
      discountPercent: product.originalApprovedPrice ? 
        Math.round((1 - parseFloat(newPrice) / product.originalApprovedPrice) * 100) : 0,
      tier: 'manual_override',
      appliedBy: currentAdmin?.email || 'staff',
      reason: reason || 'Manual price override',
    };
    
    freshDb.products[idx] = {
      ...product,
      price: parseFloat(newPrice),
      markdownHistory: [...(product.markdownHistory || []), historyEntry],
      updatedAt: new Date().toISOString(),
    };
    
    dbService.saveSnapshot(freshDb);
    reloadDb();
    
    dbService.logAudit(currentAdmin, 'PRICE_OVERRIDE', 'product', productId, {
      previousPrice: product.price,
      newPrice: parseFloat(newPrice),
      reason,
    });
  }, [checkPermission, currentAdmin, reloadDb]);

  // Reset database to default seed
  const resetDemoData = useCallback(() => {
    const fresh = dbService.resetToDefault();
    setDb(fresh);
    setCart([]);
    localStorage.removeItem('pc_shopping_cart');
    setCurrentAdmin(fresh.admins[0]);
    setCustomerUser(fresh.customers[0]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        // Database models
        products: db.products || [],
        orders: db.orders || [],
        admins: db.admins || [],
        customers: db.customers || [],
        subscribers: db.subscribers || [],
        campaigns: db.campaigns || [],
        notificationLogs: db.notificationLogs || [],
        auditLogs: db.auditLogs || [],

        // Customer Auth
        customerUser,
        registerCustomer,
        loginCustomer,
        logoutCustomer,
        updateCustomerProfile,
        updateMarketingPreferences,
        requestAccountDeletion,

        // Admin Auth & RBAC
        currentAdmin,
        loginAdmin,
        logoutAdmin,
        switchAdminRole,
        checkPermission,
        inviteAdmin,
        updateAdminStatus,

        // Cart
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,

        // Inventory
        addProduct,
        updateProduct,

        // Orders
        updateOrderStatus,
        addOrderNote,
        processOrderRefund,

        // Marketing
        subscribeToVaultWeekly,
        createAndDispatchCampaign,

        // Markdown Engine & Aging
        runMarkdownEngine,
        getMarkdownSettings,
        updateMarkdownSettings,
        getAgingReport,
        overrideProductPrice,

        // Reset
        resetDemoData,
        reloadDb
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
