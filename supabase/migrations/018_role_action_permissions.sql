-- Migration 018: Permissions fines par action
-- Permet au patron de surcharger les actions autorisées par rôle

CREATE TABLE role_action_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('patron', 'admin', 'commercial', 'production', 'infographiste')),
  action_key TEXT NOT NULL,
  can_perform BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(role, action_key)
);

-- RLS
ALTER TABLE role_action_permissions ENABLE ROW LEVEL SECURITY;

-- Lecture: tous les admins actifs
CREATE POLICY "role_action_permissions_select" ON role_action_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Modification: patron uniquement
CREATE POLICY "role_action_permissions_update" ON role_action_permissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid() AND role = 'patron' AND is_active = true
    )
  );

CREATE POLICY "role_action_permissions_insert" ON role_action_permissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid() AND role = 'patron' AND is_active = true
    )
  );

CREATE POLICY "role_action_permissions_delete" ON role_action_permissions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE user_id = auth.uid() AND role = 'patron' AND is_active = true
    )
  );

-- Index
CREATE INDEX idx_role_action_permissions_role ON role_action_permissions(role);
CREATE INDEX idx_role_action_permissions_action ON role_action_permissions(action_key);
