-- ============================================================
-- GLOBAL TIC PrintTech — Données initiales (Seed)
-- Idempotent : utilise ON CONFLICT DO NOTHING sur les contraintes uniques
-- À exécuter après les migrations 001 et 002
-- ============================================================

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (id, slug, name, description, image_url, icon_name, display_order, is_active) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'numerique-et-grand-format', 'Numérique et Grand Format', 'De l''impression petit format express aux bâches et vinyles XXL pour votre communication.', '/images/products/a787db0a98148bfb7bac3868a8a11629.jpg', 'printer', 1, true),
  ('a0000000-0000-4000-8000-000000000002', 'papeterie', 'Papeterie & Offset', 'Le meilleur rapport qualité/prix pour vos moyens et grands tirages (catalogues, flyers en masse, en-têtes).', '/images/products/Depliant-3-volets.jpg', 'copy', 2, true),
  ('a0000000-0000-4000-8000-000000000003', 'packaging', 'Packaging', 'Valorisez vos produits avec des emballages sur mesure, boîtes et étuis personnalisés.', '/images/products/chemises à rabat.jpg', 'package', 3, true),
  ('a0000000-0000-4000-8000-000000000004', 'textile', 'Textile', 'Impression sur vêtements professionnels, t-shirts, polos et casquettes.', '/images/products/Polo.webp', 'gift', 4, true),
  ('a0000000-0000-4000-8000-000000000005', 'objets-publicitaires', 'Goodies & Objets', 'Mugs, clés USB, porte-clés et objets personnalisés pour votre visibilité.', '/images/products/Mug-en-céramique-340-ml.webp', 'coffee', 5, true),
  ('a0000000-0000-4000-8000-000000000006', 'signaletique', 'Signalétique', 'Orientez et informez avec nos solutions de signalétique intérieure et extérieure.', '/images/products/signal.jpg', 'signpost', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCTS — Papeterie & Offset
-- ============================================================
INSERT INTO products (id, category_id, slug, name, short_description, description, image_urls, base_turnaround_days, min_order_quantity, unit_type, is_popular, is_active, tags, display_order) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'carte-de-visite-recto', 'Carte de Visite (Recto Simple)', 'Carte de visite recto simple pelliculée, 350g.', 'Impression haute qualité sur papier 350g avec pelliculage. Parfait pour une première impression professionnelle au meilleur prix.', jsonb_build_array('/images/products/CARTES-DE-VISITE_APESS.jpg'), 2, 100, 'piece', true, true, ARRAY['carte', 'visite', 'pro', 'recto'], 1),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'carte-de-visite-recto-verso', 'Carte de Visite (Recto/Verso)', 'Carte de visite recto/verso pelliculée, 350g.', 'Maximisez votre espace de communication avec une impression recto/verso de qualité supérieure, papier 350g pelliculé.', jsonb_build_array('/images/products/Carte-de-visite-avec-du-vernis-sélectif-UV.webp'), 2, 100, 'piece', true, true, ARRAY['carte', 'visite', 'pro', 'recto-verso'], 2),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'flyer-a5-recto', 'Flyer A5 (Recto Simple)', 'Distribution massive pour vos campagnes.', 'Impression de flyers A5 en recto simple. L''outil idéal pour une communication rapide et abordable.', jsonb_build_array('/images/products/Screenshot_20260415_145335_WhatsAppBusiness.jpg'), 3, 100, 'piece', false, true, ARRAY['flyer', 'promo'], 3),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'flyer-a5-recto-verso', 'Flyer A5 (Recto/Verso)', 'Distribution massive pour vos campagnes, imprimé des deux côtés.', 'Impression de flyers A5 en recto/verso pour diffuser un maximum d''informations.', jsonb_build_array('/images/products/Depliants.webp'), 3, 100, 'piece', true, true, ARRAY['flyer', 'promo'], 4),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000002', 'depliant-a4-3-volets', 'Dépliant A4 (3 volets)', 'Plaquette commerciale pelliculée, 6 pages.', 'Le format standard par excellence pour présenter votre entreprise ou vos services en détail.', jsonb_build_array('/images/products/Depliant-3-volets.jpg'), 4, 100, 'piece', true, true, ARRAY['depliant', 'plaquette', 'commercial'], 5),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000002', 'depliant-a3-4-volets', 'Dépliant A3 (4 volets)', 'Grand format pelliculé, 8 pages.', 'Idéal pour les menus de restaurant ou les présentations très détaillées.', jsonb_build_array('/images/products/Dépliant-Format-3-volets-roulés.webp'), 5, 100, 'piece', false, true, ARRAY['depliant', 'menu', 'grand format'], 6),
  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000002', 'papier-en-tete-a4', 'Papier à en-tête A4', 'Pour votre correspondance officielle.', 'Papier A4 personnalisé aux couleurs de votre entreprise.', jsonb_build_array('/images/products/Papier ANTETE.jpg'), 3, 100, 'piece', false, true, ARRAY['papier', 'lettre', 'courrier'], 7),
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000002', 'bloc-notes-a5', 'Bloc-notes A5', 'Carnet de 50 feuilles détachables.', 'Idéal comme cadeau d''entreprise ou pour l''usage interne de vos équipes.', jsonb_build_array('/images/products/Note-Bloc-S01-scaled.jpg'), 5, 10, 'piece', false, true, ARRAY['carnet', 'bureau', 'goodies'], 8),
  ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000002', 'calendrier-chevalet-simple', 'Calendrier Chevalet Simple', '2 faces carton tout bois, impression quadri.', 'Le calendrier de bureau classique et économique.', jsonb_build_array('/images/products/calendrier chevalet.jpg'), 7, 100, 'piece', true, true, ARRAY['calendrier', 'bureau', 'fin d''année'], 9),
  ('b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000002', 'calendrier-chevalet-spirale', 'Calendrier Chevalet 7 feuillets', 'Reliure spirale, 250g couché brillant recto/verso.', 'Un calendrier premium avec une page par mois (ou bimestriel) relié par spirale métallique.', jsonb_build_array('/images/products/Agenda003-scaled.jpg'), 7, 100, 'piece', false, true, ARRAY['calendrier', 'bureau', 'premium'], 10),
  ('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000002', 'chemise-a-rabats', 'Chemise à Rabats', 'Pochette porte-documents A4 personnalisée.', 'Présentez vos devis et contrats avec élégance grâce à nos chemises à rabats sur mesure.', jsonb_build_array('/images/products/chemises à rabat.jpg'), 5, 100, 'piece', true, true, ARRAY['dossier', 'bureau', 'pro'], 11),
  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000002', 'calendrier-bancaire', 'Calendrier Bancaire', 'Contrecollé sur carton rigide, grand format.', 'Le calendrier indéchirable et rigide à poser ou à suspendre. Visibilité maximale toute l''année.', jsonb_build_array('/images/products/calendrier bancaire.webp'), 7, 50, 'piece', false, true, ARRAY['calendrier', 'cadeau', 'rigide'], 12),
  ('b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000002', 'carte-pvc-fidelite', 'Carte PVC (Fidélité / Accès)', 'Format carte bancaire, plastique rigide.', 'Cartes de fidélité, badges d''accès ou cartes de membre ultra-résistantes avec vernis de protection.', jsonb_build_array('/images/products/Carte-PVC-vernis.webp'), 4, 50, 'piece', false, true, ARRAY['carte', 'plastique', 'fidélité'], 13)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCTS — Numérique et Grand Format
-- ============================================================
INSERT INTO products (id, category_id, slug, name, short_description, description, image_urls, base_turnaround_days, min_order_quantity, unit_type, is_popular, is_active, tags, display_order) VALUES
  ('b0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000001', 'impression-vinyle', 'Impression Vinyle', 'Tarif au m² pour vos stickers et adhésifs.', 'Impression haute définition sur vinyle adhésif. Indiquez le nombre de mètres carrés dans le champ quantité.', jsonb_build_array('/images/products/1772099014278-Branding-vehicule.webp'), 2, 1, 'm2', true, true, ARRAY['autocollant', 'adhésif', 'm2'], 1),
  ('b0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000001', 'impression-bache', 'Impression Bâche', 'Bâche publicitaire extérieure. Tarif au m².', 'Bâche résistante pour affichage extérieur et événementiel. Indiquez le nombre de mètres carrés.', jsonb_build_array('/images/products/a787db0a98148bfb7bac3868a8a11629.jpg'), 2, 1, 'm2', true, true, ARRAY['bannière', 'extérieur', 'm2'], 2),
  ('b0000000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000001', 'vinyle-one-way', 'Vinyle One Way', 'Adhésif micro-perforé pour vitrines. Tarif au m².', 'Permet de voir de l''intérieur vers l''extérieur tout en affichant votre publicité à l''extérieur.', jsonb_build_array('/images/products/one-way-vision-vinyle-pol.webp'), 2, 1, 'm2', false, true, ARRAY['vitrine', 'adhésif', 'micro-perforé'], 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCTS — Packaging
-- ============================================================
INSERT INTO products (id, category_id, slug, name, short_description, description, image_urls, base_turnaround_days, min_order_quantity, unit_type, is_popular, is_active, tags, display_order) VALUES
  ('b0000000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000003', 'vinyle-pre-decoupe', 'Étiquettes Vinyle (Pré-découpé)', 'Planches de stickers découpés. Tarif au m².', 'Étiquettes personnalisées découpées à la forme, livrées en planches prêtes à l''emploi.', jsonb_build_array('/images/products/d7913ffde682ec0a9cfe9a74e0b9a85c.jpg'), 3, 1, 'm2', true, true, ARRAY['stickers', 'produits', 'découpe'], 1)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCTS — Signalétique
-- ============================================================
INSERT INTO products (id, category_id, slug, name, short_description, description, image_urls, base_turnaround_days, min_order_quantity, unit_type, is_popular, is_active, tags, display_order) VALUES
  ('b0000000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000006', 'kakemono-deluxe', 'Kakemono Deluxe', 'Format 2 m × 0,85 m avec structure.', 'Roll-up haut de gamme, structure en aluminium résistante avec impression sur bâche anti-curling incluse.', jsonb_build_array('/images/products/KAKEMONO-ou-DEROULEUR_APESS.jpg'), 3, 1, 'piece', true, true, ARRAY['roll-up', 'salon', 'PLV', 'exposition'], 1)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCTS — Textile
-- ============================================================
INSERT INTO products (id, category_id, slug, name, short_description, description, image_urls, base_turnaround_days, min_order_quantity, unit_type, is_popular, is_active, tags, display_order) VALUES
  ('b0000000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000004', 'tee-shirt-personnalise', 'Tee-shirt Personnalisé', 'Impression ou flocage sur T-shirt coton.', 'T-shirt confortable personnalisé à vos couleurs pour vos équipes ou événements.', jsonb_build_array('/images/products/Textiles.webp'), 4, 10, 'piece', true, true, ARRAY['vêtement', 'flocage', 'équipe'], 1),
  ('b0000000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-000000000004', 'polo-personnalise', 'Polo Pilote / APEX', 'Polo haut de gamme pour les professionnels.', 'Une image soignée pour vos équipes avec ces polos brodés ou imprimés.', jsonb_build_array('/images/products/Polo.webp'), 5, 10, 'piece', true, true, ARRAY['vêtement', 'premium', 'broderie'], 2),
  ('b0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000004', 'gilet-simple', 'Gilet Simple', 'Gilet de sécurité ou de terrain personnalisé.', 'Gilet classique idéal pour les équipes sur le terrain ou l''événementiel.', jsonb_build_array('/images/products/gilet.webp'), 4, 10, 'piece', false, true, ARRAY['sécurité', 'terrain'], 3),
  ('b0000000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000004', 'gilet-vip-poches', 'Gilet VIP avec poches', 'Gilet premium multi-poches personnalisé.', 'Le summum du vêtement de terrain pour vos responsables de chantier ou d''événement.', jsonb_build_array('/images/products/Gilet VIP.jpg'), 4, 10, 'piece', false, true, ARRAY['premium', 'chantier', 'terrain'], 4),
  ('b0000000-0000-4000-8000-000000000023', 'a0000000-0000-4000-8000-000000000004', 'casquette-dtf', 'Casquette DTF', 'Casquette avec impression numérique DTF.', 'Des couleurs éclatantes et sans limite pour votre logo sur le front de la casquette.', jsonb_build_array('/images/products/Casquette.webp'), 3, 10, 'piece', true, true, ARRAY['goodies', 'tête', 'impression'], 5),
  ('b0000000-0000-4000-8000-000000000024', 'a0000000-0000-4000-8000-000000000004', 'casquette-broderie', 'Casquette Broderie', 'Casquette avec broderie haute qualité.', 'Un rendu luxueux, en relief et ultra-durable pour votre marque.', jsonb_build_array('/images/products/Casquette.webp'), 5, 10, 'piece', false, true, ARRAY['goodies', 'premium', 'fils'], 6),
  ('b0000000-0000-4000-8000-000000000025', 'a0000000-0000-4000-8000-000000000004', 'tote-bag', 'Tote Bag', 'Sac en toile écologique personnalisé.', 'L''objet promotionnel par excellence, utile au quotidien et parfait pour la visibilité de votre logo.', jsonb_build_array('/images/products/Tote BAG.png'), 4, 10, 'piece', true, true, ARRAY['sac', 'goodies', 'écologique'], 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCTS — Goodies & Objets
-- ============================================================
INSERT INTO products (id, category_id, slug, name, short_description, description, image_urls, base_turnaround_days, min_order_quantity, unit_type, is_popular, is_active, tags, display_order) VALUES
  ('b0000000-0000-4000-8000-000000000026', 'a0000000-0000-4000-8000-000000000005', 'mug-personnalise', 'Mug en Céramique', 'Mug 340ml blanc avec impression haute qualité.', 'Le cadeau idéal pour vos clients ou vos collaborateurs. Résistant au lave-vaisselle et au micro-ondes.', jsonb_build_array('/images/products/Mug-en-céramique-340-ml.webp'), 2, 1, 'piece', true, true, ARRAY['objet', 'bureau', 'cadeau'], 1),
  ('b0000000-0000-4000-8000-000000000027', 'a0000000-0000-4000-8000-000000000005', 'cle-usb-personnalisee', 'Clé USB Personnalisée', 'Capacité 16Go ou 32Go avec logo imprimé.', 'Clé USB élégante avec votre logo. Indispensable pour vos cadeaux d''affaires et séminaires.', jsonb_build_array('/images/products/clés USB personnalisé.webp'), 7, 20, 'piece', false, true, ARRAY['technologie', 'goodies', 'pro'], 2),
  ('b0000000-0000-4000-8000-000000000028', 'a0000000-0000-4000-8000-000000000005', 'cordon-porte-badge', 'Cordon Porte-badge (Lanyard)', 'Cordon personnalisé avec clip de sécurité.', 'Idéal pour vos événements, salons et pour l''identification de vos collaborateurs en entreprise.', jsonb_build_array('/images/products/Cordon Badge.webp'), 5, 50, 'piece', false, true, ARRAY['événement', 'badge', 'accessoire'], 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- QUANTITY TIERS
-- ============================================================

-- Carte de Visite Recto
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000001', 100, 299, 80, '100 - 299 exemplaires'),
  ('b0000000-0000-4000-8000-000000000001', 300, 499, 75, '300 - 499 exemplaires'),
  ('b0000000-0000-4000-8000-000000000001', 500, 999, 70, '500 - 999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000001', 1000, NULL, 60, '1000+ exemplaires');

-- Carte de Visite Recto/Verso
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000002', 100, 299, 100, '100 - 299 exemplaires'),
  ('b0000000-0000-4000-8000-000000000002', 300, 499, 85, '300 - 499 exemplaires'),
  ('b0000000-0000-4000-8000-000000000002', 500, 999, 75, '500 - 999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000002', 1000, NULL, 60, '1000+ exemplaires');

-- Flyer A5 Recto
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000003', 100, 499, 150, '100 - 499 exemplaires'),
  ('b0000000-0000-4000-8000-000000000003', 500, 999, 130, '500 - 999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000003', 1000, 2999, 100, '1000 - 2999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000003', 3000, 4999, 90, '3000 - 4999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000003', 5000, 9999, 80, '5000 - 9999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000003', 10000, NULL, 70, '10000+ exemplaires');

-- Flyer A5 Recto/Verso
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000004', 100, 499, 200, '100 - 499 exemplaires'),
  ('b0000000-0000-4000-8000-000000000004', 500, 999, 180, '500 - 999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000004', 1000, 2999, 170, '1000 - 2999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000004', 3000, 4999, 150, '3000 - 4999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000004', 5000, 9999, 120, '5000 - 9999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000004', 10000, NULL, 100, '10000+ exemplaires');

-- Dépliant A4 3 volets
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000005', 100, 999, 800, '100 - 999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000005', 1000, 2999, 650, '1000 - 2999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000005', 3000, 4999, 550, '3000 - 4999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000005', 5000, 9999, 500, '5000 - 9999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000005', 10000, NULL, 400, '10000+ exemplaires');

-- Dépliant A3 4 volets
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000006', 100, 999, 1000, '100 - 999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000006', 1000, 2999, 800, '1000 - 2999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000006', 3000, 4999, 700, '3000 - 4999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000006', 5000, 9999, 600, '5000 - 9999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000006', 10000, NULL, 500, '10000+ exemplaires');

-- Papier en-tête A4
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000007', 100, 499, 200, '100 - 499 exemplaires'),
  ('b0000000-0000-4000-8000-000000000007', 500, 999, 175, '500 - 999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000007', 1000, 1999, 150, '1000 - 1999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000007', 2000, 4999, 120, '2000 - 4999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000007', 5000, NULL, 100, '5000+ exemplaires');

-- Bloc-notes A5
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000008', 10, 49, 2500, '10 - 49 exemplaires'),
  ('b0000000-0000-4000-8000-000000000008', 50, 99, 2000, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000008', 100, NULL, 1500, '100+ exemplaires');

-- Calendrier Chevalet Simple
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000009', 100, 499, 800, '100 - 499 exemplaires'),
  ('b0000000-0000-4000-8000-000000000009', 500, 999, 600, '500 - 999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000009', 1000, NULL, 400, '1000+ exemplaires');

-- Calendrier Chevalet 7 feuillets
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000010', 100, 499, 2500, '100 - 499 exemplaires'),
  ('b0000000-0000-4000-8000-000000000010', 500, 999, 2000, '500 - 999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000010', 1000, NULL, 1500, '1000+ exemplaires');

-- Chemise à Rabats
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000011', 100, 249, 1200, '100 - 249 exemplaires'),
  ('b0000000-0000-4000-8000-000000000011', 250, 499, 1000, '250 - 499 exemplaires'),
  ('b0000000-0000-4000-8000-000000000011', 500, 999, 800, '500 - 999 exemplaires'),
  ('b0000000-0000-4000-8000-000000000011', 1000, NULL, 600, '1000+ exemplaires');

-- Calendrier Bancaire
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000012', 50, 99, 5000, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000012', 100, 249, 4000, '100 - 249 exemplaires'),
  ('b0000000-0000-4000-8000-000000000012', 250, 499, 3000, '250 - 499 exemplaires'),
  ('b0000000-0000-4000-8000-000000000012', 500, NULL, 2500, '500+ exemplaires');

-- Carte PVC
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000013', 50, 99, 1000, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000013', 100, 249, 800, '100 - 249 exemplaires'),
  ('b0000000-0000-4000-8000-000000000013', 250, 499, 600, '250 - 499 exemplaires'),
  ('b0000000-0000-4000-8000-000000000013', 500, NULL, 400, '500+ exemplaires');

-- Impression Vinyle (m²)
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000014', 1, NULL, 5000, 'Par m²');

-- Impression Bâche (m²)
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000015', 1, NULL, 4000, 'Par m²');

-- Vinyle One Way (m²)
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000016', 1, NULL, 10000, 'Par m²');

-- Étiquettes Vinyle Pré-découpé (m²)
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000017', 1, NULL, 10000, 'Par m²');

-- Kakemono Deluxe
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000018', 1, NULL, 70000, 'Unité');

-- Tee-shirt Personnalisé
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000019', 10, 49, 4000, '10 - 49 exemplaires'),
  ('b0000000-0000-4000-8000-000000000019', 50, 99, 3000, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000019', 100, NULL, 2000, '100+ exemplaires');

-- Polo Pilote / APEX
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000020', 10, 49, 5000, '10 - 49 exemplaires'),
  ('b0000000-0000-4000-8000-000000000020', 50, 99, 4500, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000020', 100, NULL, 4000, '100+ exemplaires');

-- Gilet Simple
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000021', 10, 49, 4000, '10 - 49 exemplaires'),
  ('b0000000-0000-4000-8000-000000000021', 50, 99, 3000, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000021', 100, NULL, 2500, '100+ exemplaires');

-- Gilet VIP avec poches
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000022', 10, 49, 5000, '10 - 49 exemplaires'),
  ('b0000000-0000-4000-8000-000000000022', 50, 99, 4000, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000022', 100, NULL, 3500, '100+ exemplaires');

-- Casquette DTF
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000023', 10, 49, 2000, '10 - 49 exemplaires'),
  ('b0000000-0000-4000-8000-000000000023', 50, 99, 1750, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000023', 100, NULL, 1500, '100+ exemplaires');

-- Casquette Broderie
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000024', 10, 49, 2500, '10 - 49 exemplaires'),
  ('b0000000-0000-4000-8000-000000000024', 50, 99, 2250, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000024', 100, NULL, 2000, '100+ exemplaires');

-- Tote Bag
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000025', 10, 49, 4000, '10 - 49 exemplaires'),
  ('b0000000-0000-4000-8000-000000000025', 50, 99, 3500, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000025', 100, NULL, 3000, '100+ exemplaires');

-- Mug Céramique
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000026', 1, 9, 4500, '1 - 9 exemplaires'),
  ('b0000000-0000-4000-8000-000000000026', 10, 49, 3500, '10 - 49 exemplaires'),
  ('b0000000-0000-4000-8000-000000000026', 50, 99, 3000, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000026', 100, NULL, 2500, '100+ exemplaires');

-- Clé USB
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000027', 20, 49, 6500, '20 - 49 exemplaires'),
  ('b0000000-0000-4000-8000-000000000027', 50, 99, 5500, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000027', 100, NULL, 4500, '100+ exemplaires');

-- Cordon Porte-badge
INSERT INTO product_quantity_tiers (product_id, min_qty, max_qty, base_unit_price, label) VALUES
  ('b0000000-0000-4000-8000-000000000028', 50, 99, 1500, '50 - 99 exemplaires'),
  ('b0000000-0000-4000-8000-000000000028', 100, 499, 1200, '100 - 499 exemplaires'),
  ('b0000000-0000-4000-8000-000000000028', 500, NULL, 800, '500+ exemplaires');

-- ============================================================
-- REALISATIONS
-- ============================================================
INSERT INTO realisations (id, title, category, description, image_url, client_name, is_featured, display_order) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'Branding Véhicule - Flotte Entreprise', 'Signalétique', 'Habillage complet de véhicule en vinyle haute qualité.', '/images/products/1772099158416-Branding-vehicule1.webp', 'Logistique Express', true, 1),
  ('c0000000-0000-4000-8000-000000000002', 'Packaging Cosmétique Luxe', 'Packaging', 'Conception et impression packaging cosmétique haut de gamme.', '/images/products/75cef07fffe16039fb462f9f837b07f6.jpg', 'Awa Beauty', true, 2),
  ('c0000000-0000-4000-8000-000000000003', 'Flyers Événementiels - Vernissage', 'Edition', 'Impression de flyers pour exposition artistique.', '/images/products/Screenshot_20260417_230627_WhatsAppBusiness.jpg', 'Galerie Dakar', false, 3),
  ('c0000000-0000-4000-8000-000000000004', 'Polos Brodés - Uniformes Staff', 'Textile', 'Broderie sur polos pour uniformes hôteliers.', '/images/products/Polo DTF.webp', 'Hôtel Terrou-Bi', true, 4),
  ('c0000000-0000-4000-8000-000000000005', 'Dépliants Publicitaires 3 Volets', 'Edition', 'Impression offset de dépliants institutionnels.', '/images/products/Depliants.webp', 'Banque de l''Habitat', false, 5),
  ('c0000000-0000-4000-8000-000000000006', 'Kakemono Salon Professionnel', 'Signalétique', 'Roll-up grand format pour salon professionnel.', '/images/products/Screenshot_20260417_230325_WhatsAppBusiness.jpg', 'Global Tech Expo', false, 6),
  ('c0000000-0000-4000-8000-000000000007', 'Packaging Food - Box Burger', 'Packaging', 'Boîtes personnalisées pour restauration rapide.', '/images/products/7a799d4e77e11ab862e343e9cfb8b874.jpg', 'Dakar Burger', true, 7),
  ('c0000000-0000-4000-8000-000000000008', 'Badges & Cordons Personnalisés', 'Textile', 'Cordons et badges pour sommet international.', '/images/products/Cordon-badge2.webp', 'Sommet Afrique', false, 8),
  ('c0000000-0000-4000-8000-000000000009', 'Etiquettes Vinyle Découpées', 'Numérique', 'Étiquettes adhésives personnalisées découpées à la forme.', '/images/products/490022937_1220771286719108_4240592187363009521_n.jpg', 'Artisan Savonnier', false, 9),
  ('c0000000-0000-4000-8000-000000000010', 'Bâche Grand Format - Façade', 'Signalétique', 'Bâche publicitaire grand format pour façade immobilière.', '/images/products/Screenshot_20260415_145219_WhatsAppBusiness.jpg', 'Immobilier Plus', true, 10),
  ('c0000000-0000-4000-8000-000000000011', 'Sacs Kraft Personnalisés', 'Packaging', 'Sacs en papier kraft avec logo personnalisé.', '/images/products/dfdb8e6777b3a2468a415e84508d1470.jpg', 'Boutique Chic', false, 11),
  ('c0000000-0000-4000-8000-000000000012', 'T-shirts Impression DTF', 'Textile', 'Impression DTF haute définition sur t-shirts.', '/images/products/Screenshot_20260415_145335_WhatsAppBusiness.jpg', 'Club de Sport', false, 12)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BUSINESS CONFIG
-- ============================================================
INSERT INTO business_config (key, value, description) VALUES
  ('whatsapp_number', '"221776190419"', 'Numéro WhatsApp principal GLOBAL TIC'),
  ('urgent_surcharge_percent', '30', 'Surcharge pour commande urgente (%)'),
  ('quote_validity_days', '15', 'Durée de validité des devis (jours)'),
  ('default_turnaround_days', '3', 'Délai de production par défaut (jours)'),
  ('min_order_amount', '5000', 'Montant minimum de commande (FCFA)'),
  ('delivery_zones', '{"retrait": {"label": "Retrait en boutique", "fee": 0}, "livraison_dakar": {"label": "Livraison Dakar", "fee": 2000}, "livraison_region": {"label": "Livraison Région", "fee": 5000}}', 'Zones et frais de livraison'),
  ('loyalty_thresholds', '{"regulier": {"minOrders": 3, "minSpent": 50000}, "vip": {"minOrders": 10, "minSpent": 200000}, "premium": {"minOrders": 25, "minSpent": 500000}}', 'Seuils de fidélité client'),
  ('working_hours', '{"weekdays": "08h - 18h", "saturday": "09h - 14h", "sunday": "Fermé"}', 'Horaires de travail'),
  ('company_name', '"GLOBAL TIC"', 'Nom de l''entreprise'),
  ('company_address', '"Dakar, Sénégal"', 'Adresse de l''entreprise'),
  ('company_email', '"contact@globalticgroup.com"', 'Email de contact')
ON CONFLICT (key) DO NOTHING;
