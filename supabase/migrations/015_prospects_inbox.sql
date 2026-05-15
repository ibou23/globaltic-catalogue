-- ═══════════════════════════════════════════════════════════════
-- Migration 015 — Prospects Inbox / Qualification commerciale
-- Ajout prospect_id sur tasks + colonnes scoring prospects
-- ═══════════════════════════════════════════════════════════════

-- Lien tâches → prospects
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_prospect ON tasks(prospect_id);

-- Scoring / qualification prospect
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'a_qualifier' CHECK (priority IN ('urgent', 'chaud', 'a_qualifier', 'froid', 'perdu'));
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS converted_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_prospects_priority ON prospects(priority);
CREATE INDEX IF NOT EXISTS idx_prospects_contacted_at ON prospects(contacted_at);
