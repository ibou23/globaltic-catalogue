# Checklist Go Live — GLOBAL TIC PrintTech

**Plateforme :** GLOBAL TIC PrintTech Admin  
**Version :** 2.44  
**Date de rédaction :** 14 mai 2026  
**Statut :** Prêt sous réserve (voir section Décision)

---

## Légende

- `[x]` Vérifié et OK
- `[ ]` À vérifier / À faire avant lancement
- `[!]` Point d'attention (non bloquant)
- `[~]` Partiellement OK

---

## 1. Infrastructure & Variables d'environnement

### 1.1 Variables Vercel (à configurer dans le Dashboard Vercel)

- [ ] `NEXT_PUBLIC_SUPABASE_URL` — URL du projet Supabase (ex: `https://xxx.supabase.co`)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Clé publique anon (safe côté client)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — **JAMAIS dans `NEXT_PUBLIC_`**, uniquement serveur
- [!] `NEXT_PUBLIC_GA_ID` — Google Analytics (optionnel, non bloquant)
- [!] `NEXT_PUBLIC_FB_PIXEL_ID` — Facebook Pixel (optionnel, non bloquant)

> **Règle critique :** `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais apparaître dans une variable `NEXT_PUBLIC_*`. Vérifier dans Vercel → Settings → Environment Variables.

### 1.2 Fichiers sensibles

- [x] `.env.local` présent dans `.gitignore` — **CONFIRMÉ**
- [x] `.env` présent dans `.gitignore` — **CONFIRMÉ**
- [x] `.env.*` présent dans `.gitignore` — **CONFIRMÉ**
- [x] Aucun secret détecté dans l'historique Git — **CONFIRMÉ**
- [x] `service_role` uniquement dans `lib/supabase/admin-client.ts` (serveur) — **CONFIRMÉ**
- [x] `createAdminClient()` utilisé uniquement dans `lib/db/admin-users.ts` (Server Action) — **CONFIRMÉ**

### 1.3 Next.js & Build

- [x] `next build` passe sans erreur TypeScript — **CONFIRMÉ (build 8e39aed)**
- [x] Toutes les routes marquées `ƒ (Dynamic)` — **CONFIRMÉ**
- [x] `export const dynamic = "force-dynamic"` sur toutes les pages admin dynamiques — **CONFIRMÉ**
- [x] `next.config.ts` configure les `remotePatterns` pour Supabase Storage — **CONFIRMÉ**
- [x] Vercel Analytics & Speed Insights intégrés — **CONFIRMÉ**

---

## 2. Base de données Supabase

### 2.1 Migrations à appliquer (dans l'ordre)

- [ ] `001_initial_schema.sql` — Tables de base (produits, devis, commandes, clients)
- [ ] `002_rls_policies.sql` — Politiques RLS sur toutes les tables
- [ ] `003_orders_payment_fields.sql` — Champs paiement commandes
- [ ] `004_order_files_types.sql` — Types fichiers + bucket `order-files`
- [ ] `005_notifications_fields.sql` — Champs notifications étendus
- [ ] `006_business_config_extended.sql` — Configuration métier étendue
- [ ] `007_storage_catalog_images.sql` — Bucket `catalog-images`
- [ ] `008_tasks.sql` — Table tâches/relances
- [ ] `009_invoices.sql` — Table factures
- [ ] `010_quality_checks.sql` — Table contrôle qualité
- [ ] `011_delivery_fields.sql` — Champs livraison avancés
- [ ] `012_order_closure.sql` — Clôture + satisfaction client
- [ ] `supabase/admin_setup.sql` — Utilisateur patron initial

> Appliquer via Supabase Dashboard → SQL Editor ou CLI `supabase db push`.

### 2.2 Row Level Security (RLS)

- [x] RLS activé sur toutes les tables métier — **CONFIRMÉ dans 002**
- [x] Lecture publique catalogue (produits, catégories actifs) — **CONFIRMÉ**
- [x] Écriture catalogue réservée aux admins — **CONFIRMÉ**
- [x] Données clients/commandes/devis réservées aux admins — **CONFIRMÉ**
- [x] `is_admin()` helper défini comme `SECURITY DEFINER` — **CONFIRMÉ**
- [x] `get_admin_role()` helper disponible — **CONFIRMÉ**

### 2.3 Storage Buckets

- [ ] Bucket `catalog-images` créé (public) — appliquer migration 007
- [ ] Bucket `order-files` créé (privé, admins seulement) — appliquer migration 004
- [x] Policies Storage définies dans les migrations — **CONFIRMÉ**
- [ ] Vérifier que `order-files` n'est PAS public dans le Dashboard Supabase

### 2.4 Utilisateur initial

- [ ] Créer le compte email/mot de passe dans Supabase Auth
- [ ] Exécuter `supabase/admin_setup.sql` pour créer le profil patron
- [ ] Se connecter sur `/login` et vérifier accès à `/admin`

---

## 3. Parcours métier complet

### 3.1 Site public

- [ ] `/` — Page d'accueil charge correctement
- [ ] `/catalogue` — Liste des catégories et produits actifs
- [ ] `/produit/[slug]` — Page produit avec calculateur
- [ ] Bouton WhatsApp fonctionne (lien `wa.me/221776190419`)
- [ ] `/realisations` — Galerie réalisations
- [ ] SEO : balises title/meta/og présentes
- [ ] Responsive mobile (catalogue, produit)
- [ ] Images produits chargées depuis Supabase Storage

### 3.2 Authentification

- [ ] `/login` — Formulaire de connexion
- [ ] Redirection vers `/admin` après connexion
- [ ] Redirection vers `/login` si non authentifié (via layout admin)
- [ ] Déconnexion fonctionne

### 3.3 Workflow commande complet

- [ ] Commercial crée un devis (`/admin/devis`)
- [ ] PDF devis généré (`/api/admin/devis/[id]/pdf`)
- [ ] Devis accepté → conversion en commande
- [ ] Acompte enregistré (QuickPaymentModal)
- [ ] Reçu PDF généré (`/api/admin/commandes/[id]/receipt`)
- [ ] Upload fichier client / maquette
- [ ] BAT envoyé, validé (statut `bat_valide`)
- [ ] Passage en production (`en_production`)
- [ ] Contrôle qualité (QualityCheckModal — 8 points)
- [ ] Statut `pret` après QC validé
- [ ] Livraison planifiée (DeliveryModal)
- [ ] Bon de livraison PDF (`/api/admin/commandes/[id]/bon-livraison`)
- [ ] Facture PDF générée (`/api/admin/commandes/[id]/facture`)
- [ ] Solde encaissé, commande livrée
- [ ] Clôture + satisfaction enregistrée (ClosureModal)
- [ ] Demande d'avis Google WhatsApp (si `google_review_url` configuré)

---

## 4. Rôles et permissions

### 4.1 Patron

- [ ] Accès à tous les modules (dashboard, commandes, devis, clients, produits, factures, rapports, paramètres, utilisateurs, maintenance)
- [ ] Peut supprimer commandes/devis/clients
- [ ] Peut purger les notifications
- [ ] Accès aux rapports PDF complets (données financières)
- [ ] Peut modifier les paramètres métier (`google_review_url`, templates WA, etc.)

### 4.2 Admin

- [ ] Accès commandes, devis, clients, factures, rapports (sans finances sensibles)
- [ ] Ne peut PAS accéder à `/admin/parametres`, `/admin/utilisateurs`, `/admin/maintenance`

### 4.3 Commercial

- [ ] Accès devis, commandes, clients, factures, impayés
- [ ] Ne peut PAS changer le statut de production d'une commande
- [ ] Ne voit PAS les rapports financiers complets

### 4.4 Production

- [ ] Accès commandes, planning
- [ ] Peut changer statut de commande (`commande:edit_status`)
- [ ] Ne peut PAS voir les données financières

### 4.5 Infographiste

- [ ] Accès commandes (lecture), peut uploader fichiers / BAT
- [ ] Ne voit pas les montants

---

## 5. Pages admin — Vérification fonctionnelle

| Page | Module requis | Testé |
|------|---------------|-------|
| `/admin` | dashboard | [ ] |
| `/admin/devis` | devis | [ ] |
| `/admin/commandes` | commandes | [ ] |
| `/admin/factures` | factures | [ ] |
| `/admin/clients` | clients | [ ] |
| `/admin/clients/[id]` | clients | [ ] |
| `/admin/produits` | produits | [ ] |
| `/admin/categories` | categories | [ ] |
| `/admin/realisations` | realisations | [ ] |
| `/admin/planning` | planning | [ ] |
| `/admin/taches` | taches | [ ] |
| `/admin/impayes` | impayes | [ ] |
| `/admin/rapports` | rapports | [ ] |
| `/admin/utilisateurs` | utilisateurs | [ ] |
| `/admin/parametres` | parametres | [ ] |
| `/admin/imports` | imports | [ ] |
| `/admin/maintenance` | maintenance | [ ] |
| `/admin/aide` | aide | [ ] |

> Note : `/admin/exports` n'existe pas en tant que page dédiée — les exports CSV sont dans `/admin/imports`.

---

## 6. Génération PDF

- [ ] PDF devis — logo, conditions, articles, total
- [ ] PDF facture — référence, dates, TVA si applicable
- [ ] PDF reçu de paiement — montant, méthode, date
- [ ] PDF bon de livraison — destinataire, articles, signatures
- [ ] PDF rapport d'activité (2 pages) — KPIs, top clients, commandes
- [ ] PDFs protégés (403 si non authentifié)
- [ ] PDFs inaccessibles aux rôles non autorisés

---

## 7. Notifications

- [ ] Notifications in-app créées lors des événements métier (commande créée, paiement, QC, livraison, clôture)
- [ ] Compteur non-lus dans le header
- [ ] Marquer comme lu fonctionne
- [ ] Purge notifications (patron) dans Maintenance

---

## 8. Imports / Exports CSV

- [ ] Import produits CSV fonctionne
- [ ] Import catégories CSV fonctionne
- [ ] Import prix CSV fonctionne
- [ ] Export commandes disponible (si implémenté)
- [ ] Validation des fichiers CSV côté serveur

---

## 9. Paramètres métier

- [ ] Nom entreprise, slogan, adresse, téléphone, WhatsApp configurés
- [ ] `google_review_url` configuré (optionnel mais recommandé)
- [ ] Templates WhatsApp personnalisés si nécessaire
- [ ] Conditions PDF définies
- [ ] Zones de livraison et frais configurés

---

## 10. Sécurité — Points critiques

- [x] `SUPABASE_SERVICE_ROLE_KEY` utilisé uniquement côté serveur — **CONFIRMÉ**
- [x] Toutes les Server Actions vérifiées par `requireRole()` ou `canPerform()` — **CONFIRMÉ**
- [x] Layout admin redirige vers `/login` si non authentifié — **CONFIRMÉ**
- [x] Routes API PDF retournent 403 si non authentifié — **CONFIRMÉ**
- [x] RLS actif sur toutes les tables — **CONFIRMÉ**
- [x] Bucket `order-files` privé (policies admin-only) — **CONFIRMÉ dans migration 004**
- [x] Bucket `catalog-images` public en lecture uniquement — **CONFIRMÉ**
- [x] Pas de secrets dans le dépôt Git — **CONFIRMÉ**
- [ ] Vérifier que `order-files` est bien `public: false` dans Supabase Dashboard

---

## 11. Bugs corrigés dans cette phase

| Fichier | Bug | Correction |
|---------|-----|------------|
| `lib/actions/closure.ts` | Journalisation vers table inexistante `order_logs` | Remplacé par `logOrderEvent()` → `activity_log` |

---

## 12. Points d'attention non bloquants

- [!] Pas de middleware Next.js global — la protection admin repose uniquement sur le layout server. Les routes API ne sont pas protégées par middleware mais par vérification manuelle dans chaque handler. Risque faible en contexte interne, mais un middleware Supabase SSR serait plus robuste pour la scalabilité.
- [!] `supabase.co` hostname hardcodé dans `next.config.ts` (`ftggpgortqlxxyzfabcr.supabase.co`). À mettre à jour si le projet Supabase change.
- [!] `facebook.com/globaltic` et `instagram.com/globaltic` dans `siteConfig` — vérifier que ces URLs sont correctes avant lancement public.
- [!] Google Analytics (`NEXT_PUBLIC_GA_ID`) et Facebook Pixel (`NEXT_PUBLIC_FB_PIXEL_ID`) non configurés — tracking analytics absent. Non bloquant.
- [!] La page `/admin/exports` est référencée dans la checklist mais n'existe pas en tant que page dédiée. Les exports sont dans `/admin/imports`. À clarifier avec l'équipe.
- [!] `lib/config/business.ts` — vérifier s'il contient des valeurs hardcodées à remplacer par `getBusinessConfig()`.

---

## 13. Recommandations avant lancement

1. **Appliquer les 12 migrations** dans l'ordre sur le projet Supabase de production.
2. **Créer le compte patron** via Supabase Auth + `admin_setup.sql`.
3. **Configurer les variables d'environnement** dans Vercel (3 variables minimum).
4. **Vérifier le bucket `order-files`** : s'assurer qu'il est privé dans le Dashboard.
5. **Configurer `google_review_url`** dans les Paramètres pour activer les demandes d'avis.
6. **Tester le parcours complet** avec un devis test → commande → livraison → clôture.
7. **Former l'équipe** sur les rôles (commercial, production, infographiste).

---

## 14. Décision de mise en production

### Résumé

| Catégorie | Statut |
|-----------|--------|
| Code & Build | ✅ OK |
| TypeScript strict | ✅ OK |
| Sécurité (secrets, RLS, permissions) | ✅ OK |
| Bug critique corrigé (closure.ts) | ✅ Corrigé |
| Infrastructure (migrations, buckets) | ⏳ À appliquer |
| Tests fonctionnels | ⏳ À effectuer |
| Configuration production | ⏳ À faire |

### Verdict

> **🟡 PRÊT SOUS RÉSERVE**

Le code est stable, les permissions sont en place, aucun secret n'est exposé, le build est propre. La plateforme est prête à être déployée dès que :

1. Les 12 migrations sont appliquées sur Supabase Production
2. Les 3 variables d'environnement sont configurées dans Vercel
3. Le parcours complet est testé une fois en staging ou sur la prod avec des données de test

Aucun bug bloquant dans le code. Un bug mineur (table `order_logs` inexistante dans `closure.ts`) a été corrigé dans cette phase.

---

*Checklist rédigée dans le cadre de la Phase 2.44 — Finalisation pré-lancement GLOBAL TIC PrintTech.*
