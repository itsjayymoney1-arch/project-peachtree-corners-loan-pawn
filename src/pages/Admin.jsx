import React, { useState, useMemo } from 'react';
import { useRouter } from '../context/RouterContext';
import { useApp } from '../context/AppContext';
import { STORE_INFO } from '../data/storeInfo';
import SmartInventoryIntakeModal from '../components/SmartInventoryIntakeModal';
import { paymentAdapter } from '../services/paymentAdapter';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Megaphone, 
  Users, 
  ShieldCheck, 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Store, 
  Truck, 
  Eye, 
  Edit3, 
  Archive, 
  RotateCcw, 
  Mail, 
  MessageSquare,
  Sparkles,
  Lock,
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export default function Admin() {
  const { 
    products, 
    orders, 
    admins, 
    customers, 
    subscribers, 
    campaigns, 
    auditLogs, 
    notificationLogs,
    currentAdmin, 
    switchAdminRole, 
    checkPermission, 
    inviteAdmin, 
    updateAdminStatus,
    updateProduct,
    updateOrderStatus,
    addOrderNote,
    processOrderRefund,
    createAndDispatchCampaign,
    resetDemoData
  } = useApp();

  const { navigate } = useRouter();

  // Active admin tab: 'overview', 'inventory', 'orders', 'marketing', 'staff', 'audit', 'notifications'
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProductEdit, setSelectedProductEdit] = useState(null);
  const [inStoreSaleModalOpen, setInStoreSaleModalOpen] = useState(false);
  const [inStoreSaleProduct, setInStoreSaleProduct] = useState(null);
  const [inStoreSalePrice, setInStoreSalePrice] = useState('');
  const [inStoreSaleQty, setInStoreSaleQty] = useState(1);
  const [inStoreSaleType, setInStoreSaleType] = useState('cash');

  // New Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('INVENTORY_MANAGER');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  // New Campaign state
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignPreheader, setCampaignPreheader] = useState('');
  const [campaignTemplate, setCampaignTemplate] = useState('vault_drop');
  const [campaignSuccess, setCampaignSuccess] = useState('');

  // Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Internal Order Note state
  const [newOrderNote, setNewOrderNote] = useState('');
  const [orderFulfillmentStatus, setOrderFulfillmentStatus] = useState('');

  // Status message
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Calculations for Overview Dashboard Metrics
  const activeProductsCount = products.filter(p => p.status === 'available').length;
  const soldProductsCount = products.filter(p => p.status === 'sold').length;
  const newArrivalsCount = products.filter(p => p.isNewArrival && p.status === 'available').length;
  
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + (o.total || 0), 0);
  
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'paid' || o.orderStatus === 'processing' || o.orderStatus === 'ready_for_pickup').length;
  const completedOrdersCount = orders.filter(o => o.orderStatus === 'completed').length;
  const activeSubscribersCount = subscribers.filter(s => s.status === 'active').length;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
      if (productStatusFilter !== 'all' && p.status !== productStatusFilter) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        const mTitle = p.title?.toLowerCase().includes(q);
        const mBrand = p.brand?.toLowerCase().includes(q);
        const mSku = p.sku?.toLowerCase().includes(q);
        if (!mTitle && !mBrand && !mSku) return false;
      }
      return true;
    });
  }, [products, productCategoryFilter, productStatusFilter, productSearch]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderStatusFilter !== 'all' && o.orderStatus !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const mNum = o.orderNumber?.toLowerCase().includes(q);
        const mName = o.customerName?.toLowerCase().includes(q);
        const mEmail = o.customerEmail?.toLowerCase().includes(q);
        if (!mNum && !mName && !mEmail) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Handle Quick In-Store Sale Submission
  const handleRecordInStoreSale = async (e) => {
    e.preventDefault();
    if (!inStoreSaleProduct) return;
    try {
      await paymentAdapter.recordInStoreSale({
        product: inStoreSaleProduct,
        quantity: parseInt(inStoreSaleQty, 10) || 1,
        sellingPrice: parseFloat(inStoreSalePrice) || inStoreSaleProduct.price,
        paymentType: inStoreSaleType,
        cashierNote: `In-store counter purchase processed by ${currentAdmin?.name}`,
        actor: currentAdmin
      });
      setFeedbackMsg(`In-Store Sale recorded! Stock deducted for "${inStoreSaleProduct.title}".`);
      setInStoreSaleModalOpen(false);
      setInStoreSaleProduct(null);
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Admin Invite
  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await inviteAdmin({ email: inviteEmail, role: inviteRole });
      setInviteSuccessMsg(`Invitation dispatched to ${inviteEmail} with role ${inviteRole}.`);
      setInviteEmail('');
      setTimeout(() => setInviteSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Campaign Dispatch
  const handleDispatchCampaign = async (e) => {
    e.preventDefault();
    if (!campaignTitle || !campaignSubject) return;
    try {
      await createAndDispatchCampaign({
        title: campaignTitle,
        subject: campaignSubject,
        preheader: campaignPreheader,
        templateId: campaignTemplate,
        featuredProductIds: products.slice(0, 3).map(p => p.id)
      });
      setCampaignSuccess(`Campaign "${campaignTitle}" dispatched to ${activeSubscribersCount} subscribers!`);
      setCampaignTitle('');
      setCampaignSubject('');
      setCampaignPreheader('');
      setTimeout(() => setCampaignSuccess(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Add Order Note
  const handleAddNoteToOrder = (e) => {
    e.preventDefault();
    if (!newOrderNote || !selectedOrder) return;
    addOrderNote(selectedOrder.id, newOrderNote);
    setNewOrderNote('');
    // Refresh selected order
    const updated = orders.find(o => o.id === selectedOrder.id);
    setSelectedOrder(updated);
  };

  // Handle Order Status Update
  const handleStatusChange = (newStatus) => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, newStatus, `Status updated to ${newStatus}`);
    const updated = orders.find(o => o.id === selectedOrder.id);
    setSelectedOrder(updated);
  };

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-ivory pb-20 animate-fadeIn">
      
      {/* Top Admin Bar with Role Switcher & Live Simulation Control */}
      <div className="bg-luxury-darkCard border-b border-luxury-gold/30 px-4 sm:px-8 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-luxury-gold text-luxury-black font-bold flex items-center justify-center font-editorial">
              PC
            </div>
            <div>
              <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest block leading-none">
                PEACHTREE CORNERS LOAN &amp; PAWN
              </span>
              <span className="text-[11px] text-luxury-muted">
                Executive Management Platform &bull; /admin
              </span>
            </div>
          </div>

          {/* Role Switcher (Crucial for testing restricted permissions) */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2 bg-luxury-charcoal border border-luxury-borderSubtle px-3 py-1.5 rounded-sm">
              <ShieldCheck className="w-4 h-4 text-luxury-gold" />
              <span className="text-[11px] text-luxury-muted hidden sm:inline">Active Staff Role:</span>
              <select
                value={currentAdmin?.role || 'OWNER'}
                onChange={(e) => switchAdminRole(e.target.value)}
                className="bg-transparent text-xs font-bold text-luxury-goldLight focus:outline-none cursor-pointer"
                title="Switch administrative role to test permission boundaries"
              >
                <option value="OWNER" className="bg-luxury-charcoal">OWNER / SUPER ADMIN</option>
                <option value="INVENTORY_MANAGER" className="bg-luxury-charcoal">INVENTORY MANAGER</option>
                <option value="ORDER_MANAGER" className="bg-luxury-charcoal">ORDER MANAGER</option>
                <option value="MARKETING_MANAGER" className="bg-luxury-charcoal">MARKETING MANAGER</option>
              </select>
            </div>

            <button
              onClick={() => setIsIntakeModalOpen(true)}
              className="px-3.5 py-1.5 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-1.5 shadow-gold-glow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Smart Intake</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="bg-luxury-charcoal/80 border-b border-luxury-borderSubtle px-4 sm:px-8 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-1">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'inventory', label: `Inventory (${products.length})`, icon: Package },
            { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            { id: 'marketing', label: 'Vault Weekly & Campaigns', icon: Megaphone },
            { id: 'staff', label: 'Staff & Roles (RBAC)', icon: Users, ownerOnly: true },
            { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
            { id: 'notifications', label: 'Notification Center', icon: Bell }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-xs uppercase tracking-wider font-semibold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
                  isSelected
                    ? 'border-luxury-gold text-luxury-gold bg-luxury-gold/5 font-bold'
                    : 'border-transparent text-luxury-muted hover:text-luxury-ivory hover:bg-luxury-surface/30'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4">
          <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 rounded-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        </div>
      )}

      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW                                 */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-luxury-darkCard border border-luxury-borderSubtle p-5 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-luxury-muted text-xs">
                  <span className="uppercase tracking-wider font-semibold">Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-luxury-gold" />
                </div>
                <div className="font-editorial text-2xl sm:text-3xl font-bold text-luxury-gold">
                  ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Online &bull; In-Store POS Unified</span>
                </div>
              </div>

              <div className="bg-luxury-darkCard border border-luxury-borderSubtle p-5 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-luxury-muted text-xs">
                  <span className="uppercase tracking-wider font-semibold">Active Inventory</span>
                  <Package className="w-4 h-4 text-luxury-gold" />
                </div>
                <div className="font-editorial text-2xl sm:text-3xl font-bold text-luxury-ivory">
                  {activeProductsCount} <span className="text-xs font-sans text-luxury-muted">Units</span>
                </div>
                <div className="text-[10px] text-luxury-goldLight">
                  {newArrivalsCount} Just Came In this week
                </div>
              </div>

              <div className="bg-luxury-darkCard border border-luxury-borderSubtle p-5 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-luxury-muted text-xs">
                  <span className="uppercase tracking-wider font-semibold">Orders Queue</span>
                  <ShoppingBag className="w-4 h-4 text-luxury-gold" />
                </div>
                <div className="font-editorial text-2xl sm:text-3xl font-bold text-luxury-ivory">
                  {orders.length}
                </div>
                <div className="text-[10px] text-amber-300">
                  {pendingOrdersCount} Pending Fulfillment / Pickup
                </div>
              </div>

              <div className="bg-luxury-darkCard border border-luxury-borderSubtle p-5 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-luxury-muted text-xs">
                  <span className="uppercase tracking-wider font-semibold">Vault Subscribers</span>
                  <Users className="w-4 h-4 text-luxury-gold" />
                </div>
                <div className="font-editorial text-2xl sm:text-3xl font-bold text-luxury-goldLight">
                  {activeSubscribersCount}
                </div>
                <div className="text-[10px] text-luxury-muted">
                  The Vault Weekly Marketing List
                </div>
              </div>

            </div>

            {/* Quick Action Station */}
            <div className="bg-gradient-to-r from-luxury-darkCard via-luxury-charcoal to-luxury-darkCard border border-luxury-gold/40 rounded-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-luxury-card">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">
                  FAST STORE WORKFLOWS
                </span>
                <h3 className="font-editorial text-2xl font-bold text-luxury-ivory">
                  Smart Inventory Intake &bull; Two-Mode Product Entry
                </h3>
                <p className="text-xs text-luxury-muted max-w-lg">
                  Use Mode 2 (Quick Add AI) for photo-first automatic title, description, and condition extraction, or Mode 1 for traditional full control.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsIntakeModalOpen(true)}
                  className="px-6 py-3 rounded-sm bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-gold-glow flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Smart Intake</span>
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className="px-5 py-3 rounded-sm border border-luxury-gold text-luxury-gold hover:bg-luxury-gold/10 font-medium text-xs uppercase tracking-wider"
                >
                  Manage Products
                </button>
              </div>
            </div>

            {/* Two Column Grid: Recent Orders & Recent Audit Trail */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Recent Orders */}
              <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-luxury-borderSubtle pb-3">
                  <h4 className="font-editorial text-lg font-bold text-luxury-ivory">
                    Recent Customer Purchases
                  </h4>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-luxury-gold hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="divide-y divide-luxury-borderSubtle/60">
                  {orders.slice(0, 5).map(order => (
                    <div 
                      key={order.id} 
                      onClick={() => { setSelectedOrder(order); setActiveTab('orders'); }}
                      className="py-3 first:pt-0 flex items-center justify-between gap-3 hover:bg-luxury-charcoal/40 px-2 rounded cursor-pointer transition-colors"
                    >
                      <div>
                        <span className="font-mono text-xs font-bold text-luxury-gold block">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs text-luxury-ivory font-medium">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-luxury-muted block">
                          {order.items.length} item(s) &bull; {order.fulfillmentMethod === 'pickup' ? 'Counter Pickup' : 'Courier'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-editorial font-bold text-sm text-luxury-ivory block">
                          ${order.total.toFixed(2)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold bg-luxury-charcoal text-luxury-goldLight border border-luxury-borderSubtle">
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Audit Log */}
              <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-luxury-borderSubtle pb-3">
                  <h4 className="font-editorial text-lg font-bold text-luxury-ivory">
                    Recent Administrative Trail
                  </h4>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs text-luxury-gold hover:underline"
                  >
                    Full Audit Log &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="p-3 bg-luxury-charcoal/50 border border-luxury-borderSubtle rounded-sm text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-luxury-muted font-mono">
                        <span className="text-luxury-goldLight font-bold">{log.actorRole}: {log.actorEmail}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="font-medium text-luxury-ivory">
                        {log.action.replace(/_/g, ' ')}
                      </p>
                      {log.details && (
                        <p className="text-[11px] text-luxury-muted truncate">
                          {log.details.message || log.details.reason || log.details.title || JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: INVENTORY & SMART INTAKE                           */}
        {/* ========================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-luxury-borderSubtle pb-4">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-luxury-ivory">
                  Showroom Merchandise Catalog
                </h3>
                <p className="text-xs text-luxury-muted">
                  Manage active listings, upload photos, change prices, and record unified in-store counter purchases.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsIntakeModalOpen(true)}
                  className="px-4 py-2 bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider rounded-sm hover:brightness-110 flex items-center gap-1.5 shadow-gold-glow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Smart Intake (AI / Manual)</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-luxury-darkCard border border-luxury-borderSubtle p-4 rounded-sm flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-luxury-gold" />
                <input
                  type="text"
                  placeholder="Filter by title, brand, SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm pl-9 pr-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                >
                  <option value="all">All Departments</option>
                  <option value="jewelry">Jewelry &amp; Watches</option>
                  <option value="electronics">Electronics</option>
                  <option value="tools">Tools &amp; Equipment</option>
                  <option value="instruments">Musical Instruments</option>
                  <option value="collectibles">Collectibles</option>
                </select>

                <select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value)}
                  className="bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold Out</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>

            </div>

            {/* Products Table */}
            <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-luxury-charcoal/80 text-luxury-gold uppercase tracking-wider font-semibold border-b border-luxury-borderSubtle text-[11px]">
                  <tr>
                    <th className="p-3.5">Item</th>
                    <th className="p-3.5">Category &bull; SKU</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Qty</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Badges</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-borderSubtle/60 text-luxury-ivory">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-luxury-charcoal/30 transition-colors">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={product.primaryImage || product.image}
                          alt=""
                          className="w-12 h-12 rounded-sm object-cover border border-luxury-borderSubtle bg-luxury-charcoal shrink-0"
                        />
                        <div className="max-w-xs">
                          <span className="font-medium line-clamp-1 block">{product.title}</span>
                          <span className="text-[11px] text-luxury-muted">{product.brand || 'Verified Maker'}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-[11px]">
                        <span className="text-luxury-goldLight block">{product.category}</span>
                        <span className="text-luxury-muted">{product.sku}</span>
                      </td>

                      <td className="p-3.5 font-editorial font-bold text-sm text-luxury-gold">
                        ${product.price.toLocaleString()}
                      </td>

                      <td className="p-3.5 font-mono">
                        {product.quantity}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          product.status === 'available' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' :
                          product.status === 'sold' ? 'bg-red-950 text-red-300 border border-red-700/50' :
                          product.status === 'reserved' ? 'bg-amber-950 text-amber-300 border border-amber-700/50' :
                          'bg-luxury-charcoal text-luxury-muted'
                        }`}>
                          {product.status}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {product.isVaultDrop && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30">
                              Vault Drop
                            </span>
                          )}
                          {product.isNewArrival && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-luxury-surface text-luxury-ivory border border-white/10">
                              New
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        {/* Record In-Store POS Sale */}
                        {product.status === 'available' && (
                          <button
                            onClick={() => {
                              setInStoreSaleProduct(product);
                              setInStoreSalePrice(product.price);
                              setInStoreSaleQty(1);
                              setInStoreSaleModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-luxury-charcoal border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black font-semibold text-[10px] uppercase rounded-sm transition-all"
                            title="Record physical sale at store counter to deduct online stock"
                          >
                            In-Store Sale
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedProductEdit(product)}
                          className="px-2 py-1 text-luxury-muted hover:text-luxury-ivory hover:bg-luxury-charcoal rounded text-[11px]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ORDERS & FULFILLMENT                               */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            <div className="border-b border-luxury-borderSubtle pb-4">
              <h3 className="font-editorial text-2xl font-bold text-luxury-ivory">
                Order Management &amp; Fulfillment
              </h3>
              <p className="text-xs text-luxury-muted">
                Track counter pickups, manage courier shipping labels, view payment verification tokens, and issue authorized refunds.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="bg-luxury-darkCard border border-luxury-borderSubtle p-4 rounded-sm flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-luxury-gold" />
                <input
                  type="text"
                  placeholder="Search by order #, customer name, email..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm pl-9 pr-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3 py-2 text-luxury-ivory focus:border-luxury-gold outline-none w-full sm:w-auto"
              >
                <option value="all">All Fulfillment Statuses</option>
                <option value="ready_for_pickup">Ready for In-Store Pickup</option>
                <option value="processing">Processing / Packing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-luxury-charcoal/80 text-luxury-gold uppercase tracking-wider font-semibold border-b border-luxury-borderSubtle text-[11px]">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Fulfillment</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-borderSubtle/60 text-luxury-ivory">
                  {filteredOrders.map(order => (
                    <tr 
                      key={order.id} 
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-luxury-charcoal/30 transition-colors cursor-pointer"
                    >
                      <td className="p-3.5 font-mono font-bold text-luxury-gold">
                        #{order.orderNumber}
                      </td>

                      <td className="p-3.5 text-luxury-muted text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium block">{order.customerName}</span>
                        <span className="text-[10px] text-luxury-muted font-mono">{order.customerEmail}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="flex items-center gap-1.5 text-luxury-ivory text-[11px]">
                          {order.fulfillmentMethod === 'pickup' ? (
                            <>
                              <Store className="w-3.5 h-3.5 text-luxury-gold" />
                              <span>Store Pickup</span>
                            </>
                          ) : order.fulfillmentMethod === 'in_store_immediate' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Counter POS</span>
                            </>
                          ) : (
                            <>
                              <Truck className="w-3.5 h-3.5 text-luxury-gold" />
                              <span>Courier</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-3.5 text-luxury-muted">
                        {order.items.length} item(s)
                      </td>

                      <td className="p-3.5 font-editorial font-bold text-sm text-luxury-gold">
                        ${order.total.toFixed(2)}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-luxury-charcoal text-luxury-goldLight border border-luxury-borderSubtle">
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="px-3 py-1 bg-luxury-charcoal border border-luxury-borderSubtle text-luxury-gold hover:border-luxury-gold rounded text-xs"
                        >
                          Details &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MARKETING & THE VAULT WEEKLY                       */}
        {/* ========================================================= */}
        {activeTab === 'marketing' && (
          <div className="space-y-8">
            
            <div className="border-b border-luxury-borderSubtle pb-4">
              <h3 className="font-editorial text-2xl font-bold text-luxury-ivory">
                The Vault Weekly &bull; Marketing Automation
              </h3>
              <p className="text-xs text-luxury-muted">
                Create and dispatch Saturday Vault Drops, New Arrival campaigns, and manage unbundled SMS/Email subscriber consent lists.
              </p>
            </div>

            {/* Campaign Composer Card */}
            <div className="bg-luxury-darkCard border border-luxury-gold/30 rounded-sm p-6 sm:p-8 space-y-6">
              <h4 className="font-editorial text-xl font-bold text-luxury-ivory flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-luxury-gold" />
                <span>Create &amp; Dispatch New Campaign</span>
              </h4>

              <form onSubmit={handleDispatchCampaign} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Campaign Template
                    </label>
                    <select
                      value={campaignTemplate}
                      onChange={(e) => setCampaignTemplate(e.target.value)}
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                    >
                      <option value="vault_drop">1. Weekly Vault Drop (Saturday Release)</option>
                      <option value="new_arrivals">2. New Arrivals Showcase</option>
                      <option value="featured">3. Featured Estate Merchandise</option>
                      <option value="promo">4. Special Seasonal Promotion</option>
                      <option value="treasure_saturday">5. Treasure Hunt Saturday</option>
                      <option value="buying_event">6. Buying &amp; In-Store Appraisal Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Internal Campaign Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vault Drop Vol. 45"
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Customer Email Subject Line *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. THE VAULT: Just came in. Fresh estate gold & pro audio."
                      value={campaignSubject}
                      onChange={(e) => setCampaignSubject(e.target.value)}
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Preheader Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Discover what's new before somebody else does."
                      value={campaignPreheader}
                      onChange={(e) => setCampaignPreheader(e.target.value)}
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                    />
                  </div>
                </div>

                {campaignSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 rounded-sm">
                    {campaignSuccess}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider rounded-sm hover:brightness-110 shadow-gold-glow flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Dispatch to {activeSubscribersCount} Active Subscribers</span>
                  </button>
                </div>

              </form>
            </div>

            {/* Subscribers List */}
            <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-6 space-y-4">
              <h4 className="font-editorial text-lg font-bold text-luxury-ivory">
                Consent-Verified Subscribers ({subscribers.length})
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-luxury-charcoal/80 text-luxury-gold uppercase tracking-wider font-semibold border-b border-luxury-borderSubtle text-[11px]">
                    <tr>
                      <th className="p-3">Subscriber</th>
                      <th className="p-3">Email Consent</th>
                      <th className="p-3">SMS Consent</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Date Subscribed</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-borderSubtle/60 text-luxury-ivory">
                    {subscribers.map(sub => (
                      <tr key={sub.id}>
                        <td className="p-3">
                          <span className="font-medium block">{sub.email}</span>
                          {sub.firstName && <span className="text-[10px] text-luxury-muted">{sub.firstName}</span>}
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded ${sub.emailConsent ? 'text-emerald-300 bg-emerald-950' : 'text-red-300 bg-red-950'}`}>
                            {sub.emailConsent ? 'Granted' : 'Revoked'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded ${sub.smsConsent ? 'text-emerald-300 bg-emerald-950' : 'text-luxury-muted bg-luxury-charcoal'}`}>
                            {sub.smsConsent ? 'Explicit SMS Consent' : 'No SMS'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-luxury-muted">
                          {sub.source}
                        </td>
                        <td className="p-3 text-[11px] text-luxury-muted">
                          {new Date(sub.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <span className="text-emerald-400 font-bold uppercase text-[10px]">
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: STAFF & ROLES (OWNER ONLY)                         */}
        {/* ========================================================= */}
        {activeTab === 'staff' && (
          <div className="space-y-8">
            
            <div className="border-b border-luxury-borderSubtle pb-4">
              <h3 className="font-editorial text-2xl font-bold text-luxury-ivory">
                Administrative Personnel &amp; Roles
              </h3>
              <p className="text-xs text-luxury-muted">
                Role-based access control (RBAC). Only the OWNER / SUPER ADMIN may invite, assign roles, or suspend administrators.
              </p>
            </div>

            {/* Invite Form */}
            <div className="bg-luxury-darkCard border border-luxury-gold/30 rounded-sm p-6 sm:p-8 space-y-4 max-w-xl">
              <h4 className="font-editorial text-lg font-bold text-luxury-ivory flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-luxury-gold" />
                <span>Invite Administrative Personnel</span>
              </h4>

              <form onSubmit={handleInviteAdmin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                    Staff Member Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="staff@pawnshopnorcross.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                    Assigned Permission Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded-sm px-3.5 py-2 text-luxury-ivory focus:border-luxury-gold outline-none"
                  >
                    <option value="INVENTORY_MANAGER">INVENTORY MANAGER (Products, Intake, Pricing)</option>
                    <option value="ORDER_MANAGER">ORDER MANAGER (Orders, Fulfillment, Notes)</option>
                    <option value="MARKETING_MANAGER">MARKETING MANAGER (Vault Drops, Campaigns)</option>
                    <option value="OWNER">OWNER / SUPER ADMIN (Full Access)</option>
                  </select>
                </div>

                {inviteSuccessMsg && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 text-xs text-emerald-200 rounded-sm">
                    {inviteSuccessMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-luxury-gold text-luxury-black font-bold text-xs uppercase tracking-wider rounded-sm hover:brightness-110"
                >
                  Send Invitation
                </button>
              </form>
            </div>

            {/* Staff Table */}
            <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-luxury-charcoal/80 text-luxury-gold uppercase tracking-wider font-semibold border-b border-luxury-borderSubtle text-[11px]">
                  <tr>
                    <th className="p-3.5">Name &bull; Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Last Login</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-borderSubtle/60 text-luxury-ivory">
                  {admins.map(admin => (
                    <tr key={admin.id}>
                      <td className="p-3.5">
                        <span className="font-medium block">{admin.name}</span>
                        <span className="text-[11px] text-luxury-muted font-mono">{admin.email}</span>
                      </td>

                      <td className="p-3.5 font-mono text-luxury-goldLight font-semibold">
                        {admin.role}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          admin.status === 'active' ? 'text-emerald-300 bg-emerald-950' : 'text-red-300 bg-red-950'
                        }`}>
                          {admin.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-luxury-muted text-[11px]">
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        {admin.role !== 'OWNER' && (
                          admin.status === 'active' ? (
                            <button
                              onClick={() => updateAdminStatus(admin.id, 'suspended')}
                              className="px-2.5 py-1 text-red-400 hover:bg-red-950 border border-red-800 rounded text-[10px] uppercase font-semibold"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => updateAdminStatus(admin.id, 'active')}
                              className="px-2.5 py-1 text-emerald-400 hover:bg-emerald-950 border border-emerald-800 rounded text-[10px] uppercase font-semibold"
                            >
                              Reactivate
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: AUDIT TRAIL                                        */}
        {/* ========================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            
            <div className="border-b border-luxury-borderSubtle pb-4">
              <h3 className="font-editorial text-2xl font-bold text-luxury-ivory">
                Tamper-Evident Administrative Audit Log
              </h3>
              <p className="text-xs text-luxury-muted">
                Immutable records of privileged operations: price modifications, inventory additions, role changes, order fulfillment updates, and campaign dispatches.
              </p>
            </div>

            <div className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-luxury-charcoal/80 text-luxury-gold uppercase tracking-wider font-semibold border-b border-luxury-borderSubtle text-[11px]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Target</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-borderSubtle/60 text-luxury-ivory">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-luxury-charcoal/30">
                      <td className="p-3.5 text-luxury-muted text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>

                      <td className="p-3.5 text-luxury-ivory">
                        {log.actorEmail}
                      </td>

                      <td className="p-3.5 text-luxury-gold">
                        {log.actorRole}
                      </td>

                      <td className="p-3.5 font-bold text-emerald-400">
                        {log.action}
                      </td>

                      <td className="p-3.5 text-luxury-muted">
                        {log.entityType}: {log.entityId}
                      </td>

                      <td className="p-3.5 text-[11px] text-luxury-muted max-w-xs truncate">
                        {log.details ? JSON.stringify(log.details) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: NOTIFICATION CENTER                                */}
        {/* ========================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            
            <div className="border-b border-luxury-borderSubtle pb-4">
              <h3 className="font-editorial text-2xl font-bold text-luxury-ivory">
                Transactional &amp; Marketing Notification Center
              </h3>
              <p className="text-xs text-luxury-muted">
                Inspect real-time dispatches of luxury black-and-gold HTML transactional emails and carrier SMS messages.
              </p>
            </div>

            <div className="space-y-4">
              {notificationLogs.map(notif => (
                <div key={notif.id} className="bg-luxury-darkCard border border-luxury-borderSubtle rounded-sm p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-luxury-borderSubtle pb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                        notif.type === 'email' ? 'bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                      }`}>
                        {notif.type}
                      </span>
                      <strong className="text-luxury-ivory">{notif.subject}</strong>
                    </div>

                    <div className="flex items-center gap-3 text-luxury-muted font-mono text-[11px]">
                      <span>To: {notif.recipient}</span>
                      <span>&bull;</span>
                      <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </div>

                  <p className="text-xs text-luxury-muted font-sans leading-relaxed">
                    {notif.previewText}
                  </p>

                  {notif.bodyHtml && (
                    <details className="text-xs text-luxury-gold cursor-pointer pt-1">
                      <summary>Preview Rendered Black &amp; Gold HTML Email</summary>
                      <div className="mt-3 p-4 bg-black rounded border border-luxury-gold/20 overflow-x-auto max-h-80">
                        <div dangerouslySetInnerHTML={{ __html: notif.bodyHtml }} />
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* MODAL: SMART INVENTORY INTAKE                             */}
      {/* ========================================================= */}
      {isIntakeModalOpen && (
        <SmartInventoryIntakeModal
          isOpen={isIntakeModalOpen}
          onClose={() => setIsIntakeModalOpen(false)}
          onProductSaved={(newProd) => {
            setFeedbackMsg(`Successfully added merchandise: "${newProd.title}"`);
            setTimeout(() => setFeedbackMsg(''), 4000);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: IN-STORE COUNTER SALE RECORDER                     */}
      {/* ========================================================= */}
      {inStoreSaleModalOpen && inStoreSaleProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/90 backdrop-blur-sm">
          <div className="bg-luxury-darkCard border border-luxury-gold rounded-sm p-6 max-w-md w-full space-y-4 animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-between border-b border-luxury-borderSubtle pb-3">
              <div className="flex items-center gap-2 text-luxury-gold font-bold text-sm">
                <Store className="w-4 h-4" />
                <span>RECORD IN-STORE COUNTER SALE</span>
              </div>
              <button onClick={() => setInStoreSaleModalOpen(false)} className="text-luxury-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-luxury-charcoal rounded flex items-center gap-3">
                <img src={inStoreSaleProduct.primaryImage || inStoreSaleProduct.image} alt="" className="w-12 h-12 object-cover rounded" />
                <div>
                  <span className="font-bold text-luxury-ivory block line-clamp-1">{inStoreSaleProduct.title}</span>
                  <span className="text-[10px] text-luxury-muted font-mono">{inStoreSaleProduct.sku}</span>
                </div>
              </div>

              <form onSubmit={handleRecordInStoreSale} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                    Actual Counter Selling Price ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={inStoreSalePrice}
                    onChange={(e) => setInStoreSalePrice(e.target.value)}
                    className="w-full bg-luxury-charcoal border border-luxury-gold rounded px-3 py-2 text-luxury-gold font-mono font-bold text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Units Sold
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={inStoreSaleProduct.quantity}
                      value={inStoreSaleQty}
                      onChange={(e) => setInStoreSaleQty(e.target.value)}
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded px-3 py-2 text-luxury-ivory font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-luxury-muted mb-1 font-bold">
                      Payment Type
                    </label>
                    <select
                      value={inStoreSaleType}
                      onChange={(e) => setInStoreSaleType(e.target.value)}
                      className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded px-3 py-2 text-luxury-ivory outline-none"
                    >
                      <option value="cash">In-Store Cash</option>
                      <option value="pos_card">In-Store POS Terminal</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded bg-luxury-gold/10 border border-luxury-gold/30 text-[11px] text-luxury-goldLight">
                  Submitting immediately deducts available inventory from the website so customers cannot buy this item online.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInStoreSaleModalOpen(false)}
                    className="px-4 py-2 border border-luxury-borderSubtle text-luxury-muted text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-luxury-gold text-luxury-black font-bold text-xs uppercase hover:brightness-110"
                  >
                    Deduct Stock &bull; Complete Sale
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ORDER DETAILS DRAWER / MODAL                       */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/90 backdrop-blur-sm animate-fadeIn">
          <div className="bg-luxury-darkCard border border-luxury-gold rounded-sm p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-luxury-borderSubtle pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono text-luxury-gold tracking-widest block">
                  ORDER FULFILLMENT MANAGEMENT
                </span>
                <h3 className="font-editorial text-2xl font-bold text-luxury-ivory">
                  Order #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-luxury-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded bg-luxury-charcoal/60 border border-luxury-borderSubtle space-y-1">
                <span className="text-luxury-gold font-bold uppercase tracking-wider text-[10px] block">Customer</span>
                <p className="text-luxury-ivory font-medium">{selectedOrder.customerName}</p>
                <p className="text-luxury-muted">{selectedOrder.customerEmail}</p>
                <p className="text-luxury-muted">{selectedOrder.customerPhone || 'No phone recorded'}</p>
              </div>

              <div className="p-4 rounded bg-luxury-charcoal/60 border border-luxury-borderSubtle space-y-1">
                <span className="text-luxury-gold font-bold uppercase tracking-wider text-[10px] block">Fulfillment Details</span>
                <p className="text-luxury-ivory font-medium uppercase">{selectedOrder.fulfillmentMethod.replace('_', ' ')}</p>
                {selectedOrder.shippingAddress && (
                  <p className="text-luxury-muted">
                    {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}
                  </p>
                )}
                {selectedOrder.fulfillmentMethod === 'pickup' && (
                  <p className="text-luxury-goldLight">Ready for In-Store Counter Pickup</p>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <span className="text-luxury-gold font-bold uppercase tracking-wider text-[10px] block">
                Purchased Merchandise ({selectedOrder.items.length})
              </span>
              <div className="divide-y divide-luxury-borderSubtle/60 border-y border-luxury-borderSubtle/60 py-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-12 h-12 object-cover rounded bg-luxury-charcoal" />
                      <div>
                        <span className="font-medium text-luxury-ivory">{item.title}</span>
                        <span className="text-[10px] text-luxury-muted font-mono block">SKU: {item.sku} &bull; Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-editorial font-bold text-luxury-gold text-sm">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Change Controls */}
            <div className="p-4 rounded bg-luxury-charcoal/80 border border-luxury-gold/30 space-y-3 text-xs">
              <span className="text-luxury-gold font-bold uppercase tracking-wider text-[10px] block">
                Update Fulfillment Status
              </span>
              <div className="flex flex-wrap gap-2">
                {['paid', 'processing', 'ready_for_pickup', 'shipped', 'completed', 'cancelled'].map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-sm uppercase tracking-wider font-bold text-[10px] transition-all ${
                      selectedOrder.orderStatus === st
                        ? 'bg-luxury-gold text-luxury-black shadow-gold-glow'
                        : 'bg-luxury-darkCard text-luxury-muted hover:text-luxury-ivory border border-luxury-borderSubtle'
                    }`}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-3 text-xs">
              <span className="text-luxury-gold font-bold uppercase tracking-wider text-[10px] block">
                Staff Internal Order Notes
              </span>
              
              <form onSubmit={handleAddNoteToOrder} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add confidential store note..."
                  value={newOrderNote}
                  onChange={(e) => setNewOrderNote(e.target.value)}
                  className="flex-1 bg-luxury-charcoal border border-luxury-borderSubtle rounded px-3 py-2 text-luxury-ivory outline-none focus:border-luxury-gold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-luxury-gold text-luxury-black font-bold uppercase rounded text-[11px]"
                >
                  Post Note
                </button>
              </form>

              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedOrder.internalNotes?.map((note, nIdx) => (
                  <div key={nIdx} className="p-2.5 rounded bg-luxury-charcoal/50 border border-luxury-borderSubtle text-[11px]">
                    <div className="flex justify-between text-[10px] text-luxury-muted">
                      <span className="font-bold text-luxury-goldLight">{note.author}</span>
                      <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-luxury-ivory mt-0.5">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Close */}
            <div className="flex justify-end pt-2 border-t border-luxury-borderSubtle">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-luxury-charcoal text-luxury-ivory font-bold text-xs uppercase rounded"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PRODUCT EDIT MODAL                                 */}
      {/* ========================================================= */}
      {selectedProductEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/90 backdrop-blur-sm animate-fadeIn">
          <div className="bg-luxury-darkCard border border-luxury-gold rounded-sm p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-luxury-borderSubtle pb-3">
              <h4 className="font-editorial text-lg font-bold text-luxury-ivory">Edit Showroom Product</h4>
              <button onClick={() => setSelectedProductEdit(null)} className="text-luxury-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-luxury-muted uppercase mb-1 font-bold">Title</label>
                <input
                  type="text"
                  value={selectedProductEdit.title}
                  onChange={(e) => setSelectedProductEdit({ ...selectedProductEdit, title: e.target.value })}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded px-3 py-2 text-luxury-ivory outline-none focus:border-luxury-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-luxury-muted uppercase mb-1 font-bold">Selling Price ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={selectedProductEdit.price}
                    onChange={(e) => setSelectedProductEdit({ ...selectedProductEdit, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-luxury-charcoal border border-luxury-gold rounded px-3 py-2 text-luxury-gold font-bold font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-luxury-muted uppercase mb-1 font-bold">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={selectedProductEdit.quantity}
                    onChange={(e) => setSelectedProductEdit({ ...selectedProductEdit, quantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded px-3 py-2 text-luxury-ivory font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-luxury-muted uppercase mb-1 font-bold">Status</label>
                <select
                  value={selectedProductEdit.status}
                  onChange={(e) => setSelectedProductEdit({ ...selectedProductEdit, status: e.target.value })}
                  className="w-full bg-luxury-charcoal border border-luxury-borderSubtle rounded px-3 py-2 text-luxury-ivory outline-none"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold Out</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-luxury-borderSubtle">
                <button
                  onClick={() => setSelectedProductEdit(null)}
                  className="px-4 py-2 border border-luxury-borderSubtle text-luxury-muted text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateProduct(selectedProductEdit.id, selectedProductEdit);
                    setSelectedProductEdit(null);
                    setFeedbackMsg("Product details updated.");
                    setTimeout(() => setFeedbackMsg(''), 3000);
                  }}
                  className="px-5 py-2 bg-luxury-gold text-luxury-black font-bold text-xs uppercase hover:brightness-110"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
