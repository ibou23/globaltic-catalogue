-- ═══════════════════════════════════════════════════════════════
-- GLOBAL TIC PrintTech — Tâches & Relances commerciales
-- Migration 008
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE tasks (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  description   TEXT,
  task_type     TEXT        NOT NULL DEFAULT 'autre' CHECK (task_type IN (
    'relancer_devis', 'relancer_paiement', 'envoyer_bat',
    'verifier_production', 'confirmer_livraison', 'appeler_client', 'autre'
  )),
  priority      TEXT        NOT NULL DEFAULT 'normale' CHECK (priority IN ('basse', 'normale', 'haute', 'urgente')),
  status        TEXT        NOT NULL DEFAULT 'a_faire'  CHECK (status IN ('a_faire', 'en_cours', 'terminee', 'annulee')),
  due_date      DATE,
  closed_at     TIMESTAMPTZ,

  -- Liens optionnels
  customer_id   UUID        REFERENCES customers(id) ON DELETE SET NULL,
  quote_id      UUID        REFERENCES quotes(id)    ON DELETE SET NULL,
  order_id      UUID        REFERENCES orders(id)    ON DELETE SET NULL,

  -- Personnes
  created_by    UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Index utiles
CREATE INDEX idx_tasks_status      ON tasks(status);
CREATE INDEX idx_tasks_due_date    ON tasks(due_date);
CREATE INDEX idx_tasks_customer    ON tasks(customer_id);
CREATE INDEX idx_tasks_assigned    ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by  ON tasks(created_by);

-- Trigger updated_at
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Tous les admins actifs lisent les tâches (filtrage rôle côté applicatif)
CREATE POLICY "tasks_admin_read" ON tasks
  FOR SELECT USING (is_admin());

-- Seuls les admins actifs peuvent créer / modifier / supprimer
CREATE POLICY "tasks_admin_write" ON tasks
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
