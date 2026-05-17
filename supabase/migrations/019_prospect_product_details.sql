-- Ajout du champ product_details (JSONB) à la table prospects
-- Stocke les détails structurés par produit : quantité, format, finition, couleurs, texte, etc.
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS product_details JSONB DEFAULT '[]'::jsonb;
