-- Remise globale sur les devis
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS global_discount_type  VARCHAR CHECK (global_discount_type IN ('percentage', 'fixed')),
  ADD COLUMN IF NOT EXISTS global_discount_value NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS global_discount_amount NUMERIC NOT NULL DEFAULT 0;

-- Remise par ligne (persistance du % pour affichage dans les PDF)
ALTER TABLE quote_items
  ADD COLUMN IF NOT EXISTS discount_percent NUMERIC NOT NULL DEFAULT 0;

-- Remise globale sur les factures (copie depuis le devis)
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS global_discount_type  VARCHAR CHECK (global_discount_type IN ('percentage', 'fixed')),
  ADD COLUMN IF NOT EXISTS global_discount_value NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS global_discount_amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subtotal INT NOT NULL DEFAULT 0;
