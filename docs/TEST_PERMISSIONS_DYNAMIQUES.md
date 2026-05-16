# Test des permissions dynamiques — GLOBAL TIC PrintTech

Date : 2026-05-16

---

## Architecture vérifiée

| Composant | Mécanisme |
|---|---|
| Sidebar (menu) | `canAccessModuleDynamic()` avec surcharges DB |
| Pages admin (garde serveur) | `checkModuleAccess()` — async, lit `role_module_access` |
| Dashboard (affichage conditionnel) | `canAccessModule()` statique (fallback) |
| Server Actions | `requireRole()` — matrice hardcoded (non dynamique) |

---

## Résultats par rôle

### Patron

| Test | Résultat |
|---|---|
| Voit tous les modules dans le menu | OK |
| Accède à `/admin/permissions` | OK |
| Peut modifier l'ordre du menu | OK |
| Peut restaurer l'ordre par défaut | OK |
| Ne peut pas perdre ses accès (code protège) | OK |
| Changements journalisés dans `activity_log` | OK |

### Admin

| Test | Résultat |
|---|---|
| Voit les modules autorisés | OK |
| N'a pas accès à `/admin/permissions` | OK (AccessDenied) |
| N'a pas accès à `/admin/parametres` | OK (AccessDenied) |
| N'a pas accès à `/admin/utilisateurs` | OK (AccessDenied) |
| N'a pas accès à `/admin/maintenance` | OK (AccessDenied) |
| Ne peut pas modifier les droits du patron | OK (serveur bloque) |

### Commercial

| Test | Résultat |
|---|---|
| Modules visibles : prospects, whatsapp, clients, devis, commandes, tâches, impayés, factures, planning, aide | OK |
| Modules interdits : maintenance, utilisateurs, paramètres, permissions, rapports, produits, catégories, imports, réalisations | OK |
| URL directe `/admin/maintenance` → AccessDenied | OK |
| URL directe `/admin/utilisateurs` → AccessDenied | OK |
| URL directe `/admin/permissions` → AccessDenied | OK |

### Production

| Test | Résultat |
|---|---|
| Modules visibles : commandes, planning, tâches, aide | OK |
| Modules interdits : finances, factures, impayés, rapports, prospects, whatsapp, clients, devis | OK |
| URL directe `/admin/factures` → AccessDenied | OK |
| URL directe `/admin/impayes` → AccessDenied | OK |

### Infographiste

| Test | Résultat |
|---|---|
| Modules visibles : commandes, tâches, planning, aide | OK |
| Modules interdits : finances, factures, impayés, rapports, prospects, whatsapp, clients, devis, produits, catégories | OK |
| URL directe `/admin/rapports` → AccessDenied | OK |
| URL directe `/admin/prospects` → AccessDenied | OK |

---

## Tests menu dynamique

| Test | Résultat |
|---|---|
| Changer l'ordre d'un module | OK — sidebar mis à jour après rechargement |
| Restaurer l'ordre par défaut | OK — revient à l'ordre parcours client |
| Table `admin_menu_config` vide → fallback ordre hardcoded | OK |
| Table `role_module_access` vide → fallback permissions hardcoded | OK |

---

## Tests sécurité

| Test | Résultat |
|---|---|
| Masquer un module dans le menu ne suffit pas pour bloquer | OK — garde serveur bloque aussi |
| Désactiver un module pour un rôle via DB → menu masqué + page bloquée | OK |
| `checkModuleAccess()` retourne toujours `true` pour patron | OK |
| Tenter d'insérer une surcharge qui retire l'accès du patron → rejeté | OK |
| Modification de permissions journalisée | OK |
| RLS : seul patron peut INSERT/UPDATE sur `role_module_access` | OK |
| RLS : tous les admins peuvent SELECT | OK |

---

## Anomalies détectées et corrigées

| Anomalie | Correction |
|---|---|
| `/admin/aide` n'avait aucune garde de permission | Ajout de `checkModuleAccess()` |
| `/admin/whatsapp` utilisait redirect au lieu d'AccessDenied | Corrigé → AccessDenied |
| Pages utilisaient `canAccessModule()` statique (ne tenait pas compte des surcharges DB) | Toutes les pages migrées vers `checkModuleAccess()` async |

---

## Modules critiques (protégés)

| Module | Accès par défaut | Modifiable par patron |
|---|---|---|
| `parametres` | patron | Oui |
| `utilisateurs` | patron | Oui |
| `maintenance` | patron | Oui |
| `rapports` | patron, admin | Oui |
| `impayes` | patron, admin, commercial | Oui |
| `factures` | patron, admin, commercial | Oui |

---

## Décision finale

| Critère | Statut |
|---|---|
| Sidebar dynamique fonctionnelle | OK |
| Pages protégées côté serveur | OK |
| Fallback sécurisé si tables vides | OK |
| Patron non altérable | OK |
| Journalisation active | OK |
| Build propre | OK |
| TypeScript strict | OK |

**Validation : les permissions dynamiques sont opérationnelles et sécurisées.**
