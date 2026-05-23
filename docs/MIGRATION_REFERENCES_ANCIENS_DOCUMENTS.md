# Migration des anciennes références documents

## Objectif

Renommer les anciennes références au format `PREFIX-YYYY-NNNN` vers le nouveau format `PREFIX-YYYY-MMDD-N` basé sur la date de création.

## Tables concernées

| Table | Champ | Préfixe | Contrainte |
|-------|-------|---------|------------|
| quotes | reference | DEV | UNIQUE NOT NULL |
| orders | reference | CMD | UNIQUE NOT NULL |
| invoices | reference | FAC | UNIQUE NOT NULL |
| prospects | reference | PRO | UNIQUE NOT NULL |

## Relations inter-tables

- `orders.quote_id` → UUID (pas de référence texte stockée)
- `invoices.order_id` → UUID (pas de référence texte stockée)
- `payments.order_id` → UUID (pas de référence texte stockée)
- `BL` = dérivé à la volée : `BL-${order.reference}` (pas stocké)

**Conclusion** : Les relations sont toutes via UUID. Renommer les références ne casse aucune jointure.

## Stratégie

1. Ajouter une colonne `legacy_reference TEXT` à chaque table concernée
2. Copier l'ancienne référence dans `legacy_reference`
3. Calculer la nouvelle référence basée sur `created_at`
4. Mettre à jour le champ `reference`
5. Ne traiter que les références qui matchent l'ancien format (4 chiffres séquentiels)

## Détection ancien format

Pattern ancien : `PREFIX-YYYY-NNNN` (exactement 4 chiffres finaux sans tiret)

Regex : `^(DEV|CMD|FAC|PRO)-\d{4}-\d{4}$`

Les références déjà au nouveau format `PREFIX-YYYY-MMDD-N` ne seront pas touchées.

## Mapping exemple

| Ancienne référence | created_at | Nouvelle référence |
|---|---|---|
| DEV-2026-0001 | 2026-05-22 | DEV-2026-0522-1 |
| DEV-2026-0002 | 2026-05-22 | DEV-2026-0522-2 |
| DEV-2026-0003 | 2026-05-23 | DEV-2026-0523-1 |
| CMD-2026-0001 | 2026-05-22 | CMD-2026-0522-1 |
| FAC-2026-0001 | 2026-05-23 | FAC-2026-0523-1 |

## Risques

| Risque | Mitigation |
|--------|-----------|
| Doublon si un nouveau doc a déjà pris le même numéro du jour | La migration compte les existants avant d'assigner |
| Perte de l'ancienne référence | Sauvegardée dans `legacy_reference` |
| Client qui cite l'ancienne référence | Recherche étendue à `legacy_reference` |
| Interruption en cours de migration | La migration est idempotente (ne re-migre pas ce qui est déjà fait) |

## Plan de rollback

```sql
-- Restaurer les anciennes références depuis la sauvegarde
UPDATE quotes SET reference = legacy_reference WHERE legacy_reference IS NOT NULL;
UPDATE orders SET reference = legacy_reference WHERE legacy_reference IS NOT NULL;
UPDATE invoices SET reference = legacy_reference WHERE legacy_reference IS NOT NULL;
UPDATE prospects SET reference = legacy_reference WHERE legacy_reference IS NOT NULL;
```

## Requêtes d'audit (à exécuter AVANT migration)

```sql
-- Compter les documents à migrer par table
SELECT 'quotes' as table_name, COUNT(*) as count
FROM quotes WHERE reference ~ '^(DEV|CMD|FAC|PRO)-\d{4}-\d{4}$'
UNION ALL
SELECT 'orders', COUNT(*)
FROM orders WHERE reference ~ '^(DEV|CMD|FAC|PRO)-\d{4}-\d{4}$'
UNION ALL
SELECT 'invoices', COUNT(*)
FROM invoices WHERE reference ~ '^(DEV|CMD|FAC|PRO)-\d{4}-\d{4}$'
UNION ALL
SELECT 'prospects', COUNT(*)
FROM prospects WHERE reference ~ '^(DEV|CMD|FAC|PRO)-\d{4}-\d{4}$';

-- Lister les devis à migrer avec leur date
SELECT id, reference, created_at::date as jour
FROM quotes
WHERE reference ~ '^DEV-\d{4}-\d{4}$'
ORDER BY created_at;

-- Lister les commandes à migrer
SELECT id, reference, created_at::date as jour
FROM orders
WHERE reference ~ '^CMD-\d{4}-\d{4}$'
ORDER BY created_at;

-- Lister les factures à migrer
SELECT id, reference, created_at::date as jour
FROM invoices
WHERE reference ~ '^FAC-\d{4}-\d{4}$'
ORDER BY created_at;

-- Lister les prospects à migrer
SELECT id, reference, created_at::date as jour
FROM prospects
WHERE reference ~ '^PRO-\d{4}-\d{4}$'
ORDER BY created_at;
```

## Requêtes de vérification APRÈS migration

```sql
-- Vérifier qu'il ne reste aucune ancienne référence
SELECT 'quotes' as t, COUNT(*) FROM quotes WHERE reference ~ '^(DEV|CMD|FAC|PRO)-\d{4}-\d{4}$'
UNION ALL SELECT 'orders', COUNT(*) FROM orders WHERE reference ~ '^(DEV|CMD|FAC|PRO)-\d{4}-\d{4}$'
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices WHERE reference ~ '^(DEV|CMD|FAC|PRO)-\d{4}-\d{4}$'
UNION ALL SELECT 'prospects', COUNT(*) FROM prospects WHERE reference ~ '^(DEV|CMD|FAC|PRO)-\d{4}-\d{4}$';

-- Vérifier que legacy_reference est bien remplie
SELECT 'quotes' as t, COUNT(*) FROM quotes WHERE legacy_reference IS NOT NULL
UNION ALL SELECT 'orders', COUNT(*) FROM orders WHERE legacy_reference IS NOT NULL
UNION ALL SELECT 'invoices', COUNT(*) FROM invoices WHERE legacy_reference IS NOT NULL
UNION ALL SELECT 'prospects', COUNT(*) FROM prospects WHERE legacy_reference IS NOT NULL;

-- Vérifier absence de doublons
SELECT reference, COUNT(*) FROM quotes GROUP BY reference HAVING COUNT(*) > 1;
SELECT reference, COUNT(*) FROM orders GROUP BY reference HAVING COUNT(*) > 1;
SELECT reference, COUNT(*) FROM invoices GROUP BY reference HAVING COUNT(*) > 1;
SELECT reference, COUNT(*) FROM prospects GROUP BY reference HAVING COUNT(*) > 1;
```

## Décision de validation

- [ ] Audit SQL exécuté et résultats vérifiés
- [ ] Mapping visuel confirmé
- [ ] Migration exécutée sur Supabase
- [ ] Vérifications post-migration OK
- [ ] Tests fonctionnels OK (PDF, recherche, WhatsApp)
