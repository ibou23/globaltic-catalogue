# Recette — Parcours Prospect → Devis → Commande

> Version : Phase 2.64 — Mai 2026

## Objectif

Valider de bout en bout le flux commercial principal : un prospect entre via le formulaire `/demande` ou WhatsApp, un devis est créé, le client accepte, le devis est converti en commande.

---

## Prérequis

- Compte admin actif (rôle `admin` ou `patron`)
- Accès à `/admin/prospects`, `/admin/devis`, `/admin/commandes`
- Catalogue produits chargé (au moins Flyers A5)

---

## Scénario 1 — Prospect depuis le formulaire `/demande`

### 1.1 Soumission du formulaire
- [ ] Accéder à `/demande`
- [ ] Remplir nom, WhatsApp, produit(s), quantités
- [ ] Vérifier l'indice de quantité minimale (amber si < min, gris sinon) — **non bloquant**
- [ ] Soumettre → message de confirmation affiché
- [ ] Vérifier la création du prospect dans `/admin/prospects`

### 1.2 Prospect visible dans l'inbox
- [ ] Prospect apparaît dans la liste avec statut `nouveau`
- [ ] Champs conservés : nom, WhatsApp, produits, quantité, format, finitions, couleurs, message
- [ ] Ouvrir la fiche prospect → tous les champs sont affichés

---

## Scénario 2 — Création d'un devis depuis un prospect

### 2.1 Via le formulaire DevisProspectForm
- [ ] Ouvrir la fiche prospect → bouton "Créer un devis"
- [ ] Formulaire pré-rempli avec les données du prospect (produit, quantités, format, finitions, couleurs, texte)
- [ ] Modifier la quantité sous le minimum → **erreur bloquante** affichée
- [ ] Saisir une quantité valide → devis créé
- [ ] Prospect passe au statut `devis_envoye`
- [ ] Client créé automatiquement si inexistant
- [ ] Devis visible dans `/admin/devis`

### 2.2 Multi-lignes (extra_lines)
- [ ] Ajouter une deuxième ligne produit
- [ ] Vérifier les quantités minimales sur chaque ligne
- [ ] Devis créé avec `itemsCount = 2`
- [ ] Badge `+1` visible dans la liste des devis (mobile et desktop)

---

## Scénario 3 — Création d'un devis depuis un client existant

- [ ] Aller dans `/admin/devis` → "Créer un devis"
- [ ] Saisir un numéro WhatsApp existant → client retrouvé automatiquement
- [ ] Saisir un produit du catalogue → prix auto-calculé (badge vert)
- [ ] Modifier la quantité → prix recalculé si source `auto`
- [ ] Quantité < minimum → **erreur bloquante**
- [ ] Devis créé → visible dans la liste

---

## Scénario 4 — Modification d'un devis

- [ ] Ouvrir la modale d'édition (icône crayon)
- [ ] Modifier le produit → prix recalculé si `priceSource === "auto"`
- [ ] Modifier la quantité → vérification min
- [ ] Modifier le statut → enregistré
- [ ] Enregistrer → `router.refresh()` + modale fermée
- [ ] Vérifier les données mises à jour dans la liste

---

## Scénario 5 — PDF du devis

- [ ] Cliquer "Télécharger PDF" sur un devis
- [ ] PDF généré et téléchargé
- [ ] En-tête : logo + coordonnées entreprise
- [ ] Tableau produits : toutes les lignes présentes
- [ ] Champs configSnapshot affichés : `options`, `format`, `finition`, `couleurs`, `sizes`, `markingPosition`, `dimensions`, `delai`
- [ ] Totaux corrects : sous-total, remise (si > 0), total
- [ ] Notes client affichées (si renseignées)
- [ ] Conditions générales et validité

---

## Scénario 6 — Envoi WhatsApp

- [ ] Cliquer l'icône WhatsApp sur un devis
- [ ] Lien `wa.me` ouvert avec le bon numéro
- [ ] Message pré-rempli contient la référence et le total
- [ ] **Devis mono-ligne** : produit + quantité + prix unitaire
- [ ] **Devis multi-lignes** : "Produit principal" + note "_+ N autres lignes — voir le devis PDF_"

---

## Scénario 7 — Changement de statut

- [ ] `brouillon` → `envoye` : tâches de relance créées automatiquement (si `createQuoteFollowUpTasks`)
- [ ] `envoye` → `accepte` : notification admin "Devis accepté — à convertir en commande"
- [ ] Statut visible dans la liste (badge couleur)

---

## Scénario 8 — Conversion en commande

- [ ] Devis au statut `accepte` → bouton panier visible
- [ ] Cliquer → commande créée, `router.refresh()`
- [ ] Commande visible dans `/admin/commandes` avec le bon total
- [ ] Lien devis → commande présent sur la fiche commande

---

## Scénario 9 — Validation des permissions

- [ ] Rôle `commercial` : peut créer et modifier des devis (`devis:create`, `devis:edit`)
- [ ] Rôle `production` : ne peut **pas** créer de devis → erreur `Accès refusé`
- [ ] Rôle `patron` : peut supprimer un devis (bouton rouge visible)
- [ ] Rôle `admin` : ne voit **pas** le bouton supprimer

---

## Points de contrôle transversaux

| Point | Attendu |
|---|---|
| Client auto-créé depuis prospect | `convertedCustomerId` mis à jour sur le prospect |
| Quantité minimale catalogue | Bloquant côté serveur (`createQuoteFromProspectAction`, `createQuoteFromClientAction`) ET côté client |
| `itemsCount` dans QuoteEnriched | Toujours ≥ 1 pour un devis avec au moins une ligne |
| configSnapshot PDF | Tous les champs stockés dans `configSnapshot` apparaissent dans le PDF |
| WhatsApp multi-lignes | Mention "+N autres lignes" si `itemsCount > 1` |
| Références | Format `DEV-YYYYMM-XXXX` généré par `generateReference("DEV")` |

---

## Bugs corrigés en Phase 2.64

1. **PDF configSnapshot incomplet** — `DevisPDF.tsx` n'extrayait que `options` et `delai`. Corrigé pour inclure `format`, `finition`, `couleurs`, `sizes`, `markingPosition`, `dimensions`.
2. **Badge multi-lignes absent** — `DevisClient.tsx` n'affichait aucun indicateur quand `itemsCount > 1`. Corrigé avec badge `+N` en vue mobile et desktop.
3. **WhatsApp message mono-ligne seulement** — `buildWhatsAppReply` ignorait les devis multi-lignes. Corrigé avec mention des lignes supplémentaires.
4. **`itemsCount` absent de `QuoteEnriched`** — Type et requêtes DB mis à jour pour exposer le compte total des lignes.
