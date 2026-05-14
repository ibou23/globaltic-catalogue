# Guide d'utilisation du dashboard GLOBAL TIC

**Version :** 1.0 — Mai 2026
**Destinataires :** Équipe interne — patron, admin, commercial, production, infographiste

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Connexion](#2-connexion)
3. [Vue d'ensemble du dashboard](#3-vue-densemble-du-dashboard)
4. [Gestion du catalogue](#4-gestion-du-catalogue)
5. [Import / Export CSV](#5-import--export-csv)
6. [Gestion des devis](#6-gestion-des-devis)
7. [Gestion des commandes](#7-gestion-des-commandes)
8. [Paiements](#8-paiements)
9. [Fichiers et BAT](#9-fichiers-et-bat)
10. [Journal d'activité](#10-journal-dactivité)
11. [Notifications](#11-notifications)
12. [Utilisateurs et rôles](#12-utilisateurs-et-rôles)
13. [Paramètres business](#13-paramètres-business)
14. [Bonnes pratiques](#14-bonnes-pratiques)
15. [FAQ / Dépannage](#15-faq--dépannage)

---

## 1. Introduction

### Objectif du dashboard

Le dashboard GLOBAL TIC est l'outil central de gestion de l'activité de l'entreprise. Il permet de :

- Gérer le catalogue de produits et les tarifs
- Créer et suivre les devis clients
- Convertir les devis acceptés en commandes
- Suivre les paiements et générer des reçus
- Gérer les fichiers clients, maquettes et BAT
- Consulter l'historique complet de chaque commande
- Piloter l'équipe grâce aux rôles et permissions

### Rôles disponibles

| Rôle | Description |
|------|-------------|
| **Patron** | Accès complet à toutes les fonctionnalités, gestion des utilisateurs, paramètres |
| **Admin** | Accès complet sauf gestion des utilisateurs et paramètres |
| **Commercial** | Devis, commandes, clients. Pas de gestion catalogue ni d'import |
| **Production** | Commandes, fichiers, BAT. Pas de données financières |
| **Infographiste** | Commandes, fichiers, BAT. Droits limités |

### Principe général du workflow

```
Client contacte via WhatsApp
        ↓
Commercial crée un Devis
        ↓
Devis envoyé au client (PDF WhatsApp)
        ↓
Client accepte → Conversion en Commande
        ↓
Acompte enregistré
        ↓
Infographiste / Production travaille sur le fichier + BAT
        ↓
BAT validé par le client
        ↓
Production lancée
        ↓
Commande livrée → Solde encaissé
        ↓
Reçu PDF généré et envoyé
```

---

## 2. Connexion

### Accéder au dashboard

1. Ouvrir un navigateur (Chrome ou Edge recommandé)
2. Aller sur l'adresse du dashboard (ex : `https://votre-domaine.com/login`)
3. Saisir votre adresse e-mail et votre mot de passe
4. Cliquer sur **Se connecter**

### Si l'accès est refusé

- Vérifiez que votre adresse e-mail est correcte (pas d'espace, pas de majuscule inutile)
- Vérifiez votre mot de passe (le champ est sensible à la casse)
- Si vous avez oublié votre mot de passe, contactez le **patron** pour réinitialisation
- Si votre compte est désactivé, seul le **patron** peut le réactiver

### Gestion des comptes par le patron

Seul le **patron** peut :
- Créer un nouveau compte utilisateur
- Modifier le rôle d'un utilisateur
- Activer ou désactiver un accès

Si un nouveau collaborateur rejoint l'équipe, demandez au patron de créer son compte dans **Utilisateurs** → **Ajouter un utilisateur**.

---

## 3. Vue d'ensemble du dashboard

À la connexion, vous arrivez sur la page **Vue d'ensemble** qui affiche :

### Statistiques principales

- Nombre de devis en attente
- Nombre de commandes en cours
- Chiffre d'affaires du mois (patron et admin uniquement)
- Commandes récentes

Ces chiffres se mettent à jour automatiquement.

### Notifications

L'icône cloche en haut à droite affiche le nombre de notifications non lues (badge rouge).

Cliquez dessus pour voir :
- Les nouvelles commandes créées
- Les changements de statut importants
- Les fichiers uploadés
- Les BAT en attente de validation

### Recherche globale

La barre de recherche en haut du dashboard (raccourci clavier **Ctrl+K**) permet de rechercher instantanément :
- Un client par nom ou numéro WhatsApp
- Un devis par référence
- Une commande par référence
- Un produit par nom

Utilisez les touches **↑ ↓** pour naviguer dans les résultats, **Entrée** pour ouvrir, **Échap** pour fermer.

### Menu latéral

Le menu à gauche donne accès à toutes les sections. Les menus affichés dépendent de votre rôle. Sur mobile, appuyez sur le bouton **☰** en haut à gauche pour ouvrir le menu.

---

## 4. Gestion du catalogue

> Accessible aux rôles : **Patron**, **Admin**

### Ajouter un produit

1. Aller dans **Produits** → cliquer sur **Nouveau produit**
2. Remplir les champs obligatoires :
   - **Nom** du produit
   - **Catégorie** (doit exister avant)
   - **Slug** : identifiant URL unique (ex: `carte-de-visite-standard`), en minuscules, sans espace
3. Remplir les champs optionnels : description courte, description complète, unité (pièce / m² / lot)
4. Définir la quantité minimale et le délai de production
5. Cliquer sur **Enregistrer**

Pour définir les grilles de prix (paliers de quantité) : voir la section Import CSV ou utiliser le formulaire dans la fiche produit.

### Modifier un produit

1. Aller dans **Produits**
2. Cliquer sur le bouton **Modifier** (crayon) sur la ligne du produit
3. Modifier les champs souhaités
4. Cliquer sur **Enregistrer**

### Changer une image

Dans le formulaire produit :
1. Saisir ou coller l'URL de l'image dans le champ **Image URL**
2. L'image doit être hébergée (Supabase Storage, ou lien externe stable)

### Activer / désactiver un produit

- Dans la liste des produits, utilisez le bouton **Modifier**
- Cochez ou décochez le champ **Actif**
- Un produit désactivé n'apparaît plus dans le catalogue public

### Gérer les catégories

1. Aller dans **Catégories**
2. Cliquer sur **Nouvelle catégorie** pour créer
3. Remplir le nom, le slug, et optionnellement une description et une image
4. Le champ **Ordre d'affichage** permet de contrôler l'ordre dans le catalogue (0 = premier)

> Une catégorie ne peut pas être supprimée si elle contient des produits.

### Gérer les réalisations

Les réalisations sont les travaux terminés affichés dans la galerie portfolio du site.

1. Aller dans **Réalisations**
2. Cliquer sur **Nouvelle réalisation**
3. Remplir le titre, la description, et l'URL de l'image
4. Cliquer sur **Enregistrer**

---

## 5. Import / Export CSV

> Import accessible aux rôles : **Patron**, **Admin**
> Export accessible à tous les rôles selon les données

### Télécharger un modèle CSV

1. Aller dans **Imports CSV**
2. Choisir l'onglet : **Catégories**, **Produits** ou **Prix**
3. Cliquer sur **Télécharger le modèle CSV**
4. Ouvrir le fichier dans Excel ou Google Sheets
5. Remplir les lignes en respectant exactement les colonnes

> Ne pas modifier les noms des colonnes. Ne pas supprimer la première ligne (en-têtes).

### Importer des produits (ou catégories / prix)

1. Préparer le fichier CSV depuis le modèle
2. Aller dans **Imports CSV** → choisir l'onglet correspondant
3. Glisser-déposer le fichier ou cliquer pour le sélectionner
4. Un **aperçu** s'affiche automatiquement : nombre de lignes valides, nombre d'erreurs
5. Si des erreurs apparaissent, corriger le fichier CSV et recommencer
6. Si l'aperçu est satisfaisant, cliquer sur **Importer**
7. Un résumé s'affiche après l'import : créés / mis à jour / erreurs

> L'import est **idempotent** : si le slug existe déjà, la ligne est mise à jour. Si le slug est nouveau, la ligne est créée. Il n'y a pas de doublons.

### Colonnes importantes du CSV Produits

| Colonne | Obligatoire | Exemple |
|---------|-------------|---------|
| `slug` | Oui | `carte-de-visite-standard` |
| `nom` | Oui | `Carte de visite standard` |
| `categorie_slug` | Oui | `cartes-de-visite` |
| `unite` | Non | `piece`, `m2`, ou `lot` |
| `actif` | Non | `1` (actif) ou `0` (inactif) |
| `tags` | Non | `populaire\|nouveauté` (séparés par \|) |

### Exporter les données

1. Aller dans la section concernée (Clients, Devis, Commandes, etc.)
2. Cliquer sur le bouton **Exporter CSV** en haut de la liste
3. Le fichier se télécharge automatiquement

Les exports disponibles selon votre rôle :
- **Clients** : nom, société, WhatsApp, date de création
- **Devis** : référence, client, montant, statut, date
- **Commandes** : référence, client, montant, paiements, statut, date
- **Produits** et **Réalisations** : export complet du catalogue

---

## 6. Gestion des devis

> Accessible aux rôles : **Patron**, **Admin**, **Commercial**

### Créer un devis depuis WhatsApp

Quand un client contacte via WhatsApp :

1. Aller dans **Devis** → cliquer sur **Nouveau devis**
2. **Rechercher le client** par nom ou WhatsApp. S'il n'existe pas encore, créer une nouvelle fiche client
3. Remplir les **lignes de devis** :
   - Sélectionner le produit
   - Indiquer la quantité
   - Le prix se calcule automatiquement selon la grille tarifaire
4. Optionnel : ajouter une **remise** (montant fixe ou pourcentage)
5. Optionnel : ajouter des **notes internes** (non visibles sur le PDF)
6. Cliquer sur **Enregistrer le devis**

### Modifier un devis

1. Aller dans **Devis**
2. Cliquer sur **Modifier** sur la ligne du devis
3. Modifier les lignes, remises ou notes
4. Cliquer sur **Enregistrer**

> Un devis ne peut être modifié que s'il est au statut **Brouillon** ou **Envoyé**. Une fois converti en commande, il ne peut plus être modifié.

### Ajouter une remise

Dans le formulaire devis :
- **Remise en montant fixe** : saisir directement le montant à déduire
- **Remise en pourcentage** : saisir le pourcentage, le montant est calculé automatiquement

### Générer un PDF

1. Sur la ligne du devis ou en bas du formulaire, cliquer sur **PDF**
2. Le fichier se télécharge instantanément
3. Le PDF contient : logo, coordonnées, tableau des articles, remise, total, conditions

### Envoyer le devis au client

1. Générer le PDF
2. Utiliser le bouton **WhatsApp** sur la ligne du devis pour ouvrir une conversation pré-remplie
3. Joindre le PDF téléchargé au message WhatsApp

### Changer le statut du devis

Les statuts disponibles :
- **Brouillon** : en cours de rédaction, non envoyé
- **Envoyé** : transmis au client, en attente de réponse
- **Accepté** : client a confirmé, prêt pour conversion
- **Refusé** : client a décliné
- **Expiré** : délai de validité dépassé

Pour changer le statut : cliquer sur **Modifier** → changer le champ **Statut**.

### Convertir un devis accepté en commande

1. Le devis doit être au statut **Accepté**
2. Cliquer sur le bouton **Convertir en commande**
3. Une commande est créée automatiquement avec toutes les informations du devis
4. Le devis passe au statut **Converti** et n'est plus modifiable

---

## 7. Gestion des commandes

> Accessible aux rôles : **Patron**, **Admin**, **Commercial**, **Production**, **Infographiste**
> Modification du statut et des paiements : **Patron**, **Admin**, **Production** (statut uniquement)

### Modifier une commande

1. Aller dans **Commandes**
2. Cliquer sur **Modifier** sur la ligne de la commande
3. Modifier le statut, les paiements ou les notes
4. Cliquer sur **Enregistrer**

### Changer le statut

Le statut reflète l'avancement réel de la commande. Il doit être mis à jour à chaque étape.

### Comprendre les statuts

| Statut | Signification |
|--------|---------------|
| **En attente** | Commande créée, acompte pas encore reçu |
| **Confirmée** | Acompte reçu, commande validée |
| **BAT en cours** | Infographiste travaille sur le fichier/maquette |
| **BAT validé** | Client a approuvé le fichier, production peut démarrer |
| **En production** | Impression en cours |
| **Contrôle qualité** | Vérification avant expédition |
| **Prête** | Commande terminée, prête à être récupérée ou livrée |
| **En livraison** | En cours d'acheminement chez le client |
| **Livrée** | Client a reçu sa commande |
| **Annulée** | Commande annulée (remboursement à traiter séparément) |

> Règle importante : ne jamais passer une commande en **production** si le BAT n'a pas été validé.

---

## 8. Paiements

> Accessible aux rôles : **Patron**, **Admin**

### Ajouter un paiement

1. Ouvrir la commande concernée (cliquer sur **Modifier**)
2. Dans la section **Paiements**, cliquer sur **Ajouter un paiement**
3. Saisir :
   - Le **montant** encaissé
   - La **méthode** (espèces, virement, Orange Money, Wave, etc.)
   - La **date** du paiement
   - Une **note** optionnelle (ex : référence de virement)
4. Cliquer sur **Enregistrer**

### Enregistrer un acompte

Lors de la confirmation de commande, enregistrer l'acompte comme premier paiement. Le solde restant s'affiche automatiquement.

### Enregistrer le solde

Quand le client paie le solde, ajouter un second paiement. Quand le total des paiements atteint le montant total de la commande, le solde restant affiche **0**.

### Comprendre le solde restant

Sur la fiche commande :
- **Montant total** = total du devis après remise
- **Montant payé** = somme de tous les paiements enregistrés
- **Solde restant** = montant total − montant payé

### Générer un reçu PDF

1. Ouvrir la commande
2. Cliquer sur **Reçu PDF**
3. Le reçu se télécharge avec le détail de tous les paiements enregistrés

> Le bouton **Reçu PDF** n'est disponible que si au moins un paiement a été enregistré.

### Envoyer une confirmation WhatsApp

1. Générer le reçu PDF
2. Utiliser le bouton **WhatsApp** sur la ligne de la commande
3. Un message pré-rempli s'ouvre dans WhatsApp avec les informations de confirmation

---

## 9. Fichiers et BAT

> Upload et gestion des fichiers : **Patron**, **Admin**, **Production**, **Infographiste**

### Types de fichiers

| Type | Usage |
|------|-------|
| **Fichier client** | Fichier source fourni par le client |
| **Maquette** | Fichier de travail de l'infographiste |
| **BAT** | Bon à tirer — fichier final soumis à validation |

### Ajouter un fichier client

1. Ouvrir la commande
2. Dans la section **Fichiers**, cliquer sur **Ajouter un fichier**
3. Choisir le type **Fichier client**
4. Sélectionner le fichier (PDF, PNG, JPEG ou WebP, max 20 Mo)
5. Cliquer sur **Uploader**

### Ajouter une maquette

Même procédure, en choisissant le type **Maquette**.

### Ajouter un BAT

Même procédure, en choisissant le type **BAT**.

### Envoyer un BAT au client

1. Une fois le fichier BAT uploadé, cliquer sur **Envoyer au client**
2. Télécharger le fichier BAT
3. Envoyer via WhatsApp en utilisant le bouton **WhatsApp** de la commande

### Marquer un BAT validé

Quand le client confirme par WhatsApp :
1. Ouvrir la commande
2. Cliquer sur **Modifier**
3. Passer le statut de la commande à **BAT validé**

### Gérer les corrections demandées

Si le client demande des modifications :
1. L'infographiste corrige le fichier
2. Uploader le nouveau BAT corrigé
3. Renvoyer au client pour validation
4. Recommencer jusqu'à validation

> Conserver les versions précédentes — ne pas supprimer les anciens BAT sans accord du patron.

### Lancer la production après validation BAT

1. Vérifier que le statut est bien **BAT validé**
2. Passer le statut à **En production**
3. Transmettre le fichier validé à l'équipe d'impression

---

## 10. Journal d'activité

> Accessible aux rôles : **Patron**, **Admin**, **Production**

Le journal d'activité enregistre automatiquement toutes les actions importantes sur une commande.

### Comprendre l'historique

Pour consulter le journal d'une commande :
1. Ouvrir la commande
2. Faire défiler vers le bas jusqu'à la section **Journal d'activité**

Chaque ligne affiche :
- La **date et l'heure** de l'action
- Le **nom de l'utilisateur** qui a effectué l'action
- La **description** de l'action (ex : "Statut changé : Confirmée → En production")

### Suivre qui a fait quoi

Le journal permet de retrouver :
- Qui a créé la commande
- Qui a changé quel statut et quand
- Qui a uploadé quel fichier
- Qui a enregistré quel paiement

### Lire les événements importants

Les événements clés sont enregistrés automatiquement :
- Création de la commande
- Chaque changement de statut
- Chaque upload de fichier
- Chaque paiement enregistré
- Envoi d'un BAT

---

## 11. Notifications

### Lire les notifications

Cliquer sur la cloche 🔔 en haut à droite. Un panneau s'ouvre avec la liste des notifications récentes.

### Marquer comme lu

- Cliquer sur une notification pour l'ouvrir (elle est automatiquement marquée comme lue)
- Cliquer sur **Tout marquer comme lu** pour effacer tous les badges d'un coup

### Comprendre les notifications selon les rôles

Chaque rôle reçoit les notifications pertinentes à ses responsabilités :

| Événement | Qui est notifié |
|-----------|----------------|
| Nouvelle commande créée | Patron, Admin |
| Statut commande changé | Patron, Admin, Commercial |
| Fichier uploadé | Patron, Admin, Production, Infographiste |
| Paiement enregistré | Patron, Admin |
| BAT uploadé | Patron, Admin, Production |

---

## 12. Utilisateurs et rôles

> Accessible au rôle : **Patron uniquement**

### Ajouter un utilisateur

1. Aller dans **Utilisateurs** → cliquer sur **Ajouter un utilisateur**
2. Remplir :
   - **Prénom et nom**
   - **Adresse e-mail** (sera utilisée pour la connexion)
   - **Rôle** (voir tableau des rôles ci-dessous)
3. Cliquer sur **Créer**
4. Communiquer à l'utilisateur son e-mail et lui demander de définir son mot de passe via le lien de réinitialisation

### Modifier un rôle

1. Aller dans **Utilisateurs**
2. Cliquer sur **Modifier** sur la ligne de l'utilisateur
3. Changer le **Rôle**
4. Cliquer sur **Enregistrer**

### Activer / désactiver un accès

1. Aller dans **Utilisateurs**
2. Utiliser le bouton **Activer** / **Désactiver** sur la ligne de l'utilisateur

> Un compte désactivé ne peut plus se connecter. Le compte n'est pas supprimé — il peut être réactivé à tout moment.

### Différence entre les rôles

| Rôle | Accès |
|------|-------|
| **Patron** | Tout : catalogue, devis, commandes, paiements, fichiers, paramètres, utilisateurs, imports, exports |
| **Admin** | Comme le patron, sauf : ne peut pas gérer les utilisateurs ni modifier les paramètres business |
| **Commercial** | Devis, commandes, clients, notifications. Ne voit pas le catalogue en détail |
| **Production** | Commandes (statuts), fichiers, BAT. Ne voit pas les montants financiers |
| **Infographiste** | Commandes (lecture), fichiers, BAT. Droits les plus restreints |

> En cas de doute sur les droits à attribuer, choisir le rôle le moins élevé qui convient au poste.

---

## 13. Paramètres business

> Accessible au rôle : **Patron uniquement**

Les paramètres business permettent de personnaliser les documents générés et les informations affichées.

### Modifier les coordonnées

1. Aller dans **Paramètres** → onglet **Entreprise**
2. Modifier : nom de l'entreprise, adresse, téléphone, e-mail, site web, slogan
3. Cliquer sur **Enregistrer**

Ces informations apparaissent sur tous les PDFs (devis et reçus).

### Modifier les paramètres commerciaux

1. Aller dans **Paramètres** → onglet **Commercial**
2. Modifier : pourcentage d'acompte par défaut, conditions de paiement
3. Cliquer sur **Enregistrer**

### Modifier les conditions PDF

1. Aller dans **Paramètres** → onglet **PDF**
2. Modifier la liste des conditions générales (ajout / suppression / modification de chaque ligne)
3. Modifier le texte de pied de page
4. Cliquer sur **Enregistrer**

Ces conditions s'affichent en bas de chaque devis PDF.

### Modifier les messages WhatsApp

1. Aller dans **Paramètres** → onglet **WhatsApp**
2. Modifier les modèles de messages pour chaque étape :
   - Envoi de devis
   - Confirmation de commande
   - Notification de BAT
   - Commande prête
   - Confirmation de livraison
   - Confirmation de paiement
3. Cliquer sur **Enregistrer**

Les variables disponibles dans les messages (ex : `{{client_nom}}`, `{{reference}}`, `{{montant}}`) sont indiquées sous chaque champ. Ne pas les supprimer ou les modifier.

---

## 14. Bonnes pratiques

### Sécurité des accès

- **Ne jamais partager votre identifiant et mot de passe** avec un collègue, même temporairement
- Si un collaborateur a besoin d'accès, demander au patron de lui créer son propre compte
- Se déconnecter du dashboard quand on quitte son poste ou son ordinateur
- En cas de doute sur la sécurité de son compte, contacter immédiatement le patron

### Qualité des données

- **Vérifier les informations client** (nom, WhatsApp) avant de créer un devis — un doublon est difficile à corriger
- Toujours utiliser le bon **slug** pour les produits (unique, sans espace, en minuscules)
- Ne jamais laisser un devis en statut **Brouillon** si le client l'a déjà reçu — passer à **Envoyé**

### Workflow de production

- **Toujours confirmer le BAT avant de lancer la production** — une erreur découverte après impression est irréparable
- Ne jamais passer une commande en **En production** sans que le statut **BAT validé** ait été atteint
- En cas de correction de dernière minute demandée par le client après BAT validé, re-uploader un nouveau BAT et refaire valider

### Paiements

- **Toujours enregistrer les paiements dans le dashboard** — ne pas se fier à la mémoire ou aux notes papier
- Enregistrer l'acompte au moment où il est reçu, pas a posteriori
- Générer et transmettre le reçu PDF à chaque paiement

### Statuts de commande

- **Toujours mettre à jour le statut** à chaque étape — c'est la seule façon pour l'équipe de suivre l'avancement
- Un statut incorrect peut provoquer des confusions (ex : livrer une commande dont le paiement n'est pas soldé)

### Suppressions

- **Ne jamais supprimer une catégorie, un produit, un devis ou une commande sans vérification**
- Les suppressions sont irréversibles
- En cas de doute, désactiver plutôt que supprimer

---

## 15. FAQ / Dépannage

### Je ne vois pas un menu dans la barre latérale

**Cause :** Votre rôle ne donne pas accès à cette section.
**Solution :** Contacter le patron pour vérifier votre rôle et l'ajuster si nécessaire.

---

### Je ne peux pas modifier une commande ou un devis

**Causes possibles :**
- Votre rôle ne permet pas cette action (ex : infographiste ne peut pas modifier les paiements)
- Le devis est déjà converti en commande (non modifiable)
- La commande est annulée (non modifiable)

**Solution :** Contacter le patron ou un admin pour effectuer la modification.

---

### Le PDF ne se télécharge pas

**Causes possibles :**
- Le navigateur bloque les téléchargements automatiques
- La connexion internet est instable

**Solutions :**
1. Autoriser les téléchargements dans les paramètres du navigateur
2. Réessayer après quelques secondes
3. Essayer dans un autre navigateur (Chrome ou Edge)
4. Si le problème persiste, contacter le support technique

---

### L'image d'un produit ne s'affiche pas

**Causes possibles :**
- L'URL de l'image est incorrecte ou le fichier a été déplacé
- L'image n'est plus accessible à l'adresse indiquée

**Solution :** Aller dans la fiche produit → Modifier → Vérifier ou remplacer l'URL de l'image.

---

### Le fichier ne s'uploade pas

**Causes possibles :**
- Le fichier dépasse la taille maximale autorisée (**20 Mo**)
- Le format n'est pas accepté (seuls PDF, PNG, JPEG et WebP sont autorisés)
- La connexion internet est instable

**Solutions :**
1. Réduire la taille du fichier (compresser le PDF ou réduire la résolution de l'image)
2. Convertir le fichier dans un format accepté
3. Réessayer avec une connexion stable

---

### Une notification ne s'affiche pas

**Causes possibles :**
- La notification concerne un événement qui ne vous est pas destiné selon votre rôle
- Le cache du navigateur est obsolète

**Solutions :**
1. Rafraîchir la page (F5)
2. Vider le cache du navigateur
3. Se déconnecter et se reconnecter

---

### Un utilisateur n'arrive pas à se connecter

**Causes possibles :**
- Mot de passe incorrect (3 tentatives échouées peuvent bloquer temporairement)
- Compte désactivé par le patron
- Adresse e-mail mal saisie

**Solutions :**
1. Vérifier que l'adresse e-mail est correcte
2. Le patron vérifie dans **Utilisateurs** que le compte est bien **Actif**
3. Si le compte est actif, réinitialiser le mot de passe depuis Supabase (accès développeur) ou via la procédure de récupération

---

### Je vois une erreur "Accès refusé" sur une page

**Cause :** Votre rôle ne donne pas accès à cette page.
**Solution :** Contacter le patron pour vérifier et ajuster votre rôle si nécessaire.

---

*Ce guide est destiné à l'usage interne de GLOBAL TIC. Pour toute question non couverte, contacter le responsable technique.*
