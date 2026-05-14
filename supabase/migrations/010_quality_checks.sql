-- Migration 010 : Table de contrôle qualité (une entrée par commande)

CREATE TABLE IF NOT EXISTS quality_checks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'non_verifie'
                CHECK (status IN ('non_verifie', 'en_cours', 'valide', 'a_corriger')),
  checklist     JSONB NOT NULL DEFAULT '{}',
  notes         TEXT,
  validated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Une seule entrée de contrôle par commande
CREATE UNIQUE INDEX IF NOT EXISTS idx_quality_checks_order_id ON quality_checks(order_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_quality_checks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quality_checks_updated_at
  BEFORE UPDATE ON quality_checks
  FOR EACH ROW EXECUTE FUNCTION update_quality_checks_updated_at();

-- RLS
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qc_admin_read"
  ON quality_checks FOR SELECT
  USING (is_admin());

CREATE POLICY "qc_admin_write"
  ON quality_checks FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
