# Recette finale — Dossier client complet

> Version : Phase 2.67 — Mai 2026  
> Objectif : Valider le parcours end-to-end d'un dossier client réel, de la demande initiale jusqu'à la clôture et la fidélisation.

---

## Dossier test

| Champ | Valeur |
|---|---|
| Client | GLOBAL TIC Sénégal SA |
| Contact | Mamadou Diallo |
| WhatsApp | +221771234567 |
| Commande | 500 t-shirts impression + 200 cartes de visite |
| Livraison | Domicile (2 000 FCFA) |
| Acompte | 30 000 FCFA versé à la confirmation |

---

## Section 1 — Formulaire de demande public `/demande`

| Test | Résultat |
|---|---|
| Formulaire accessible sans authentification | ✅ OK |
| Champs requis validés (nom, WhatsApp, produit, quantité) | ✅ OK |
| Soumission crée un prospect `status = nouveau` | ✅ OK |
| Notification admin envoyée à la création | ✅ OK |
| Doublon WhatsApp bloqué (prospect ou client existant) | ✅ OK |

---

## Section 2 — Tableau des briefs (Prospects)

| Test | Résultat |
|---|---|
| Prospect visible dans `/admin/prospects` | ✅ OK |
| Badge "non traité depuis X min" affiché si > 2h | ✅ OK — `getUntreatedProspectsAlert()` fonctionne |
| Filtres par statut (nouveau / en_cours / converti / perdu) | ✅ OK |
| Assignation à un commercial enregistrée | ✅ OK |
| Clic "Créer un devis" pré-remplit la fiche devis | ✅ OK |

---

## Section 3 — Création du devis

| Test | Résultat |
|---|---|
| Devis créé avec référence auto (DEV-XXXX) | ✅ OK |
| Lignes multiples (t-shirts + cartes) ajoutées | ✅ OK |
| `configSnapshot` capture options, format, finition, couleurs, délai | ✅ OK |
| `itemsCount` correct dans `QuoteEnriched` | ✅ OK — corrigé Phase 2.64 |
| Total devis calculé côté client | ✅ OK |
| Badge `+N ligne(s)` affiché si > 1 produit | ✅ OK — corrigé Phase 2.64 |

---

## Section 4 — PDF devis

| Test | Résultat |
|---|---|
| PDF généré avec toutes les lignes | ✅ OK |
| `optionLine` affiche options + format + finition + couleurs + délai | ✅ OK — corrigé Phase 2.64 |
| Totaux cohérents avec l'interface | ✅ OK |
| En-tête société et coordonnées présentes | ✅ OK |

---

## Section 5 — Message WhatsApp devis

| Test | Résultat |
|---|---|
| Message mono-ligne : prix unitaire affiché | ✅ OK |
| Message multi-lignes : produit principal + mention "N autres lignes" | ✅ OK — corrigé Phase 2.64 |
| Lien PDF inclus dans le message | ✅ OK |
| Tâches de relance J+1 / J+3 / J+7 créées automatiquement | ✅ OK |
| Priorité `urgente` si devis urgents | ✅ OK — corrigé Phase 2.67 |
| `assigned_to` null si aucun assigné (pas de FK vide) | ✅ OK — corrigé Phase 2.67 |

---

## Section 6 — Conversion devis → commande

| Test | Résultat |
|---|---|
| Bouton "Convertir en commande" visible si devis `accepte` | ✅ OK |
| Commande créée avec référence auto (CMD-XXXX) | ✅ OK |
| Statut devis passé à `accepte`, commande à `confirmee` | ✅ OK |
| Prospect lié passé à `converti` | ✅ OK |
| Historique activité enregistré | ✅ OK |

---

## Section 7 — Paiements et reçus

| Test | Résultat |
|---|---|
| `clientTotal = order.total + deliveryFee` dans QuickPaymentModal | ✅ OK |
| Acompte 30 000 FCFA enregistré → statut `acompte` | ✅ OK |
| Solde restant = clientTotal - paidAmount | ✅ OK |
| Reçu PDF généré avec montant correct | ✅ OK |
| Paiement complet → statut `paye` | ✅ OK |
| Notification "Paiement complet" avec clientTotal (+ livraison) | ✅ OK — corrigé Phase 2.65 |

---

## Section 8 — Fichiers et BAT

| Test | Résultat |
|---|---|
| Upload fichier client (upload vers Supabase Storage) | ✅ OK |
| Statut passe à `bat_en_cours` après upload | ✅ OK |
| Validation BAT par le client → `bat_valide` | ✅ OK |
| Refus BAT avec commentaire → retour `bat_en_cours` | ✅ OK |

---

## Section 9 — Production et planning

| Test | Résultat |
|---|---|
| Commande apparaît dans `/admin/planning` | ✅ OK |
| Statut `en_production` mis à jour par le commercial | ✅ OK |
| Statut `controle_qualite` disponible | ✅ OK |
| Notification envoyée au changement de statut | ✅ OK |

---

## Section 10 — Livraison

| Test | Résultat |
|---|---|
| Statut `pret` → `en_livraison` → `livre` | ✅ OK |
| Frais de livraison (2 000 FCFA) inclus dans clientTotal | ✅ OK |
| Message WhatsApp statut commande avec clientTotal correct | ✅ OK — corrigé Phase 2.66 |
| Tâche satisfaction J+1 créée à la livraison | ✅ OK |
| Tâche fidélisation J+30 créée si client connu | ✅ OK |
| `assigned_to` null si vide (pas de FK vide) | ✅ OK — corrigé Phase 2.67 |

---

## Section 11 — Documents PDF (livraison)

| Test | Résultat |
|---|---|
| Bon de livraison PDF généré | ✅ OK |
| Facture PDF générée avec `invoice.total = clientTotal` | ✅ OK — corrigé Phase 2.65 |
| Statut facture `payee` si paidAmount >= clientTotal | ✅ OK — corrigé Phase 2.65 |
| Statut facture `partiellement_payee` si acompte | ✅ OK |

---

## Section 12 — Clôture et satisfaction

| Test | Résultat |
|---|---|
| Tâche "Vérifier satisfaction" visible dans `/admin/taches` | ✅ OK |
| Tâche complétée manuellement par le commercial | ✅ OK |
| Commande livrée n'apparaît plus dans les impayés si soldée | ✅ OK — corrigé Phase 2.66 |

---

## Section 13 — CRM client

| Test | Résultat |
|---|---|
| Fiche client affiche historique devis et commandes | ✅ OK |
| `clientTotal = total + deliveryFee` dans la fiche | ✅ OK |
| Tâche fidélisation J+30 visible dans les tâches du client | ✅ OK |
| Statistiques client (CA total, nombre commandes) correctes | ✅ OK — corrigé Phase 2.66 |

---

## Section 14 — Dashboard et pilotage

| Test | Résultat |
|---|---|
| `caCommandes = SUM(total + deliveryFee)` hors annulées | ✅ OK — corrigé Phase 2.66 |
| `montantEncaisse = SUM(paidAmount)` | ✅ OK |
| `soldeRestant = caCommandes - montantEncaisse` | ✅ OK |
| Commandes urgentes affichées en bas du dashboard | ✅ OK |
| Activité récente enregistrée | ✅ OK |

---

## Section 15 — Rapports

| Test | Résultat |
|---|---|
| `ordersCA = SUM(total + deliveryFee)` hors annulées | ✅ OK — corrigé Phase 2.66 |
| `topClients.totalCA` inclut deliveryFee | ✅ OK — corrigé Phase 2.66 |
| Solde impayés commandes livrées = total + deliveryFee - paidAmount | ✅ OK — corrigé Phase 2.66 |
| Rapport PDF exportable | ✅ OK |

---

## Section 16 — Permissions

| Test | Résultat |
|---|---|
| Commercial ne voit que ses commandes assignées (si RLS actif) | ✅ OK |
| Admin voit tout | ✅ OK |
| API routes protégées (session Supabase requise) | ✅ OK |
| Formulaire `/demande` accessible sans auth | ✅ OK |

---

## Section 17 — Notifications

| Test | Résultat |
|---|---|
| Nouveau prospect → notification admin | ✅ OK |
| Devis créé → notification | ✅ OK |
| Commande confirmée → notification | ✅ OK |
| Paiement reçu → notification avec montant correct | ✅ OK — corrigé Phase 2.65 |
| Statut production changé → notification | ✅ OK |
| Commande livrée → notification | ✅ OK |

---

## Bugs bloquants corrigés (Phase 2.67)

| # | Fichier | Bug | Correction |
|---|---|---|---|
| 1 | `lib/services/auto-tasks.ts` | Priorité devis urgent = `"haute"` au lieu de `"urgente"` | `isUrgent ? "urgente" : "normale"` |
| 2 | `lib/services/auto-tasks.ts` | `assigned_to: ""` → violation FK si pas d'assigné | Guard `assignee = assignedTo \|\| null` dans les 3 fonctions |

---

## Résultat final

| Critère | Statut |
|---|---|
| TypeScript `--noEmit` | ✅ 0 erreur |
| `next build` | ✅ Succès |
| Parcours complet dossier client | ✅ Validé |
| Cohérence financière (`clientTotal`) | ✅ Validé (Phase 2.66) |
| Tâches automatiques | ✅ Validé (Phase 2.67) |

**Décision : PRÊT pour la mise en production.**

---

## Rappel des phases

| Phase | Contenu | Statut |
|---|---|---|
| 2.64 | Prospect → Devis → Commande (itemsCount, badges, PDF configSnapshot) | ✅ |
| 2.65 | Commande → Production → Livraison → Satisfaction (paiements, factures) | ✅ |
| 2.66 | Audit montants financiers (deliveryFee partout, helper money.ts) | ✅ |
| 2.67 | Recette finale dossier client complet | ✅ |
