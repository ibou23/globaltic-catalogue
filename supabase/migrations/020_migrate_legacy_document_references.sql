-- Migration : convertir les anciennes références PREFIX-YYYY-NNNN vers PREFIX-YYYY-MMDD-N
-- Basé sur la date de création de chaque document.
-- Idempotent : ne touche pas les documents déjà au nouveau format.

-- ═══════════════════════════════════════════════════════════════════════════════
-- ÉTAPE 1 : Ajouter la colonne legacy_reference pour conserver l'ancienne ref
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS legacy_reference TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS legacy_reference TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS legacy_reference TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS legacy_reference TEXT;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ÉTAPE 2 : Sauvegarder les anciennes références (seulement si pas déjà fait)
-- ═══════════════════════════════════════════════════════════════════════════════

UPDATE quotes
SET legacy_reference = reference
WHERE reference ~ '^DEV-\d{4}-\d{4}$'
  AND legacy_reference IS NULL;

UPDATE orders
SET legacy_reference = reference
WHERE reference ~ '^CMD-\d{4}-\d{4}$'
  AND legacy_reference IS NULL;

UPDATE invoices
SET legacy_reference = reference
WHERE reference ~ '^FAC-\d{4}-\d{4}$'
  AND legacy_reference IS NULL;

UPDATE prospects
SET legacy_reference = reference
WHERE reference ~ '^PRO-\d{4}-\d{4}$'
  AND legacy_reference IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ÉTAPE 3 : Migrer les références — CTE avec row_number par jour
-- ═══════════════════════════════════════════════════════════════════════════════

-- Devis (quotes)
WITH numbered AS (
  SELECT
    id,
    'DEV-' || EXTRACT(YEAR FROM created_at)::int || '-'
      || LPAD(EXTRACT(MONTH FROM created_at)::int::text, 2, '0')
      || LPAD(EXTRACT(DAY FROM created_at)::int::text, 2, '0')
      || '-' || ROW_NUMBER() OVER (
        PARTITION BY created_at::date
        ORDER BY created_at, id
      )::text AS new_ref
  FROM quotes
  WHERE reference ~ '^DEV-\d{4}-\d{4}$'
)
UPDATE quotes q
SET reference = n.new_ref
FROM numbered n
WHERE q.id = n.id;

-- Commandes (orders)
WITH numbered AS (
  SELECT
    id,
    'CMD-' || EXTRACT(YEAR FROM created_at)::int || '-'
      || LPAD(EXTRACT(MONTH FROM created_at)::int::text, 2, '0')
      || LPAD(EXTRACT(DAY FROM created_at)::int::text, 2, '0')
      || '-' || ROW_NUMBER() OVER (
        PARTITION BY created_at::date
        ORDER BY created_at, id
      )::text AS new_ref
  FROM orders
  WHERE reference ~ '^CMD-\d{4}-\d{4}$'
)
UPDATE orders o
SET reference = n.new_ref
FROM numbered n
WHERE o.id = n.id;

-- Factures (invoices)
WITH numbered AS (
  SELECT
    id,
    'FAC-' || EXTRACT(YEAR FROM created_at)::int || '-'
      || LPAD(EXTRACT(MONTH FROM created_at)::int::text, 2, '0')
      || LPAD(EXTRACT(DAY FROM created_at)::int::text, 2, '0')
      || '-' || ROW_NUMBER() OVER (
        PARTITION BY created_at::date
        ORDER BY created_at, id
      )::text AS new_ref
  FROM invoices
  WHERE reference ~ '^FAC-\d{4}-\d{4}$'
)
UPDATE invoices i
SET reference = n.new_ref
FROM numbered n
WHERE i.id = n.id;

-- Prospects
WITH numbered AS (
  SELECT
    id,
    'PRO-' || EXTRACT(YEAR FROM created_at)::int || '-'
      || LPAD(EXTRACT(MONTH FROM created_at)::int::text, 2, '0')
      || LPAD(EXTRACT(DAY FROM created_at)::int::text, 2, '0')
      || '-' || ROW_NUMBER() OVER (
        PARTITION BY created_at::date
        ORDER BY created_at, id
      )::text AS new_ref
  FROM prospects
  WHERE reference ~ '^PRO-\d{4}-\d{4}$'
)
UPDATE prospects p
SET reference = n.new_ref
FROM numbered n
WHERE p.id = n.id;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ÉTAPE 4 : Index sur legacy_reference pour la recherche
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_quotes_legacy_reference ON quotes (legacy_reference) WHERE legacy_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_legacy_reference ON orders (legacy_reference) WHERE legacy_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_legacy_reference ON invoices (legacy_reference) WHERE legacy_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prospects_legacy_reference ON prospects (legacy_reference) WHERE legacy_reference IS NOT NULL;
