-- Migration 017: Menu administrable + permissions par rôle
-- Permet au patron de réorganiser le menu et gérer les accès modules

-- Table: ordre du menu (une seule config globale)
CREATE TABLE admin_menu_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Table: permissions module par rôle (surcharges)
CREATE TABLE role_module_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('patron', 'admin', 'commercial', 'production', 'infographiste')),
  module_key TEXT NOT NULL,
  can_access BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(role, module_key)
);

-- Insérer la config menu par défaut (ordre du parcours client)
INSERT INTO admin_menu_config (module_key, label, sort_order, is_system) VALUES
  ('dashboard',    'Vue d''ensemble',  1,  true),
  ('prospects',    'Prospects',        2,  false),
  ('whatsapp',     'WhatsApp',         3,  false),
  ('clients',      'Clients',          4,  false),
  ('devis',        'Devis',            5,  false),
  ('commandes',    'Commandes',        6,  false),
  ('planning',     'Planning',         7,  false),
  ('taches',       'Tâches',           8,  false),
  ('impayes',      'Impayés',          9,  false),
  ('factures',     'Factures',         10, false),
  ('rapports',     'Rapports',         11, false),
  ('produits',     'Produits',         12, false),
  ('categories',   'Catégories',       13, false),
  ('realisations', 'Réalisations',     14, false),
  ('imports',      'Imports CSV',      15, false),
  ('parametres',   'Paramètres',       16, true),
  ('utilisateurs', 'Utilisateurs',     17, true),
  ('maintenance',  'Maintenance',      18, true),
  ('aide',         'Aide',             19, false);

-- RLS
ALTER TABLE admin_menu_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_module_access ENABLE ROW LEVEL SECURITY;

-- Lecture: tous les admins actifs
CREATE POLICY "admin_menu_config_select" ON admin_menu_config
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Modification: patron uniquement
CREATE POLICY "admin_menu_config_update" ON admin_menu_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid() AND role = 'patron' AND is_active = true
    )
  );

CREATE POLICY "admin_menu_config_insert" ON admin_menu_config
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid() AND role = 'patron' AND is_active = true
    )
  );

-- role_module_access: lecture pour tous les admins
CREATE POLICY "role_module_access_select" ON role_module_access
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- role_module_access: modification patron uniquement
CREATE POLICY "role_module_access_update" ON role_module_access
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid() AND role = 'patron' AND is_active = true
    )
  );

CREATE POLICY "role_module_access_insert" ON role_module_access
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid() AND role = 'patron' AND is_active = true
    )
  );

CREATE POLICY "role_module_access_delete" ON role_module_access
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid() AND role = 'patron' AND is_active = true
    )
  );

-- Index pour performance
CREATE INDEX idx_admin_menu_config_sort ON admin_menu_config(sort_order);
CREATE INDEX idx_role_module_access_role ON role_module_access(role);
