-- ═══════════════════════════════════════════════════════════════
-- GLOBAL TIC PrintTech — Schema Initial
-- Migration 001 — Fondations complètes
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- CATALOGUE
-- ───────────────────────────────────────────────────────────────

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  icon_name TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  image_urls JSONB DEFAULT '[]'::jsonb,
  base_turnaround_days INT DEFAULT 3,
  min_order_quantity INT DEFAULT 1,
  unit_type TEXT NOT NULL DEFAULT 'piece' CHECK (unit_type IN ('piece', 'm2', 'lot')),
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE product_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  width_mm NUMERIC,
  height_mm NUMERIC,
  price_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE product_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight_gsm INT,
  paper_type TEXT NOT NULL DEFAULT 'couche' CHECK (paper_type IN ('couche', 'offset', 'recycle', 'texture', 'special')),
  price_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE product_finishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  unit_price INT NOT NULL DEFAULT 0,
  fixed_price INT NOT NULL DEFAULT 0,
  extra_days INT NOT NULL DEFAULT 0,
  incompatible_with UUID[] DEFAULT '{}',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE product_quantity_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_qty INT NOT NULL,
  max_qty INT,
  base_unit_price INT NOT NULL,
  label TEXT
);

-- ───────────────────────────────────────────────────────────────
-- CLIENTS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name TEXT,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT NOT NULL,
  address TEXT,
  city TEXT DEFAULT 'Dakar',
  customer_type TEXT NOT NULL DEFAULT 'particulier' CHECK (customer_type IN ('particulier', 'entreprise', 'revendeur')),
  source TEXT NOT NULL DEFAULT 'site' CHECK (source IN ('site', 'whatsapp', 'terrain', 'parrainage', 'autre')),
  total_orders INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  loyalty_tier TEXT NOT NULL DEFAULT 'nouveau' CHECK (loyalty_tier IN ('nouveau', 'regulier', 'vip', 'premium')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- DEVIS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')),
  subtotal INT NOT NULL DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  discount_amount INT DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  is_urgent BOOLEAN DEFAULT false,
  urgent_surcharge_percent NUMERIC DEFAULT 30,
  valid_until DATE,
  notes TEXT,
  internal_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price INT NOT NULL,
  total_price INT NOT NULL,
  config_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT
);

-- ───────────────────────────────────────────────────────────────
-- COMMANDES
-- ───────────────────────────────────────────────────────────────

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN (
    'en_attente', 'confirmee', 'bat_en_cours', 'bat_valide',
    'en_production', 'controle_qualite', 'pret', 'en_livraison', 'livre', 'annulee'
  )),
  total INT NOT NULL,
  paid_amount INT DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'non_paye' CHECK (payment_status IN ('non_paye', 'acompte', 'paye', 'rembourse')),
  delivery_method TEXT NOT NULL DEFAULT 'retrait' CHECK (delivery_method IN ('retrait', 'livraison_dakar', 'livraison_region')),
  delivery_address TEXT,
  delivery_fee INT DEFAULT 0,
  estimated_delivery DATE,
  actual_delivery DATE,
  notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('bat_client', 'bat_valide', 'maquette', 'bon_livraison', 'facture')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'valide', 'refuse')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- PAIEMENTS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('wave', 'orange_money', 'especes', 'virement', 'cheque')),
  amount INT NOT NULL,
  provider_reference TEXT,
  status TEXT NOT NULL DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'confirme', 'echoue', 'rembourse')),
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- PORTFOLIO
-- ───────────────────────────────────────────────────────────────

CREATE TABLE realisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  client_name TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- ADMINISTRATION
-- ───────────────────────────────────────────────────────────────

CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'commercial' CHECK (role IN ('patron', 'admin', 'commercial', 'production', 'infographiste')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- CONFIGURATION BUSINESS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE business_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ───────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('admin', 'customer')),
  recipient_id UUID NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'in_app')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- INDEX
-- ───────────────────────────────────────────────────────────────

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_quotes_reference ON quotes(reference);
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_orders_reference ON orders(reference);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_customers_whatsapp ON customers(whatsapp);
CREATE INDEX idx_activity_log_user ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- ───────────────────────────────────────────────────────────────
-- TRIGGERS : updated_at automatique
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ───────────────────────────────────────────────────────────────
-- DONNÉES INITIALES : Configuration business
-- ───────────────────────────────────────────────────────────────

INSERT INTO business_config (key, value, description) VALUES
  ('whatsapp_number', '"221776190419"', 'Numéro WhatsApp principal'),
  ('company_name', '"GLOBAL TIC"', 'Nom de l''entreprise'),
  ('urgent_surcharge_percent', '30', 'Surcharge pour commandes urgentes (%)'),
  ('default_quote_validity_days', '7', 'Durée de validité d''un devis (jours)'),
  ('delivery_zones', '[{"name": "Dakar Plateau", "fee": 2000}, {"name": "Dakar Banlieue", "fee": 3500}, {"name": "Thiès", "fee": 7000}, {"name": "Saint-Louis", "fee": 12000}]', 'Zones et frais de livraison'),
  ('loyalty_thresholds', '{"regulier": 3, "vip": 10, "premium": 25}', 'Seuils de commandes pour les paliers fidélité'),
  ('working_hours', '{"start": "08:30", "end": "18:00", "days": [1,2,3,4,5,6]}', 'Horaires de travail'),
  ('min_textile_qty_surcharge', '{"threshold": 10, "percent": 20}', 'Surcharge textile < seuil minimum');
