# Checklist Onboarding Équipe — GLOBAL TIC Dashboard

**Version :** 1.0 — Mai 2026
**Destinataires :** Patron, Responsable administratif
**Objectif :** Préparer et valider l'accès au dashboard pour chaque membre de l'équipe

---

## Table des matières

1. [Créer un compte utilisateur](#1-créer-un-compte-utilisateur)
2. [Quel rôle attribuer selon le poste](#2-quel-rôle-attribuer-selon-le-poste)
3. [Droits détaillés par rôle](#3-droits-détaillés-par-rôle)
4. [Test rapide après création du compte](#4-test-rapide-après-création-du-compte)
5. [Checklists par rôle](#5-checklists-par-rôle)
6. [Scénarios métier à valider](#6-scénarios-métier-à-valider)
7. [Désactiver un accès](#7-désactiver-un-accès)
8. [Bonnes pratiques sécurité](#8-bonnes-pratiques-sécurité)

---

## 1. Créer un compte utilisateur

> Seul le **patron** peut créer des comptes.

### Étapes

1. Se connecter au dashboard avec le compte **patron**
2. Aller dans **Utilisateurs** (menu latéral)
3. Cliquer sur **Ajouter un utilisateur**
4. Remplir :
   - **Prénom et Nom** du collaborateur
   - **Adresse e-mail professionnelle** (sera l'identifiant de connexion)
   - **Rôle** (voir tableau section 2)
5. Cliquer sur **Créer**
6. Communiquer à l'utilisateur :
   - L'URL du dashboard
   - Son adresse e-mail
   - La procédure pour définir son mot de passe (lien de réinitialisation envoyé par Supabase)

### Compte de test recommandé

Avant de créer les comptes réels, créer un compte de test par rôle avec des e-mails comme :

| Rôle | E-mail de test |
|------|---------------|
| Commercial | commercial.test@globaltic.sn |
| Production | production.test@globaltic.sn |
| Infographiste | infographie.test@globaltic.sn |

Tester chaque compte, puis désactiver les comptes de test (ne pas les supprimer).

---

## 2. Quel rôle attribuer selon le poste

| Poste dans l'entreprise | Rôle à attribuer |
|------------------------|-----------------|
| Propriétaire / Dirigeant | **Patron** |
| Responsable administratif / Comptable | **Admin** |
| Commercial / Chargé de clientèle | **Commercial** |
| Responsable atelier / Chef de production | **Production** |
| Graphiste / Prépresse | **Infographiste** |

> En cas de doute, attribuer le rôle le moins élevé qui correspond au poste. Il est toujours possible de monter en rôle, mais un accès trop large est un risque.

---

## 3. Droits détaillés par rôle

### Patron

**Accès complet à toutes les fonctionnalités.**

| Module | Accès |
|--------|-------|
| Vue d'ensemble | ✅ |
| Produits | ✅ Créer, modifier, supprimer |
| Catégories | ✅ Créer, modifier, supprimer |
| Réalisations | ✅ Créer, modifier, supprimer |
| Devis | ✅ Créer, modifier, supprimer, convertir |
| Commandes | ✅ Statuts, paiements, fichiers |
| Clients | ✅ Créer, modifier |
| Imports CSV | ✅ Importer produits, catégories, prix |
| Exports | ✅ Tous les exports |
| Paramètres | ✅ Modifier toutes les configurations |
| Utilisateurs | ✅ Créer, modifier, activer/désactiver |
| Aide | ✅ |

---

### Admin

**Accès opérationnel complet, sans gestion de l'équipe ni des paramètres.**

| Module | Accès |
|--------|-------|
| Vue d'ensemble | ✅ |
| Produits | ✅ Créer, modifier, supprimer |
| Catégories | ✅ Créer, modifier, supprimer |
| Réalisations | ✅ Créer, modifier, supprimer |
| Devis | ✅ Créer, modifier, supprimer, convertir |
| Commandes | ✅ Statuts, paiements, fichiers |
| Clients | ✅ Créer, modifier |
| Imports CSV | ✅ |
| Exports | ✅ |
| Paramètres | ❌ Non accessible |
| Utilisateurs | ❌ Non accessible |
| Aide | ✅ |

---

### Commercial

**Gestion relation client : devis, commandes, clients. Pas de catalogue ni de production.**

| Module | Accès |
|--------|-------|
| Vue d'ensemble | ✅ |
| Produits | ❌ |
| Catégories | ❌ |
| Réalisations | ❌ |
| Devis | ✅ Créer, modifier, convertir (pas supprimer) |
| Commandes | ✅ Voir, ajouter fichiers |
| Clients | ✅ Créer, modifier |
| PDF devis | ✅ |
| Reçu PDF | ✅ |
| Imports / Exports | ❌ |
| Paramètres | ❌ |
| Utilisateurs | ❌ |
| Aide | ✅ |

> Le commercial **ne peut pas** modifier les paiements ni changer le statut d'une commande.

---

### Production

**Suivi de fabrication : statuts commandes, fichiers, BAT. Pas de données financières.**

| Module | Accès |
|--------|-------|
| Vue d'ensemble | ✅ |
| Commandes | ✅ Voir, changer statut, fichiers, BAT |
| Paiements | ❌ Non visible |
| Montants | ❌ Non visible |
| Fichiers commande | ✅ Upload, suppression |
| BAT | ✅ Upload, envoi, validation |
| Journal d'activité | ✅ |
| Devis | ❌ |
| Catalogue | ❌ |
| Imports / Exports | ❌ |
| Paramètres | ❌ |
| Utilisateurs | ❌ |
| Aide | ✅ |

---

### Infographiste

**Travail sur les fichiers et BAT uniquement. Droits les plus restreints.**

| Module | Accès |
|--------|-------|
| Vue d'ensemble | ✅ |
| Commandes | ✅ Voir uniquement |
| Fichiers commande | ✅ Upload |
| BAT | ✅ Upload, envoi |
| Statut commande | ❌ Ne peut pas modifier |
| Supprimer fichiers | ❌ |
| Paiements | ❌ |
| Devis | ❌ |
| Catalogue | ❌ |
| Imports / Exports | ❌ |
| Paramètres | ❌ |
| Utilisateurs | ❌ |
| Aide | ✅ |

---

## 4. Test rapide après création du compte

Après avoir créé un compte et communiqué les identifiants, demander à l'utilisateur d'effectuer ces vérifications :

### Pour tous les rôles

- [ ] Je peux me connecter avec mon e-mail et mon mot de passe
- [ ] La page **Vue d'ensemble** s'affiche correctement
- [ ] La page **Aide** est accessible depuis le menu
- [ ] Le menu latéral affiche uniquement les sections correspondant à mon rôle
- [ ] Je reçois les notifications qui me sont destinées

### Commercial

- [ ] Je vois le menu **Devis**
- [ ] Je vois le menu **Commandes**
- [ ] Je vois le menu **Clients**
- [ ] Je ne vois pas **Produits**, **Catégories**, **Utilisateurs**, **Paramètres**
- [ ] Je peux créer un devis de test
- [ ] Je peux générer un PDF depuis ce devis

### Production

- [ ] Je vois le menu **Commandes**
- [ ] Je ne vois pas **Devis**, **Produits**, **Paramètres**, **Utilisateurs**
- [ ] Je peux ouvrir une commande et voir ses fichiers
- [ ] Je peux changer le statut d'une commande (si commande de test disponible)
- [ ] Je ne vois pas les montants financiers

### Infographiste

- [ ] Je vois le menu **Commandes**
- [ ] Je ne vois pas **Devis**, **Produits**, **Paramètres**, **Utilisateurs**
- [ ] Je peux ouvrir une commande et voir la section fichiers
- [ ] Je peux uploader un fichier (si commande de test disponible)
- [ ] Je ne peux pas changer le statut d'une commande
- [ ] Je ne vois pas les montants financiers

---

## 5. Checklists par rôle

### Checklist onboarding — Patron

> À réaliser par le patron lui-même ou par le développeur lors de la mise en production.

**Configuration initiale**
- [ ] Aller dans **Paramètres** → **Entreprise** et renseigner les coordonnées réelles
- [ ] Vérifier le nom, adresse, téléphone, e-mail de l'entreprise
- [ ] Aller dans **Paramètres** → **PDF** et vérifier les conditions générales
- [ ] Aller dans **Paramètres** → **WhatsApp** et personnaliser les messages
- [ ] Aller dans **Paramètres** → **Commercial** et définir le pourcentage d'acompte par défaut

**Catalogue**
- [ ] Vérifier que les catégories sont créées (ou les importer via CSV)
- [ ] Vérifier que les produits sont créés avec les bonnes grilles de prix
- [ ] Vérifier qu'au moins un produit est actif

**Équipe**
- [ ] Créer un compte pour chaque membre de l'équipe
- [ ] Vérifier que chaque compte a le bon rôle
- [ ] Tester la connexion d'au moins un compte par rôle
- [ ] Informer chaque collaborateur de l'existence de la page **Aide**

---

### Checklist onboarding — Admin

**Premier accès**
- [ ] Se connecter et vérifier l'accès à tous les modules autorisés
- [ ] Consulter la page **Aide** pour comprendre les fonctionnalités
- [ ] Vérifier que le catalogue est complet (produits, catégories)
- [ ] Créer un client de test et un devis de test pour valider le workflow

---

### Checklist onboarding — Commercial

**Premier accès**
- [ ] Se connecter et explorer les menus disponibles
- [ ] Lire la section **Devis** dans la page **Aide**
- [ ] Lire la section **Commandes** dans la page **Aide**
- [ ] Créer un client fictif (ex : "Test Commercial")
- [ ] Créer un devis pour ce client avec un produit du catalogue
- [ ] Générer le PDF du devis et vérifier son contenu
- [ ] Explorer le workflow de statuts des devis

**À mémoriser**
- Mon rôle me permet de créer et envoyer des devis
- Je peux convertir un devis accepté en commande
- Je ne peux pas modifier les paiements — c'est réservé au patron et à l'admin
- Pour toute question : consulter la page **Aide** ou contacter le patron

---

### Checklist onboarding — Production

**Premier accès**
- [ ] Se connecter et explorer la section **Commandes**
- [ ] Lire les sections **Commandes**, **Fichiers & BAT** et **Journal d'activité** dans la page **Aide**
- [ ] Identifier les commandes actuellement **Confirmées** (en attente de production)
- [ ] Vérifier qu'on peut changer le statut d'une commande de test
- [ ] Vérifier qu'on peut uploader un fichier sur une commande

**À mémoriser**
- Ne jamais passer en **En production** sans que le BAT soit validé
- Toujours mettre à jour le statut à chaque étape
- Je ne vois pas les montants — c'est normal
- Pour toute question : consulter la page **Aide** ou contacter le patron

---

### Checklist onboarding — Infographiste

**Premier accès**
- [ ] Se connecter et explorer la section **Commandes**
- [ ] Lire la section **Fichiers & BAT** dans la page **Aide**
- [ ] Localiser les commandes au statut **BAT en cours**
- [ ] Vérifier qu'on peut uploader un fichier (PDF, PNG, JPEG, WebP — max 20 Mo)

**À mémoriser**
- Mon rôle principal : uploader les maquettes et les BAT
- Je ne peux pas changer le statut d'une commande — c'est la production qui valide
- Formats acceptés : PDF, PNG, JPEG, WebP — taille max 20 Mo
- Pour toute question : consulter la page **Aide** ou contacter le patron

---

## 6. Scénarios métier à valider

Ces scénarios doivent être testés dans l'ordre avant la mise en production réelle.

### Scénario 1 — Création de devis (rôle : Commercial)

1. Commercial se connecte
2. Crée un client : nom, société, numéro WhatsApp
3. Crée un devis : sélectionne un produit, saisit la quantité
4. Vérifie que le prix s'affiche correctement
5. Ajoute une remise de 5 %
6. Passe le statut à **Envoyé**
7. Génère le PDF
8. Vérifie le contenu du PDF (logo, coordonnées, articles, total)

✅ Attendu : PDF généré, informations correctes, statut mis à jour

---

### Scénario 2 — Conversion devis → commande (rôle : Patron ou Admin)

1. Ouvrir le devis créé au scénario 1
2. Passer le statut à **Accepté**
3. Cliquer sur **Convertir en commande**
4. Vérifier que la commande est créée avec les bonnes informations
5. Vérifier que le devis est maintenant au statut **Converti**

✅ Attendu : commande créée, devis verrouillé

---

### Scénario 3 — Acompte et reçu PDF (rôle : Patron ou Admin)

1. Ouvrir la commande créée
2. Enregistrer un paiement (acompte de 50 %)
3. Vérifier que le solde restant s'affiche correctement
4. Générer le reçu PDF
5. Vérifier le contenu du reçu

✅ Attendu : reçu PDF téléchargé, solde correct

---

### Scénario 4 — Workflow BAT (rôles : Infographiste + Production)

1. Infographiste se connecte, ouvre la commande
2. Upload un fichier BAT (PDF de test)
3. Production se connecte, ouvre la commande
4. Passe le statut à **BAT en cours** (si pas déjà fait)
5. Vérifie que le fichier BAT est visible
6. Passe le statut à **BAT validé** (simule la validation client)
7. Passe le statut à **En production**

✅ Attendu : fichier visible pour les deux rôles, statuts mis à jour

---

### Scénario 5 — Livraison et solde (rôle : Patron ou Admin)

1. Production passe le statut à **Prête** puis **Livrée**
2. Patron/Admin enregistre le paiement du solde
3. Vérifier que le solde restant est 0
4. Générer le reçu final

✅ Attendu : commande soldée, reçu complet

---

### Scénario 6 — Import CSV (rôle : Patron ou Admin)

1. Aller dans **Imports CSV** → onglet **Produits**
2. Télécharger le modèle CSV
3. Ajouter 2-3 lignes de produits de test
4. Importer le fichier
5. Vérifier l'aperçu (lignes valides / invalides)
6. Confirmer l'import
7. Vérifier que les produits apparaissent dans le catalogue

✅ Attendu : import sans erreur, produits créés ou mis à jour

---

## 7. Désactiver un accès

> À faire immédiatement quand un collaborateur quitte l'entreprise ou change de poste.

### Procédure

1. Se connecter avec le compte **patron**
2. Aller dans **Utilisateurs**
3. Trouver l'utilisateur concerné dans la liste
4. Cliquer sur le bouton **Désactiver**
5. Confirmer la désactivation

**Effet immédiat :** L'utilisateur ne peut plus se connecter. Son historique (commandes, devis créés) reste intact dans la base de données.

**Le compte n'est pas supprimé.** Il peut être réactivé à tout moment si nécessaire.

### Changer le rôle d'un collaborateur

Si un collaborateur change de poste (ex : commercial devient admin) :

1. Aller dans **Utilisateurs**
2. Cliquer sur **Modifier** sur sa ligne
3. Changer le **Rôle**
4. Cliquer sur **Enregistrer**

Le changement est effectif immédiatement — à la prochaine connexion du collaborateur.

---

## 8. Bonnes pratiques sécurité

### Pour chaque utilisateur

- **Ne jamais partager son mot de passe**, même avec un collègue ou le patron
- **Se déconnecter** du dashboard en quittant son poste de travail
- **Ne pas rester connecté** sur un ordinateur partagé ou public
- En cas de doute sur la sécurité d'un compte : contacter immédiatement le patron

### Pour le patron

- **Créer un compte distinct** pour chaque collaborateur — ne jamais partager le compte patron
- **Désactiver immédiatement** le compte d'un collaborateur qui quitte l'entreprise
- **Auditer régulièrement** la liste des utilisateurs actifs (minimum une fois par mois)
- Ne jamais communiquer le mot de passe patron par message ou e-mail
- Utiliser un mot de passe fort (minimum 12 caractères, chiffres, majuscules, caractères spéciaux)

### Gestion des mots de passe

- Chaque collaborateur définit son propre mot de passe via le lien reçu par e-mail
- En cas de perte de mot de passe : utiliser la procédure de récupération (lien "Mot de passe oublié")
- Si la récupération ne fonctionne pas : le patron contacte le support technique pour réinitialiser via Supabase

### Signaler un problème de sécurité

Si un collaborateur suspecte :
- Un accès non autorisé à son compte
- Un changement inexpliqué dans les données
- Un accès à des données qu'il ne devrait pas voir

→ **Contacter immédiatement le patron** qui contactera le support technique.

---

## Récapitulatif des contacts utiles

| Besoin | À contacter |
|--------|------------|
| Création / modification de compte | Patron |
| Problème de connexion | Patron |
| Question sur le dashboard | Page **Aide** dans le dashboard |
| Bug technique | Support technique (développeur) |
| Accès refusé à une fonctionnalité | Patron (vérification du rôle) |

---

*Ce document est destiné à l'usage interne de GLOBAL TIC. À conserver par le patron et le responsable administratif.*
