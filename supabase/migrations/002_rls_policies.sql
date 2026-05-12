-- ═══════════════════════════════════════════════════════════════
-- GLOBAL TIC PrintTech — Politiques de sécurité par ligne (RLS)
-- Migration 002
-- ═══════════════════════════════════════════════════════════════

-- Activer RLS sur toutes les tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_quantity_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE realisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────
-- Fonctions helpers
-- ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_admin_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM admin_profiles
    WHERE user_id = auth.uid() AND is_active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_patron_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_admin_role() IN ('patron', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ───────────────────────────────────────────────────────────────
-- CATALOGUE — Lecture publique, écriture admin
-- ───────────────────────────────────────────────────────────────

-- Categories
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "categories_admin_all" ON categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Products
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Product formats
CREATE POLICY "product_formats_public_read" ON product_formats
  FOR SELECT USING (is_active = true);

CREATE POLICY "product_formats_admin_all" ON product_formats
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Product papers
CREATE POLICY "product_papers_public_read" ON product_papers
  FOR SELECT USING (is_active = true);

CREATE POLICY "product_papers_admin_all" ON product_papers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Product finishes
CREATE POLICY "product_finishes_public_read" ON product_finishes
  FOR SELECT USING (is_active = true);

CREATE POLICY "product_finishes_admin_all" ON product_finishes
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Product quantity tiers
CREATE POLICY "product_tiers_public_read" ON product_quantity_tiers
  FOR SELECT USING (true);

CREATE POLICY "product_tiers_admin_all" ON product_quantity_tiers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Realisations
CREATE POLICY "realisations_public_read" ON realisations
  FOR SELECT USING (true);

CREATE POLICY "realisations_admin_all" ON realisations
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ───────────────────────────────────────────────────────────────
-- BUSINESS — Admin seulement
-- ───────────────────────────────────────────────────────────────

-- Customers
CREATE POLICY "customers_admin_all" ON customers
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Quotes
CREATE POLICY "quotes_admin_all" ON quotes
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Quote items
CREATE POLICY "quote_items_admin_all" ON quote_items
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Orders
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Order files
CREATE POLICY "order_files_admin_all" ON order_files
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Payments
CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ───────────────────────────────────────────────────────────────
-- ADMINISTRATION
-- ───────────────────────────────────────────────────────────────

-- Admin profiles : seul patron/admin peut voir tous les profils
CREATE POLICY "admin_profiles_self_read" ON admin_profiles
  FOR SELECT USING (user_id = auth.uid() OR is_patron_or_admin());

CREATE POLICY "admin_profiles_patron_manage" ON admin_profiles
  FOR ALL USING (is_patron_or_admin()) WITH CHECK (is_patron_or_admin());

-- Activity log : lecture admin, insertion auto
CREATE POLICY "activity_log_admin_read" ON activity_log
  FOR SELECT USING (is_admin());

CREATE POLICY "activity_log_admin_insert" ON activity_log
  FOR INSERT WITH CHECK (is_admin());

-- Business config : lecture admin, écriture patron seulement
CREATE POLICY "business_config_admin_read" ON business_config
  FOR SELECT USING (is_admin());

CREATE POLICY "business_config_patron_write" ON business_config
  FOR ALL USING (get_admin_role() = 'patron') WITH CHECK (get_admin_role() = 'patron');

-- Notifications
CREATE POLICY "notifications_admin_all" ON notifications
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
