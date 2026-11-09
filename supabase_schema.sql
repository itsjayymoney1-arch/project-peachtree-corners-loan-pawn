-- ====================================================================
-- PEACHTREE CORNERS LOAN & PAWN — THE VAULT
-- PostgreSQL / Supabase Production Database Schema & Security Policies
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS & TYPES
CREATE TYPE user_role AS ENUM (
  'CUSTOMER',
  'OWNER',
  'INVENTORY_MANAGER',
  'ORDER_MANAGER',
  'MARKETING_MANAGER'
);

CREATE TYPE inventory_status AS ENUM (
  'draft',
  'ai_pending',
  'needs_review',
  'ready_to_publish',
  'available',
  'reserved',
  'sold',
  'archived'
);

CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'paid',
  'processing',
  'ready_for_pickup',
  'shipped',
  'completed',
  'cancelled',
  'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded'
);

CREATE TYPE fulfillment_method AS ENUM (
  'pickup',
  'shipping',
  'in_store_immediate'
);

CREATE TYPE notification_type AS ENUM (
  'email',
  'sms'
);

-- 2. ROLES & PERMISSIONS
CREATE TABLE roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, name, description) VALUES
  ('OWNER', 'Owner / Super Admin', 'Full system access across inventory, orders, staff, audit, and settings'),
  ('INVENTORY_MANAGER', 'Inventory Manager', 'Catalog products, upload photos, smart intake, manage prices, and in-store sales'),
  ('ORDER_MANAGER', 'Order Manager', 'View orders, update fulfillment, pickup notifications, internal notes, and refunds'),
  ('MARKETING_MANAGER', 'Marketing Manager', 'Manage promotions, The Vault Weekly drops, and subscriber lists'),
  ('CUSTOMER', 'Customer', 'Browse showroom, place orders, view personal order history, and preferences');

-- 3. USERS & PROFILES
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT, -- Handled by Supabase Auth (auth.users)
  role user_role DEFAULT 'CUSTOMER',
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'invited'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE customer_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  invited_by UUID REFERENCES users(id),
  mfa_enabled BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES
CREATE TABLE categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  tagline VARCHAR(200),
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS & INVENTORY
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id VARCHAR(50) REFERENCES categories(id),
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  condition VARCHAR(100) NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  estimated_value VARCHAR(50),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  primary_image TEXT NOT NULL,
  status inventory_status DEFAULT 'available',
  featured BOOLEAN DEFAULT FALSE,
  is_new_arrival BOOLEAN DEFAULT TRUE,
  is_vault_drop BOOLEAN DEFAULT FALSE,
  specs JSONB DEFAULT '{}'::JSONB,
  tags TEXT[] DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_confidence JSONB,
  created_by UUID REFERENCES users(id),
  modified_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INVENTORY MOVEMENTS & AUDIT
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  movement_type VARCHAR(50) NOT NULL, -- 'intake', 'online_sale', 'instore_sale', 'reservation', 'adjustment'
  quantity_change INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  actor_id UUID REFERENCES users(id),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  cart_id VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'active' -- 'active', 'completed', 'expired', 'released'
);

-- 7. ORDERS & CHECKOUT
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(30) UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id),
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30),
  fulfillment_method fulfillment_method NOT NULL,
  shipping_address JSONB,
  pickup_store_info JSONB,
  subtotal NUMERIC(12, 2) NOT NULL,
  tax NUMERIC(12, 2) NOT NULL,
  shipping_cost NUMERIC(12, 2) DEFAULT 0.00,
  total NUMERIC(12, 2) NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  order_status order_status DEFAULT 'processing',
  payment_method VARCHAR(50) NOT NULL,
  payment_transaction_id VARCHAR(100),
  payment_provider VARCHAR(50),
  tracking_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  sku VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  image_url TEXT
);

CREATE TABLE order_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  author_name VARCHAR(100) NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MARKETING, CONSENT & THE VAULT WEEKLY
CREATE TABLE marketing_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  phone VARCHAR(30),
  email_consent BOOLEAN DEFAULT FALSE,
  sms_consent BOOLEAN DEFAULT FALSE,
  source VARCHAR(50) DEFAULT 'website',
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'unsubscribed'
  unsubscribe_token VARCHAR(100) UNIQUE DEFAULT uuid_generate_v4()::TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  preheader TEXT,
  template_id VARCHAR(50) NOT NULL,
  featured_product_ids UUID[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sent'
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients_count INT DEFAULT 0,
  opened_count INT DEFAULT 0,
  clicked_count INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE review_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  channel VARCHAR(20) DEFAULT 'email',
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'scheduled',
  review_url TEXT NOT NULL
);

-- 9. NOTIFICATION & AUDIT LOGS
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type notification_type NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  preview_text TEXT,
  body_html TEXT,
  status VARCHAR(30) DEFAULT 'delivered',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  actor_email VARCHAR(255) NOT NULL,
  actor_role user_role NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_reservations_product ON inventory_reservations(product_id);
CREATE INDEX idx_reservations_expires ON inventory_reservations(expires_at);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Products RLS: Anyone can view available or reserved products; Only Staff can view drafts or edit
CREATE POLICY "Public can view available products" ON products
  FOR SELECT USING (status IN ('available', 'reserved', 'sold'));

CREATE POLICY "Staff can manage products" ON products
  FOR ALL USING (auth.jwt() ->> 'role' IN ('OWNER', 'INVENTORY_MANAGER'));

-- Orders RLS: Customers can only view THEIR OWN orders
CREATE POLICY "Customers view own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Staff can view and update orders" ON orders
  FOR ALL USING (auth.jwt() ->> 'role' IN ('OWNER', 'ORDER_MANAGER'));

-- Customer Profile RLS: Customers manage only their profile
CREATE POLICY "Customers view and update own profile" ON customer_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Audit Logs RLS: Only Super Admin / Owner can inspect audit logs
CREATE POLICY "Owners can view audit logs" ON audit_logs
  FOR SELECT USING (auth.jwt() ->> 'role' = 'OWNER');
