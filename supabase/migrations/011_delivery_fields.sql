-- Migration 011 : Champs livraison avancés

-- Extension du mode de livraison (supprimer l'ancienne contrainte, recréer étendue)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_delivery_method_check
  CHECK (delivery_method IN (
    'retrait', 'livraison_dakar', 'livraison_region',
    'livraison_coursier', 'autre'
  ));

-- Statut interne de livraison (indépendant du statut commande)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'non_planifiee'
    CHECK (delivery_status IN (
      'non_planifiee', 'planifiee', 'en_cours', 'livree', 'echec', 'reportee'
    ));

-- Informations destinataire et livreur
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_recipient_name TEXT,
  ADD COLUMN IF NOT EXISTS delivery_recipient_phone TEXT,
  ADD COLUMN IF NOT EXISTS delivery_driver TEXT,
  ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
