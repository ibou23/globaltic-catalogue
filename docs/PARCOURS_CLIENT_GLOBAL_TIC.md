# Parcours client GLOBAL TIC PrintTech

Guide operationnel de prise en charge client, du premier contact a la fidelisation.

---

## Vue d'ensemble

```
Prospect recu
  -> Qualification
    -> Devis a creer
      -> Devis envoye
        -> Relance devis (J+1, J+3, J+7)
          -> Devis accepte
            -> Commande creee
              -> Acompte recu
                -> BAT
                  -> Production
                    -> Controle qualite
                      -> Livraison
                        -> Cloture
                          -> Satisfaction
                            -> Fidelisation
```

---

## Etapes detaillees

### 1. Prospect recu

| Element | Detail |
|---------|--------|
| Statut dashboard | Prospect `nouveau` |
| Sources | WhatsApp, formulaire `/demande`, telephone, terrain |
| Responsable | Commercial |
| Action | Repondre et qualifier |
| Delai | WhatsApp < 15 min, formulaire < meme journee |
| Erreur a eviter | Laisser un prospect sans reponse plus de 2h |

Le prospect arrive dans l'onglet Prospects. La priorite est definie automatiquement a `a_qualifier`.

---

### 2. Qualification

| Element | Detail |
|---------|--------|
| Statut dashboard | Prospect `nouveau` -> priorite mise a jour |
| Responsable | Commercial |
| Action | Collecter les informations obligatoires |
| Delai | Meme echange ou sous 24h |
| Erreur a eviter | Creer un devis sans toutes les informations |

**Informations obligatoires avant devis :**

- Nom du client
- Entreprise (si professionnel)
- Numero WhatsApp
- Produit souhaite (type exact)
- Quantite
- Format / Dimensions
- Delai souhaite
- Budget approximatif
- Mode de livraison (retrait ou livraison)
- Fichier source disponible ou non
- Besoin precis (recto/verso, couleurs, finitions)

**Priorites prospect :**

| Priorite | Signification | Action |
|----------|--------------|--------|
| `urgent` | Commande confirmee ou delai tres court | Traiter immediatement |
| `chaud` | Client interesse, budget identifie | Devis sous 2h |
| `a_qualifier` | Demande recue mais incomplete | Qualifier sous 24h |
| `froid` | Client indecis, sans urgence | Relancer a J+7 |
| `perdu` | Refus confirme ou silence prolonge | Archiver |

---

### 3. Devis a creer

| Element | Detail |
|---------|--------|
| Statut dashboard | Devis `brouillon` |
| Responsable | Commercial |
| Action | Creer le devis dans le dashboard |
| Delai | Devis simple < 2h, devis complexe < 24h |
| Erreur a eviter | Tarif errone, oubli de finitions, pas de validite |

**Regles :**
- Toujours indiquer la validite du devis (champ `valid_until`)
- Verifier les prix au catalogue
- Ajouter les finitions et options
- Inclure les frais de livraison si applicable
- Remplir les notes internes si besoin

---

### 4. Devis envoye

| Element | Detail |
|---------|--------|
| Statut dashboard | Devis `envoye`, Prospect `devis_envoye` |
| Responsable | Commercial |
| Action | Envoyer le PDF au client via WhatsApp |
| Delai | Immediat apres creation |
| Erreur a eviter | Envoyer sans relire, oublier de changer le statut |

**Checklist envoi :**
1. Generer le PDF du devis
2. Relire montants et details
3. Envoyer via WhatsApp avec message d'accompagnement
4. Passer le statut devis a `envoye`
5. Passer le statut prospect a `devis_envoye`
6. Creer une tache de relance J+1

---

### 5. Relance devis

| Element | Detail |
|---------|--------|
| Statut dashboard | Tache `relancer_devis` |
| Responsable | Commercial |
| Action | Relancer le client si pas de reponse |
| Calendrier | J+1, J+3, J+7 |
| Erreur a eviter | Ne pas relancer du tout, ou harasser le client |

**Planning de relance :**

| Jour | Action | Ton |
|------|--------|-----|
| J+1 | Rappel amical | "Avez-vous pu consulter le devis ?" |
| J+3 | Relance commerciale | "Je reste disponible pour toute question" |
| J+7 | Derniere relance | "Le devis expire bientot, souhaitez-vous qu'on ajuste ?" |
| J+15 | Classer froid | Passer le prospect en priorite `froid` |

---

### 6. Devis accepte

| Element | Detail |
|---------|--------|
| Statut dashboard | Devis `accepte`, Prospect `commande_confirmee` |
| Responsable | Commercial |
| Action | Confirmer et convertir en commande |
| Delai | Immediat |
| Erreur a eviter | Ne pas convertir rapidement, perdre le bon de commande |

**Actions :**
1. Passer le devis a `accepte`
2. Convertir le prospect en client (si pas encore fait)
3. Convertir le devis en commande
4. Demander l'acompte

---

### 7. Commande creee

| Element | Detail |
|---------|--------|
| Statut dashboard | Commande `en_attente` |
| Responsable | Commercial |
| Action | Confirmer la commande et collecter l'acompte |
| Delai | < 24h |
| Erreur a eviter | Lancer la production sans acompte |

---

### 8. Acompte recu

| Element | Detail |
|---------|--------|
| Statut dashboard | Commande `confirmee`, paiement `acompte` |
| Responsable | Commercial / Patron |
| Action | Enregistrer le paiement, confirmer au client |
| Delai | Immediat |
| Erreur a eviter | Ne pas enregistrer le paiement, oublier le recu |

**Modes de paiement acceptes :** Wave, Orange Money, especes, virement, cheque.

---

### 9. BAT (Bon a Tirer)

| Element | Detail |
|---------|--------|
| Statut dashboard | Commande `bat_en_cours` -> `bat_valide` |
| Responsable | Infographiste |
| Action | Preparer la maquette, envoyer au client, obtenir validation |
| Delai | 24h a 48h apres acompte |
| Erreur a eviter | Lancer production sans BAT valide |

**Processus :**
1. Infographiste prepare le fichier
2. Upload du BAT dans les fichiers commande
3. Envoi au client par WhatsApp
4. Attente de validation ou demande de corrections
5. Si corrections : nouveau cycle BAT
6. Si valide : passer statut `bat_valide`

---

### 10. Production

| Element | Detail |
|---------|--------|
| Statut dashboard | Commande `en_production` |
| Responsable | Production |
| Action | Produire selon le BAT valide |
| Delai | Selon type produit (communique au client) |
| Erreur a eviter | Produire un ancien BAT, erreur de quantite |

---

### 11. Controle qualite

| Element | Detail |
|---------|--------|
| Statut dashboard | Commande `controle_qualite` |
| Responsable | Production / Patron |
| Action | Verifier la conformite au BAT |
| Delai | < 2h apres fin production |
| Erreur a eviter | Livrer sans controle |

**Checklist qualite :**
- Couleurs conformes au BAT
- Texte lisible, pas de coquilles
- Dimensions correctes
- Finitions appliquees
- Quantite correcte
- Pas de defaut visible

---

### 12. Livraison

| Element | Detail |
|---------|--------|
| Statut dashboard | Commande `pret` -> `en_livraison` -> `livre` |
| Responsable | Commercial / Livreur |
| Action | Informer le client, livrer, confirmer reception |
| Delai | Client informe des que pret |
| Erreur a eviter | Ne pas prevenir le client, livrer au mauvais endroit |

**Modes de livraison :** retrait en boutique, livraison Dakar, livraison region, coursier.

**Etapes :**
1. Commande prete -> informer client immediatement
2. Planifier livraison (ou retrait)
3. Jour J : confirmer passage au client
4. Livrer et obtenir confirmation reception
5. Passer statut `livre`
6. Encaisser solde si acompte

---

### 13. Cloture

| Element | Detail |
|---------|--------|
| Statut dashboard | Cloture `cloturee` ou `satisfait` |
| Responsable | Commercial |
| Action | Fermer la commande, verifier paiement complet |
| Delai | < 24h apres livraison |
| Erreur a eviter | Oublier de cloturer, laisser un solde non regle |

**Avant cloture, verifier :**
- Paiement complet (statut `paye`)
- Client a confirme reception
- Aucune reclamation en cours

---

### 14. Satisfaction

| Element | Detail |
|---------|--------|
| Statut dashboard | Satisfaction `satisfait` / `neutre` / `insatisfait` |
| Responsable | Commercial |
| Action | Demander retour client, enregistrer |
| Delai | J+1 apres livraison |
| Erreur a eviter | Ne jamais demander la satisfaction |

**Actions selon retour :**

| Retour | Action |
|--------|--------|
| Satisfait | Remercier, demander avis Google, noter VIP potentiel |
| Neutre | Comprendre ce qui peut etre ameliore |
| Insatisfait | Ouvrir reclamation, traiter en priorite |

---

### 15. Fidelisation

| Element | Detail |
|---------|--------|
| Statut dashboard | Client avec `loyalty_tier` mis a jour |
| Responsable | Commercial / Patron |
| Action | Relancer les clients reguliers, proposer offres |
| Delai | J+30 apres derniere commande |
| Erreur a eviter | Oublier un bon client, ne jamais relancer |

**Tiers de fidelite :**

| Tier | Critere | Avantage |
|------|---------|----------|
| `nouveau` | Premiere commande | Accueil soigne, suivi rapproche |
| `regulier` | 3+ commandes | Priorite production, remise possible |
| `vip` | 10+ commandes ou gros volume | Tarifs prefentiels, delais prioritaires |
| `premium` | Compte entreprise majeur | Conditions speciales negociees |

---

## Gestion des reclamations

### Processus

1. **Reception** : Client signale un probleme (delai < meme journee pour accuse de reception)
2. **Enregistrement** : Ouvrir reclamation dans la cloture commande (`closure_status: reclamation`)
3. **Analyse** : Identifier la cause (production, fichier, livraison, malentendu)
4. **Action corrective** : Definir et executer la solution (reimprimer, rembourser partiellement, offrir un complement)
5. **Resolution** : Informer le client de la solution
6. **Cloture** : Obtenir confirmation de satisfaction, cloturer la reclamation

### Bonnes pratiques

- Ne jamais ignorer une reclamation
- Repondre dans la journee
- Assumer les erreurs sans accuser le client
- Proposer une solution concrete
- Documenter dans le champ `corrective_action`
- Verifier la satisfaction apres resolution

---

## Segmentation clients

### Types existants dans le systeme

| Type | Usage |
|------|-------|
| `particulier` | Client individuel |
| `entreprise` | Client professionnel avec raison sociale |
| `revendeur` | Client qui revend les produits |

### Classification complementaire (usage interne)

| Segment | Critere | Approche |
|---------|---------|----------|
| Client evenementiel | Commande pour un evenement precis | Suivi delai serre |
| Client a risque | Reclamation ou impaye en cours | Attention renforcee |
| Client inactif | Aucune commande depuis 60+ jours | Relance fidelisation |

---

## Delais de prise en charge (SLA internes)

| Situation | Delai maximum |
|-----------|---------------|
| Nouveau prospect WhatsApp | < 15 minutes |
| Prospect formulaire `/demande` | < meme journee |
| Devis simple | 2h a 24h |
| Devis complexe | Delai communique au client |
| Relance devis | J+1, J+3, J+7 |
| BAT premiere version | 24h a 48h apres acompte |
| Commande prete | Client informe immediatement |
| Livraison | Client prevenu avant passage |
| Accusation reception reclamation | < meme journee |
| Demande satisfaction | J+1 apres livraison |
| Relance fidelisation | J+30 apres derniere commande livree |

---

## Indicateurs de performance (KPIs)

### Deja disponibles dans le dashboard

- Prospects non traites (status `nouveau`)
- Devis en attente (status `envoye`)
- Commandes en cours (par statut)
- Soldes restants (paiement partiel)
- Reclamations ouvertes (`closure_status: reclamation`)
- Montants impayés (page /admin/impayes)

### A suivre manuellement ou en amelioration future

| KPI | Methode |
|-----|---------|
| Temps moyen de reponse prospect | Difference entre `created_at` et `contacted_at` |
| Taux de conversion devis | Devis acceptes / devis envoyes |
| Devis non relances | Devis `envoye` sans tache de relance |
| Commandes en retard | Commande `en_production` depuis > delai annonce |
| Commandes pretes non livrees | Statut `pret` depuis > 24h |
| Clients satisfaits | Satisfaction `satisfait` / total clotures |
| Clients inactifs | Derniere commande > 60 jours |

---

## Responsabilites par role

### Commercial

1. Repondre rapidement aux prospects
2. Qualifier completement avant devis
3. Creer et envoyer les devis
4. Relancer selon le calendrier J+1 / J+3 / J+7
5. Convertir en commande
6. Suivre le paiement (acompte et solde)
7. Informer le client a chaque etape
8. Demander la satisfaction apres livraison
9. Relancer les clients inactifs

### Production

1. Suivre les commandes confirmees
2. Gerer le planning de production
3. Respecter les delais annonces
4. Signaler tout retard immediatement
5. Effectuer le controle qualite
6. Preparer les commandes pour livraison

### Infographiste

1. Traiter les fichiers sources recus
2. Preparer les maquettes / BAT
3. Uploader les fichiers dans la commande
4. Envoyer le BAT au client (via commercial)
5. Gerer les corrections
6. Valider la conformite avant production

### Patron / Admin

1. Piloter la performance globale
2. Controler les delais de prise en charge
3. Gerer les litiges et reclamations
4. Analyser les rapports
5. Ajuster les permissions
6. Valider les cas complexes ou urgents

---

## Relances recommandees (taches a creer)

| Declencheur | Tache a creer | Type tache | Delai |
|-------------|--------------|------------|-------|
| Devis passe en `envoye` | Relancer client | `relancer_devis` | J+1 |
| Pas de reponse J+1 | Relancer devis J+3 | `relancer_devis` | J+3 |
| Pas de reponse J+3 | Derniere relance J+7 | `relancer_devis` | J+7 |
| Commande `livre` | Demander satisfaction | `appeler_client` | J+1 |
| Satisfaction recue positive | Demander avis Google | `appeler_client` | J+3 |
| Commande cloturee | Relance fidelisation | `appeler_client` | J+30 |
| Impaye detecte | Relancer paiement | `relancer_paiement` | J+1 |

**Important :** Ces relances sont semi-automatiques. Le systeme cree la tache, mais c'est le commercial qui decide d'envoyer le message apres lecture du contexte.

---

## Erreurs frequentes a eviter

1. Repondre a un prospect sans qualifier completement
2. Creer un devis sans toutes les specs (allers-retours inutiles)
3. Envoyer un devis sans date de validite
4. Ne pas relancer un devis envoye
5. Lancer la production sans BAT valide
6. Lancer la production sans acompte
7. Livrer sans controle qualite
8. Ne pas informer le client quand la commande est prete
9. Cloturer sans verifier le paiement complet
10. Ne jamais demander la satisfaction
11. Oublier un client apres la vente
