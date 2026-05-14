-- Phase 2.42 : Clôture commande + satisfaction client
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS closure_status TEXT NOT NULL DEFAULT 'non_cloturee'
    CHECK (closure_status IN ('non_cloturee', 'cloturee', 'satisfait', 'reclamation')),
  ADD COLUMN IF NOT EXISTS satisfaction TEXT
    CHECK (satisfaction IS NULL OR satisfaction IN ('satisfait', 'neutre', 'insatisfait')),
  ADD COLUMN IF NOT EXISTS customer_comment TEXT,
  ADD COLUMN IF NOT EXISTS complaint TEXT,
  ADD COLUMN IF NOT EXISTS corrective_action TEXT,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_closure_status ON orders(closure_status);
CREATE INDEX IF NOT EXISTS idx_orders_satisfaction ON orders(satisfaction);
