# Recette — Commande → Production → Livraison → Satisfaction

> Version : Phase 2.65 — Mai 2026

## Objectif

Valider de bout en bout le cycle opérationnel après acceptation du devis : paiement, fichiers/BAT, production, contrôle qualité, livraison, facturation, clôture et satisfaction client.

---

## Contexte

- Le parcours Prospect → Devis → Commande est validé (Phase 2.64).
- Ce document couvre uniquement le flux **Commande → Production → Livraison → Satisfaction**.

---

## Scénario 1 — Conversion devis en commande

### Résultats attendus
- [ ] Devis au statut `accepte` → bouton panier actif
- [ ] Commande créée avec statut `confirmee`, `paid_amount: 0`, `delivery_fee: 0`
- [ ] `quote_id` conservé sur la commande (lien facture/BL)
- [ ] `customer_id` lié correctement
- [ ] Référence format `CMD-YYYYMM-XXXX`
- [ ] Notification "Nouvelle commande" envoyée aux rôles `patron`, `admin`, `production`

**Résultat :** ✅ OK — `convertQuoteToOrderAction` vérifie le statut et l'unicité.

---

## Scénario 2 — Paiement / acompte

### Résultats attendus
- [ ] Saisir un acompte → statut auto-dérivé `acompte`
- [ ] `clientTotal = order.total + deliveryFee` affiché dans le récapitulatif
- [ ] Solde restant = `clientTotal - paidAmount`
- [ ] Paiement complet → statut `paye`, solde = 0
- [ ] Notification "Acompte reçu" : montant + solde restant
- [ ] Notification "Paiement complet" : `clientTotal` (produits + frais livraison) ← **bug corrigé**
- [ ] Message WhatsApp paiement : frais inclus si > 0

**Bug corrigé (Phase 2.65) :**
- `lib/actions/orders.ts` ligne 172 : notification "Paiement complet" affichait `order.total` au lieu de `order.total + deliveryFee`.

**Résultat :** ✅ Corrigé.

---

## Scénario 3 — Fichiers client

### Résultats attendus
- [ ] Ajout fichier (logo, maquette, BAT) via `OrderFilesSection`
- [ ] Téléchargement sécurisé via Supabase Storage
- [ ] Infographiste et production peuvent accéder selon permissions (`commande:upload_file`)
- [ ] Notification "fichier ajouté" si configurée

**Résultat :** ✅ OK — `getOrderFilesAction` chargé au montage de `CommandeEditForm`.

---

## Scénario 4 — BAT

### Résultats attendus
- [ ] BAT créé → statut commande passe à `bat_en_cours`
- [ ] Notification `bat_en_cours` → rôles `patron`, `admin`, `infographiste`
- [ ] BAT validé → statut commande passe à `bat_valide`
- [ ] Notification `bat_valide` → mêmes rôles
- [ ] `BatWorkflowSection` visible uniquement si `canPerform(role, "commande:bat")`

**Résultat :** ✅ OK — workflow géré dans `BatWorkflowSection`.

---

## Scénario 5 — Production / planning

### Résultats attendus
- [ ] Passer statut à `en_production` → commande visible dans `/admin/planning`
- [ ] Badge retard si `estimatedDelivery` dépassée
- [ ] Rôle `production` peut modifier le statut vers `controle_qualite`
- [ ] Notification `en_production` si présente dans `statusNotifs` (non présente — comportement normal)

**Résultat :** ✅ OK. Note : pas de notification spécifique `en_production` configurée, car ce changement est interne production.

---

## Scénario 6 — Contrôle qualité

### Résultats attendus
- [ ] Ouvrir `QualityCheckModal` → checklist 8 points
- [ ] Passer statut QC `non_verifie` → `en_cours` → `valide`
- [ ] Notification `qc_demarre` / `qc_valide` / `qc_correction`
- [ ] Statut commande recommandé : `controle_qualite` avant `pret`
- [ ] `QCBadge` visible dans la liste commandes si QC existant

**Résultat :** ✅ OK — `upsertQualityCheck` avec notifications ciblées.

---

## Scénario 7 — Livraison

### Résultats attendus
- [ ] `DeliveryModal` : mode (Dakar, Région, Coursier, Autre), adresse, livreur, frais, dates
- [ ] Statuts : `non_planifiee` → `planifiee` → `en_cours` → `livree` (ou `echec` / `reportee`)
- [ ] Message WhatsApp par statut : mode + adresse + frais (sauf échec/reporté)
- [ ] Frais livraison visibles dans le bloc d'avertissement amber si > 0
- [ ] Bon de livraison PDF généré depuis `/api/admin/commandes/[id]/bon-livraison`
- [ ] Frais livraison affichés dans le méta du BL si > 0

**Résultat :** ✅ OK.

---

## Scénario 8 — Documents PDF

### 8.1 Facture PDF

**Résultats attendus :**
- [ ] Lignes produits depuis `quote.items` (toutes les lignes, pas seulement la première)
- [ ] Frais livraison affichés si > 0
- [ ] `clientTotal = order.total + deliveryFee` correct
- [ ] Solde restant = `clientTotal - paidAmount`
- [ ] Statut facture : `payee` si `paidAmount >= clientTotal` ← **bug corrigé**
- [ ] Référence facture format `FAC-YYYYMM-XXXX`

**Bug corrigé (Phase 2.65) :**
- Route `facture/route.ts` : calcul du statut `invoiceStatus` comparait `paidAmount >= order.total` sans frais livraison. Corrigé avec `clientTotal = order.total + deliveryFee`.
- `invoice.total` créé avec `clientTotal` (cohérent avec `syncInvoicePayment`).

**Résultat :** ✅ Corrigé.

### 8.2 Bon de livraison PDF

**Résultats attendus :**
- [ ] Articles depuis `quote.items`
- [ ] Adresse de livraison correcte
- [ ] Frais livraison dans le méta si > 0
- [ ] Zones signatures livreur + client

**Résultat :** ✅ OK — `BonLivraisonPDF` utilise `quote.items`.

### 8.3 Reçu PDF

- [ ] Référence commande + montant payé + mode paiement

**Résultat :** À vérifier manuellement (route `receipt/route.ts`).

---

## Scénario 9 — Clôture et satisfaction

### Résultats attendus
- [ ] Statuts clôture : `non_cloturee` → `satisfait` / `cloturee` / `reclamation`
- [ ] Satisfaction : `satisfait` / `neutre` / `insatisfait`
- [ ] Commentaire client conservé
- [ ] Réclamation : champ détail + action corrective
- [ ] Messages WhatsApp : remerciement / demande d'avis Google / accusé réclamation
- [ ] Notification `commande_cloturee` / `client_insatisfait` / `reclamation_creee`
- [ ] Tâche fidélisation J+30 créée si `satisfaction === "satisfait"` → `createLoyaltyTask`
- [ ] Tâche satisfaction J+1 créée quand commande passe à `livre` → `createSatisfactionTask`

**Résultat :** ✅ OK — `saveClosureAction` + `createLoyaltyTask` bien câblés.

---

## Scénario 10 — CRM client

### Résultats attendus
- [ ] Fiche client → historique commandes
- [ ] Paiements + solde restant visibles
- [ ] Satisfaction / réclamation enregistrées
- [ ] `getOrdersEnrichedByCustomer` retourne toutes les commandes du client

**Résultat :** ✅ OK.

---

## Scénario 11 — Rapports / impayés

### Résultats attendus
- [ ] `/admin/impayes` liste les commandes avec `balance > 0`
- [ ] `/admin/rapports` : total encaissé, solde restant, chiffre d'affaires
- [ ] Commandes livrées apparaissent dans les indicateurs corrects

**Résultat :** ✅ À vérifier manuellement en production.

---

## Scénario 12 — Notifications

| Événement | Rôles ciblés | Statut |
|---|---|---|
| `commande_creee` | patron, admin, production | ✅ |
| `paiement_mis_a_jour` (acompte) | patron, admin, commercial | ✅ |
| `paiement_mis_a_jour` (complet) | patron, admin, commercial | ✅ corrigé |
| `solde_restant` | patron, admin, commercial | ✅ |
| `bat_en_cours` | patron, admin, infographiste | ✅ |
| `bat_valide` | patron, admin, infographiste | ✅ |
| `commande_prete` | tous (via `EVENT_TARGET_ROLES`) | ✅ |
| `en_livraison` | tous | ✅ |
| `qc_demarre` / `qc_valide` / `qc_correction` | patron, admin, production | ✅ |
| `commande_cloturee` | tous | ✅ |
| `client_insatisfait` | tous | ✅ |
| `reclamation_creee` | tous | ✅ |

---

## Scénario 13 — Permissions

| Rôle | Droit testé | Attendu |
|---|---|---|
| `patron` | Tout | ✅ Accès complet |
| `admin` | `commande:edit_status`, `commande:edit_payment` | ✅ |
| `commercial` | `commande:edit_payment`, suivi client | ✅ |
| `production` | `commande:edit_status`, BAT, QC, livraison | ✅ |
| `infographiste` | `commande:upload_file`, `commande:bat` | ✅ |
| Accès direct sans auth | | ✅ Bloqué (middleware) |

---

## Bugs corrigés en Phase 2.65

| Fichier | Bug | Correction |
|---|---|---|
| `lib/actions/orders.ts` | Notification "Paiement complet" affichait `order.total` sans frais livraison | Remplacé par `clientTotal = order.total + deliveryFee` |
| `app/api/admin/commandes/[id]/facture/route.ts` | `invoiceStatus` calculé sans frais livraison (`paidAmount >= order.total`) | Remplacé par `paidAmount >= clientTotal` |
| `app/api/admin/commandes/[id]/facture/route.ts` | `invoice.total` créé avec `order.total` au lieu de `clientTotal` | Corrigé pour utiliser `clientTotal` |

---

## Points de contrôle transversaux

| Point | Attendu |
|---|---|
| `clientTotal = order.total + deliveryFee` | Cohérent dans CommandeEditForm, notifications, facture route |
| Frais livraison dans PDF facture | Ligne séparée si > 0 |
| Tâche satisfaction | Créée automatiquement quand statut → `livre` |
| Tâche fidélisation J+30 | Créée si `satisfaction === "satisfait"` à la clôture |
| PDF facture lignes produit | Depuis `quote.items` (toutes les lignes) |
| Statut facture `payee` | Quand `paidAmount >= order.total + deliveryFee` |
