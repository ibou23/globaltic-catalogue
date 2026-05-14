-- Table des factures (traçabilité, référence stable FAC-YYYY-XXXX)
CREATE TABLE IF NOT EXISTS invoices (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference    TEXT        UNIQUE NOT NULL,
  order_id     UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id  UUID        REFERENCES customers(id) ON DELETE SET NULL,
  status       TEXT        NOT NULL DEFAULT 'emise'
               CHECK (status IN ('brouillon','emise','payee','partiellement_payee','annulee')),
  total        INT         NOT NULL DEFAULT 0,
  paid_amount  INT         NOT NULL DEFAULT 0,
  issued_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  generated_by UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Une seule facture par commande
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_order_id  ON invoices(order_id);
CREATE INDEX        IF NOT EXISTS idx_invoices_reference ON invoices(reference);
CREATE INDEX        IF NOT EXISTS idx_invoices_status    ON invoices(status);
CREATE INDEX        IF NOT EXISTS idx_invoices_customer  ON invoices(customer_id);
CREATE INDEX        IF NOT EXISTS idx_invoices_issued_at ON invoices(issued_at DESC);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_admin_read"
  ON invoices FOR SELECT
  USING (is_admin());

CREATE POLICY "invoices_admin_write"
  ON invoices FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
