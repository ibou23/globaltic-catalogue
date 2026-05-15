# Checklist de formation équipe — GLOBAL TIC PrintTech

**Plateforme :** GLOBAL TIC PrintTech Admin  
**Version :** 2.46  
**Date :** 14 mai 2026  
**À remplir par :** Le formateur (Patron ou Admin) lors de chaque session de formation

---

## Légende

- `[x]` Validé
- `[ ]` À valider
- `[~]` Partiellement validé — à reprendre
- `[!]` Point d'attention noté

---

## MODULE 0 — Tous les rôles : connexion et navigation

| # | Action | Patron | Admin | Commercial | Production | Infographiste |
|---|--------|--------|-------|------------|------------|---------------|
| 0.1 | Se connecter sur `/login` avec ses identifiants | [ ] | [ ] | [ ] | [ ] | [ ] |
| 0.2 | Vérifier que les menus correspondent au rôle | [ ] | [ ] | [ ] | [ ] | [ ] |
| 0.3 | Naviguer vers le tableau de bord `/admin` | [ ] | [ ] | [ ] | [ ] | [ ] |
| 0.4 | Utiliser la recherche globale (barre de recherche en haut) | [ ] | [ ] | [ ] | [ ] | [ ] |
| 0.5 | Consulter les notifications (cloche en haut à droite) | [ ] | [ ] | [ ] | [ ] | [ ] |
| 0.6 | Marquer une notification comme lue | [ ] | [ ] | [ ] | [ ] | [ ] |
| 0.7 | Consulter l'aide intégrée `/admin/aide` | [ ] | [ ] | [ ] | [ ] | [ ] |
| 0.8 | Se déconnecter correctement | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## MODULE 1 — Commercial : Devis et clients

**Rôles concernés : Commercial, Admin, Patron**

### 1.1 Gestion des clients

| # | Action | Commercial | Admin | Patron |
|---|--------|------------|-------|--------|
| 1.1.1 | Accéder à `/admin/clients` | [ ] | [ ] | [ ] |
| 1.1.2 | Créer un nouveau client (nom, WhatsApp, entreprise) | [ ] | [ ] | [ ] |
| 1.1.3 | Modifier les informations d'un client existant | [ ] | [ ] | [ ] |
| 1.1.4 | Consulter la fiche CRM d'un client (historique commandes, satisfaction) | [ ] | [ ] | [ ] |
| 1.1.5 | Ajouter une note interne sur un client | [ ] | [ ] | [ ] |

### 1.2 Gestion des devis

| # | Action | Commercial | Admin | Patron |
|---|--------|------------|-------|--------|
| 1.2.1 | Accéder à `/admin/devis` | [ ] | [ ] | [ ] |
| 1.2.2 | Créer un nouveau devis avec un client existant | [ ] | [ ] | [ ] |
| 1.2.3 | Ajouter des lignes d'articles au devis | [ ] | [ ] | [ ] |
| 1.2.4 | Modifier un devis en brouillon | [ ] | [ ] | [ ] |
| 1.2.5 | Passer le devis en statut "Envoyé" | [ ] | [ ] | [ ] |
| 1.2.6 | Générer le PDF du devis et l'ouvrir | [ ] | [ ] | [ ] |
| 1.2.7 | Utiliser le bouton WhatsApp pour envoyer le devis au client | [ ] | [ ] | [ ] |
| 1.2.8 | Passer le devis en statut "Accepté" | [ ] | [ ] | [ ] |
| 1.2.9 | Convertir un devis accepté en commande | [ ] | [ ] | [ ] |
| 1.2.10 | Passer un devis en "Refusé" ou "Expiré" | [ ] | [ ] | [ ] |

### 1.3 Suivi des paiements et impayés

| # | Action | Commercial | Admin | Patron |
|---|--------|------------|-------|--------|
| 1.3.1 | Accéder à `/admin/impayes` | [ ] | [ ] | [ ] |
| 1.3.2 | Identifier les commandes avec solde restant | [ ] | [ ] | [ ] |
| 1.3.3 | Utiliser le bouton WhatsApp de relance depuis les impayés | [ ] | [ ] | [ ] |

### 1.4 Tâches et relances

| # | Action | Commercial | Admin | Patron |
|---|--------|------------|-------|--------|
| 1.4.1 | Accéder à `/admin/taches` | [ ] | [ ] | [ ] |
| 1.4.2 | Créer une tâche de relance liée à un client | [ ] | [ ] | [ ] |
| 1.4.3 | Marquer une tâche comme terminée | [ ] | [ ] | [ ] |
| 1.4.4 | Vérifier les tâches en retard dans le tableau de bord | [ ] | [ ] | [ ] |

---

## MODULE 2 — Production : Commandes et atelier

**Rôles concernés : Production, Admin, Patron**

### 2.1 Suivi des commandes

| # | Action | Production | Admin | Patron |
|---|--------|------------|-------|--------|
| 2.1.1 | Accéder à `/admin/commandes` | [ ] | [ ] | [ ] |
| 2.1.2 | Filtrer les commandes par statut | [ ] | [ ] | [ ] |
| 2.1.3 | Ouvrir le détail d'une commande | [ ] | [ ] | [ ] |
| 2.1.4 | Passer une commande en statut "En production" | [ ] | [ ] | [ ] |
| 2.1.5 | Accéder au planning `/admin/planning` | [ ] | [ ] | [ ] |

### 2.2 Gestion des paiements (acompte / solde)

| # | Action | Production | Admin | Patron |
|---|--------|------------|-------|--------|
| 2.2.1 | Enregistrer un acompte via "Paiement rapide" | ✗ non autorisé | [ ] | [ ] |
| 2.2.2 | Générer le reçu de paiement PDF | ✗ non autorisé | [ ] | [ ] |
| 2.2.3 | Enregistrer le solde final | ✗ non autorisé | [ ] | [ ] |

> Note Production : le rôle production ne gère pas les paiements. Ceux-ci sont du ressort du commercial ou de l'admin.

### 2.3 Contrôle qualité

| # | Action | Production | Admin | Patron |
|---|--------|------------|-------|--------|
| 2.3.1 | Ouvrir le contrôle qualité d'une commande | [ ] | [ ] | [ ] |
| 2.3.2 | Cocher les 8 points de contrôle qualité | [ ] | [ ] | [ ] |
| 2.3.3 | Ajouter une note de contrôle qualité | [ ] | [ ] | [ ] |
| 2.3.4 | Valider le contrôle qualité → statut "Prête" | [ ] | [ ] | [ ] |
| 2.3.5 | Demander une correction (statut "À corriger") | [ ] | [ ] | [ ] |

### 2.4 Livraison

| # | Action | Production | Admin | Patron |
|---|--------|------------|-------|--------|
| 2.4.1 | Planifier une livraison (adresse, date, livreur) | [ ] | [ ] | [ ] |
| 2.4.2 | Générer le bon de livraison PDF | [ ] | [ ] | [ ] |
| 2.4.3 | Passer la commande en statut "Livrée" | [ ] | [ ] | [ ] |

### 2.5 Clôture et satisfaction

| # | Action | Production | Admin | Patron |
|---|--------|------------|-------|--------|
| 2.5.1 | Clôturer une commande livrée | [ ] | [ ] | [ ] |
| 2.5.2 | Enregistrer la satisfaction client | [ ] | [ ] | [ ] |
| 2.5.3 | Enregistrer une réclamation (si applicable) | [ ] | [ ] | [ ] |
| 2.5.4 | Envoyer la demande d'avis Google via WhatsApp | [ ] | [ ] | [ ] |

---

## MODULE 3 — Infographiste : Fichiers et BAT

**Rôles concernés : Infographiste, Production, Admin, Patron**

| # | Action | Infographiste | Production | Admin |
|---|--------|---------------|------------|-------|
| 3.1 | Accéder aux fichiers d'une commande | [ ] | [ ] | [ ] |
| 3.2 | Télécharger un fichier client existant | [ ] | [ ] | [ ] |
| 3.3 | Uploader un fichier de type "Fichier client" | [ ] | [ ] | [ ] |
| 3.4 | Uploader un fichier de type "BAT" | [ ] | [ ] | [ ] |
| 3.5 | Changer le statut d'un fichier (en attente → validé) | [ ] | [ ] | [ ] |
| 3.6 | Passer la commande en statut "BAT en cours" | ✗ non autorisé | [ ] | [ ] |
| 3.7 | Passer la commande en statut "BAT validé" | ✗ non autorisé | [ ] | [ ] |

> Note : L'infographiste peut uploader et gérer les fichiers, mais le changement de statut de la commande (BAT validé, En production) est réservé à la Production, l'Admin et le Patron.

---

## MODULE 4 — Patron / Admin : Pilotage et configuration

**Rôles concernés : Patron, Admin (selon les droits)**

### 4.1 Tableau de bord

| # | Action | Admin | Patron |
|---|--------|-------|--------|
| 4.1.1 | Consulter les KPIs financiers (CA, encaissé, solde) | [ ] | [ ] |
| 4.1.2 | Consulter les commandes urgentes et en retard | [ ] | [ ] |
| 4.1.3 | Consulter l'alerte impayés | [ ] | [ ] |
| 4.1.4 | Consulter les tâches du jour | [ ] | [ ] |
| 4.1.5 | Consulter l'activité récente | [ ] | [ ] |

### 4.2 Rapports

| # | Action | Admin | Patron |
|---|--------|-------|--------|
| 4.2.1 | Accéder à `/admin/rapports` | [ ] | [ ] |
| 4.2.2 | Sélectionner une période (aujourd'hui, 7j, mois, personnalisé) | [ ] | [ ] |
| 4.2.3 | Consulter les KPIs finance, commercial, production, satisfaction | [ ] | [ ] |
| 4.2.4 | Consulter le tableau Top Clients | [ ] | [ ] |
| 4.2.5 | Consulter les réclamations de la période | [ ] | [ ] |
| 4.2.6 | Générer et télécharger le rapport PDF | [ ] | [ ] |

### 4.3 Catalogue (Patron et Admin uniquement)

| # | Action | Admin | Patron |
|---|--------|-------|--------|
| 4.3.1 | Créer une catégorie de produits | [ ] | [ ] |
| 4.3.2 | Créer un produit avec prix et options | [ ] | [ ] |
| 4.3.3 | Uploader l'image d'un produit | [ ] | [ ] |
| 4.3.4 | Activer / désactiver un produit | [ ] | [ ] |
| 4.3.5 | Importer des produits depuis un fichier CSV | [ ] | [ ] |

### 4.4 Paramètres (Patron uniquement)

| # | Action | Patron |
|---|--------|--------|
| 4.4.1 | Accéder à `/admin/parametres` | [ ] |
| 4.4.2 | Modifier les informations entreprise | [ ] |
| 4.4.3 | Configurer l'URL Google Avis | [ ] |
| 4.4.4 | Personnaliser les templates WhatsApp | [ ] |
| 4.4.5 | Modifier les conditions générales PDF | [ ] |
| 4.4.6 | Configurer les zones et frais de livraison | [ ] |

### 4.5 Gestion des utilisateurs (Patron uniquement)

| # | Action | Patron |
|---|--------|--------|
| 4.5.1 | Accéder à `/admin/utilisateurs` | [ ] |
| 4.5.2 | Créer un compte pour un nouveau membre | [ ] |
| 4.5.3 | Modifier le rôle d'un utilisateur | [ ] |
| 4.5.4 | Désactiver l'accès d'un utilisateur | [ ] |

### 4.6 Maintenance (Patron uniquement)

| # | Action | Patron |
|---|--------|--------|
| 4.6.1 | Accéder à `/admin/maintenance` | [ ] |
| 4.6.2 | Purger les notifications lues | [ ] |
| 4.6.3 | Supprimer une commande test | [ ] |

---

## MODULE 5 — Tests de sécurité des rôles

> Ces tests vérifient que les accès interdits sont bien bloqués.

| # | Test | Rôle testé | Résultat attendu | Validé |
|---|------|------------|------------------|--------|
| 5.1 | Commercial tente d'accéder à `/admin/parametres` | commercial | Page "Accès refusé" | [ ] |
| 5.2 | Commercial tente d'accéder à `/admin/utilisateurs` | commercial | Page "Accès refusé" | [ ] |
| 5.3 | Production tente d'accéder à `/admin/rapports` | production | Page "Accès refusé" | [ ] |
| 5.4 | Infographiste tente d'accéder à `/admin/factures` | infographiste | Page "Accès refusé" | [ ] |
| 5.5 | Infographiste tente de changer le statut d'une commande | infographiste | Action refusée | [ ] |
| 5.6 | Commercial tente d'accéder à `/api/admin/rapports/pdf` | commercial | Réponse 403 | [ ] |
| 5.7 | Accès à `/admin` sans être connecté | — | Redirection `/login` | [ ] |

---

## MODULE 6 — Test PDF complet

| # | PDF | Route | Rôle minimum | Validé |
|---|-----|-------|--------------|--------|
| 6.1 | Devis | `/api/admin/devis/[id]/pdf` | commercial | [ ] |
| 6.2 | Reçu de paiement | `/api/admin/commandes/[id]/receipt` | commercial | [ ] |
| 6.3 | Facture | `/api/admin/commandes/[id]/facture` | commercial | [ ] |
| 6.4 | Bon de livraison | `/api/admin/commandes/[id]/bon-livraison` | production | [ ] |
| 6.5 | Rapport d'activité | `/api/admin/rapports/pdf` | admin | [ ] |

---

## Résultat global de la formation

| Membre | Rôle | Date formation | Score modules | Validé |
|--------|------|----------------|---------------|--------|
| | Patron | | /46 | [ ] |
| | Admin | | /38 | [ ] |
| | Commercial | | /25 | [ ] |
| | Production | | /22 | [ ] |
| | Infographiste | | /11 | [ ] |

---

## Observations et points à retravailler

*(À remplir par le formateur après chaque session)*

```
Membre :
Date :
Points maîtrisés :
Points à retravailler :
Actions de suivi :
```

---

*Checklist préparée dans le cadre de la Phase 2.46 — Lancement équipe GLOBAL TIC PrintTech.*
