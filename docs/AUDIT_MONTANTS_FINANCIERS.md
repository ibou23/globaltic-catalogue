# Audit — Montants financiers

> Version : Phase 2.66 — Mai 2026

## Règle officielle de calcul

```
order.total       = total produits (hors frais livraison)
order.deliveryFee = frais de livraison facturables au client
clientTotal       = order.total + (order.deliveryFee ?? 0)
paidAmount        = montant encaissé
remainingBalance  = max(0, clientTotal - paidAmount)
paymentStatus     = "non_paye" | "acompte" | "paye" | "rembourse"
invoice.total     = clientTotal au moment de l'émission de la facture
```

**Helper central :** `lib/utils/money.ts`
- `getClientTotal(order)` — total réellement dû
- `getRemainingBalance(order)` — solde restant
- `derivePaymentStatus(paidAmount, clientTotal)` — statut paiement dérivé

---

## Cas de test financiers

### Cas A — Sans livraison
| Champ | Valeur |
|---|---|
| total produits | 25 000 FCFA |
| frais livraison | 0 FCFA |
| payé | 10 000 FCFA |
| **clientTotal** | **25 000 FCFA** |
| **solde** | **15 000 FCFA** |
| paymentStatus | acompte |

### Cas B — Avec livraison
| Champ | Valeur |
|---|---|
| total produits | 25 000 FCFA |
| frais livraison | 2 000 FCFA |
| payé | 10 000 FCFA |
| **clientTotal** | **27 000 FCFA** |
| **solde** | **17 000 FCFA** |
| paymentStatus | acompte |

### Cas C — Paiement complet avec livraison
| Champ | Valeur |
|---|---|
| total produits | 25 000 FCFA |
| frais livraison | 2 000 FCFA |
| payé | 27 000 FCFA |
| **clientTotal** | **27 000 FCFA** |
| **solde** | **0 FCFA** |
| paymentStatus | **paye** |
| invoice.status | **payée** |

---

## Fichiers audités

| Fichier | Résultat avant correction |
|---|---|
| `lib/actions/orders.ts` | ✅ Cohérent (corrigé en Phase 2.65) |
| `lib/db/orders.ts` | ✅ OK — mappage simple, pas de calcul |
| `lib/db/invoices.ts` (syncInvoicePayment) | ✅ Reçoit `clientTotal` depuis `orders.ts` |
| `components/admin/CommandeEditForm.tsx` | ✅ `clientTotal = total + deliveryFee` correct |
| `components/admin/QuickPaymentModal.tsx` | ✅ `clientTotal = total + deliveryFee` correct |
| `components/pdf/PaymentReceiptPDF.tsx` | ✅ `clientTotal = total + deliveryFee` correct |
| `components/admin/CommandesClient.tsx` | ⚠️ Message WA utilisait `order.total` sans frais |
| `app/(admin)/admin/page.tsx` | ✅ Affichage `total + deliveryFee` correct |
| `app/(admin)/admin/commandes/page.tsx` | ✅ Filtres paiement corrects |
| `components/admin/ClientDetailClient.tsx` | ✅ `clientTotal = total + deliveryFee` correct |
| `components/admin/FacturesClient.tsx` | ✅ Utilise `invoice.total` (déjà = clientTotal depuis Phase 2.65) |
| `app/api/admin/commandes/[id]/facture/route.ts` | ✅ Corrigé en Phase 2.65 |
| `components/pdf/FacturePDF.tsx` | ✅ `clientTotal = total + deliveryFee` correct |
| `components/pdf/BonLivraisonPDF.tsx` | ✅ Pas de total financier, frais en méta uniquement |
| **`lib/db/stats.ts`** | ❌ `caCommandes` = SUM(total) sans deliveryFee |
| **`lib/db/reports.ts`** | ❌ `ordersCA` = SUM(total) sans deliveryFee ; `topClients.totalCA` idem |
| **`lib/db/impayes.ts`** | ❌ Balance "order_only" = total - paidAmount sans deliveryFee |

---

## Incohérences trouvées

### 1. `lib/db/stats.ts` — Dashboard CA et solde restant
**Avant :** `caCommandes = SUM(order.total)` — frais livraison exclus  
**Impact :** Les KPI "CA commandes" et "Solde restant" du dashboard sous-estimaient les montants  
**Correction :** `caCommandes = SUM(order.total + order.delivery_fee)`

### 2. `lib/db/reports.ts` — CA commandes et top clients
**Avant :**
- `ordersCA = SUM(order.total)` — frais exclus
- `topClients[*].totalCA = SUM(order.total)` — frais exclus
- `ordersSolde = SUM(total + deliveryFee - paidAmount)` — frais inclus (cohérent côté solde, incohérent côté CA)

**Impact :** Dans le rapport, le CA était sous-estimé mais le solde correct → taux d'encaissement faussé  
**Correction :** `ordersCA = SUM(total + deliveryFee)` ; `totalCA += total + deliveryFee` pour top clients

### 3. `lib/db/impayes.ts` — Solde commandes livrées sans facture
**Avant :** `balance = total - paidAmount` — frais livraison exclus  
**Impact :** Les commandes livrées avec frais de livraison non payés n'apparaissaient pas ou affichaient un solde incorrect  
**Correction :** `balance = total + deliveryFee - paidAmount` ; `delivery_fee` ajouté à la requête SQL

### 4. `components/admin/CommandesClient.tsx` — Message WhatsApp statut commande
**Avant :** `Montant total : ${order.total}` — frais exclus  
**Impact :** Le client recevait un montant total différent de celui affiché dans l'interface  
**Correction :** `clientTotal = order.total + (order.deliveryFee ?? 0)`

---

## Corrections appliquées (Phase 2.66)

| Fichier | Ligne(s) | Correction |
|---|---|---|
| `lib/db/stats.ts` | 109, 127 | Requête SQL + calcul incluent `delivery_fee` |
| `lib/db/reports.ts` | 59, 88-97 | `ordersCA` et `topClients.totalCA` incluent `deliveryFee` |
| `lib/db/impayes.ts` | 84, 93-96, 116, 137-138, 154 | Balance et stats `order_only` incluent `delivery_fee` |
| `components/admin/CommandesClient.tsx` | 82 | `clientTotal = total + deliveryFee` dans message WA |
| `lib/utils/money.ts` | — | Nouveau helper central : `getClientTotal`, `getRemainingBalance`, `derivePaymentStatus` |

---

## Tests effectués

| Emplacement | Cas A (sans livraison) | Cas B (avec livraison) | Cas C (paiement complet) |
|---|---|---|---|
| Liste commandes (balance) | ✅ | ✅ | ✅ |
| Fiche commande (récap financier) | ✅ | ✅ | ✅ |
| QuickPaymentModal | ✅ | ✅ | ✅ |
| Facture PDF | ✅ | ✅ | ✅ (statut payée) |
| Reçu PDF | ✅ | ✅ | ✅ |
| Impayés | ✅ (0 solde → absent) | ✅ | ✅ (0 solde → absent) |
| Rapport ordersCA | ✅ | ✅ | ✅ |
| Dashboard caCommandes | ✅ | ✅ | ✅ |
| Message WA statut | ✅ | ✅ | ✅ |

---

## Décision finale

Règle unifiée appliquée partout : **`clientTotal = order.total + (order.deliveryFee ?? 0)`**

Ce calcul est maintenant cohérent dans :
- Les KPI dashboard (CA, solde, encaissé)
- Les rapports (CA commandes, top clients, solde, impayés)
- Les impayés (balance commandes livrées sans facture)
- Les notifications et messages WhatsApp
- Les PDF (facture, reçu, bon de livraison)
- Les modales de paiement et d'édition

Le helper `lib/utils/money.ts` fournit les fonctions de calcul centralisées pour les futurs développements.
