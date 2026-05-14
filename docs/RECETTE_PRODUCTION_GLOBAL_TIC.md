# Recette Finale Production — GLOBAL TIC Dashboard

**Version :** 1.0 — Mai 2026
**Environnement :** Production
**Statuts possibles :** `⬜ À tester` · `✅ OK` · `❌ KO` · `⚠️ Mineur`

---

## Table des matières

1. [Parcours principal bout en bout](#1-parcours-principal-bout-en-bout)
2. [Tests catalogue et site public](#2-tests-catalogue-et-site-public)
3. [Tests devis](#3-tests-devis)
4. [Tests commandes](#4-tests-commandes)
5. [Tests paiements et reçus PDF](#5-tests-paiements-et-reçus-pdf)
6. [Tests fichiers et BAT](#6-tests-fichiers-et-bat)
7. [Tests imports / exports CSV](#7-tests-imports--exports-csv)
8. [Tests par rôle](#8-tests-par-rôle)
9. [Tests sécurité](#9-tests-sécurité)
10. [Tests UX / responsive](#10-tests-ux--responsive)
11. [Tests notifications et recherche](#11-tests-notifications-et-recherche)
12. [Tests paramètres business](#12-tests-paramètres-business)
13. [Bugs connus et améliorations à traiter](#13-bugs-connus-et-améliorations-à-traiter)
14. [Validation finale](#14-validation-finale)

---

## 1. Parcours principal bout en bout

> Tester dans cet ordre exact avec un compte **patron** ou **admin**.

| # | Étape | Actions à effectuer | Résultat attendu | Statut | Observations |
|---|-------|---------------------|-----------------|--------|--------------|
| 1.1 | Connexion | Aller sur `/login`, saisir identifiants | Redirection vers `/admin`, dashboard affiché | ⬜ | |
| 1.2 | Vue d'ensemble | Observer les statistiques | Chiffres affichés, pas d'erreur visible | ⬜ | |
| 1.3 | Créer une catégorie | Catégories → Nouvelle catégorie → remplir nom + slug | Catégorie créée, apparaît dans la liste | ⬜ | |
| 1.4 | Créer un produit | Produits → Nouveau produit → remplir champs obligatoires | Produit créé, apparaît dans la liste | ⬜ | |
| 1.5 | Vérifier le catalogue public | Ouvrir `/catalogue` dans un nouvel onglet | Produit visible dans la bonne catégorie | ⬜ | |
| 1.6 | Calculateur produit | Cliquer sur le produit → changer la quantité | Prix mis à jour selon la grille tarifaire | ⬜ | |
| 1.7 | Message WhatsApp | Cliquer sur "Demander un devis" dans le calculateur | Message WhatsApp pré-rempli avec produit + quantité + prix | ⬜ | |
| 1.8 | Créer un client | Devis → Nouveau devis → créer un nouveau client | Client créé, apparaît dans le formulaire | ⬜ | |
| 1.9 | Créer un devis | Ajouter une ligne de devis avec le produit créé | Devis enregistré avec référence unique | ⬜ | |
| 1.10 | Modifier le devis | Modifier le devis → changer la quantité + ajouter une remise | Modification enregistrée, montant recalculé | ⬜ | |
| 1.11 | Générer PDF devis | Cliquer sur le bouton PDF | Fichier PDF téléchargé, contenu correct | ⬜ | |
| 1.12 | Accepter le devis | Modifier le devis → statut Accepté | Statut mis à jour | ⬜ | |
| 1.13 | Convertir en commande | Bouton "Convertir en commande" | Commande créée, devis verrouillé (statut Converti) | ⬜ | |
| 1.14 | Enregistrer un acompte | Commandes → ouvrir la commande → ajouter paiement 50 % | Paiement enregistré, solde restant mis à jour | ⬜ | |
| 1.15 | Reçu PDF acompte | Cliquer sur "Reçu PDF" | PDF téléchargé avec détail du paiement | ⬜ | |
| 1.16 | Ajouter fichier client | Section Fichiers → Ajouter → type "Fichier client" | Fichier visible dans la liste | ⬜ | |
| 1.17 | Ajouter un BAT | Section Fichiers → Ajouter → type "BAT" | Fichier BAT visible | ⬜ | |
| 1.18 | Statut BAT en cours | Modifier la commande → statut "BAT en cours" | Statut mis à jour | ⬜ | |
| 1.19 | BAT validé | Modifier la commande → statut "BAT validé" | Statut mis à jour, production autorisée | ⬜ | |
| 1.20 | Lancer production | Modifier la commande → statut "En production" | Statut mis à jour | ⬜ | |
| 1.21 | Commande prête | Modifier la commande → statut "Prête" | Statut mis à jour | ⬜ | |
| 1.22 | En livraison | Modifier la commande → statut "En livraison" | Statut mis à jour | ⬜ | |
| 1.23 | Livrée | Modifier la commande → statut "Livrée" | Statut mis à jour | ⬜ | |
| 1.24 | Solde final | Ajouter le paiement du solde restant | Solde restant = 0 | ⬜ | |
| 1.25 | Reçu PDF final | Cliquer sur "Reçu PDF" | PDF avec les 2 paiements affichés | ⬜ | |
| 1.26 | Journal d'activité | Faire défiler vers le bas dans la commande | Toutes les étapes historisées avec date + utilisateur | ⬜ | |
| 1.27 | Notifications | Vérifier la cloche 🔔 | Notifications générées pour les étapes clés | ⬜ | |
| 1.28 | Recherche globale | Ctrl+K → taper la référence de la commande | Commande retrouvée dans les résultats | ⬜ | |

---

## 2. Tests catalogue et site public

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 2.1 | Page d'accueil `/` | Chargement sans erreur, produits populaires visibles | ⬜ | |
| 2.2 | Page catalogue `/catalogue` | Catégories et produits listés | ⬜ | |
| 2.3 | Filtre par catégorie | Cliquer sur une catégorie → produits filtrés | ⬜ | |
| 2.4 | Page produit `/produit/[slug]` | Produit affiché avec description, images, calculateur | ⬜ | |
| 2.5 | Calculateur de prix | Changer la quantité → prix mis à jour en temps réel | ⬜ | |
| 2.6 | Quantité en dessous du minimum | Saisir une quantité < min_order_quantity | Message ou blocage, pas d'erreur silencieuse | ⬜ | |
| 2.7 | Bouton WhatsApp calculateur | Générer le message WhatsApp | Message contient produit, quantité, prix, coordonnées entreprise | ⬜ | |
| 2.8 | Produit désactivé | Désactiver un produit dans l'admin | Produit ne s'affiche plus sur le catalogue public | ⬜ | |
| 2.9 | Catégorie désactivée | Désactiver une catégorie | Catégorie masquée du catalogue public | ⬜ | |
| 2.10 | Page réalisations `/realisations` | Galerie portfolio affichée | ⬜ | |
| 2.11 | Produit sans grille de prix | Ouvrir un produit sans tiers de quantité | Calculateur se comporte sans erreur | ⬜ | |

---

## 3. Tests devis

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 3.1 | Créer devis avec client existant | Recherche client par WhatsApp → devis créé | ⬜ | |
| 3.2 | Créer devis avec nouveau client | Saisie d'un nouveau client dans le formulaire | ⬜ | |
| 3.3 | Ajouter plusieurs lignes | Devis avec 3 produits différents | Total calculé correctement | ⬜ | |
| 3.4 | Remise en pourcentage | Saisir 10 % → montant remise calculé | ⬜ | |
| 3.5 | Remise en montant fixe | Saisir 5000 XOF → soustrait du total | ⬜ | |
| 3.6 | PDF devis | Télécharger le PDF | Logo, coordonnées entreprise, tableau articles, remise, total, conditions | ⬜ | |
| 3.7 | PDF devis avec remise | Remise apparaît sur le PDF | ⬜ | |
| 3.8 | Modifier devis envoyé | Changer statut → Envoyé → puis Modifier | Modification possible | ⬜ | |
| 3.9 | Devis converti non modifiable | Ouvrir un devis Converti | Bouton Modifier absent ou désactivé | ⬜ | |
| 3.10 | Conversion devis non-accepté | Tenter de convertir un devis Brouillon | Action refusée ou bouton absent | ⬜ | |
| 3.11 | Liste devis | Affichage de tous les devis avec filtres | ⬜ | |
| 3.12 | Export CSV devis | Bouton Exporter → fichier téléchargé | Colonnes cohérentes avec les données | ⬜ | |
| 3.13 | Recherche devis | Recherche globale par référence | Devis trouvé | ⬜ | |

---

## 4. Tests commandes

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 4.1 | Liste commandes | Toutes les commandes affichées avec statut | ⬜ | |
| 4.2 | Filtrer par statut | Filtre "En production" → seules ces commandes | ⬜ | |
| 4.3 | Modifier statut | Changer statut → enregistrer | Nouveau statut affiché, journal mis à jour | ⬜ | |
| 4.4 | Tous les statuts | Tester chaque transition de statut dans l'ordre | Aucun statut bloquant | ⬜ | |
| 4.5 | Commande annulée | Passer en Annulée | Statut visible, actions limitées | ⬜ | |
| 4.6 | Recherche commande | Ctrl+K → référence de commande | Commande trouvée | ⬜ | |
| 4.7 | Export CSV commandes | Bouton Exporter → fichier téléchargé | ⬜ | |
| 4.8 | Bouton WhatsApp commande | Générer le message WhatsApp | Message avec référence et statut | ⬜ | |

---

## 5. Tests paiements et reçus PDF

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 5.1 | Ajouter acompte | Paiement 50 % du total | Solde restant = 50 % | ⬜ | |
| 5.2 | Ajouter solde | Deuxième paiement = solde restant | Solde restant = 0 | ⬜ | |
| 5.3 | Paiement dépassant le total | Saisir un montant > total | Avertissement ou accepté selon la logique | ⬜ | |
| 5.4 | Paiement = 0 | Saisir 0 XOF | Rejeté ou avertissement | ⬜ | |
| 5.5 | Reçu PDF avec 1 paiement | Générer le reçu | PDF affiche 1 ligne de paiement | ⬜ | |
| 5.6 | Reçu PDF avec 2 paiements | Générer le reçu | PDF affiche les 2 paiements | ⬜ | |
| 5.7 | Reçu PDF sans paiement | Tenter de générer sans paiement | Bouton absent ou erreur propre | ⬜ | |
| 5.8 | Méthodes de paiement | Tester espèces, virement, Orange Money, Wave | Toutes les méthodes enregistrées | ⬜ | |
| 5.9 | Note paiement | Ajouter une note sur le paiement | Note visible dans le reçu PDF | ⬜ | |
| 5.10 | Export CSV paiements | Bouton Exporter → fichier téléchargé | ⬜ | |

---

## 6. Tests fichiers et BAT

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 6.1 | Upload fichier PDF | Choisir un PDF < 20 Mo | Fichier uploadé, visible dans la liste | ⬜ | |
| 6.2 | Upload fichier PNG | Choisir une image PNG | Uploadé sans erreur | ⬜ | |
| 6.3 | Upload fichier JPEG | Choisir une image JPEG | Uploadé sans erreur | ⬜ | |
| 6.4 | Upload fichier WebP | Choisir une image WebP | Uploadé sans erreur | ⬜ | |
| 6.5 | Upload fichier trop grand | Choisir un fichier > 20 Mo | Message d'erreur clair | ⬜ | |
| 6.6 | Upload format non autorisé | Choisir un .docx ou .xlsx | Message d'erreur clair | ⬜ | |
| 6.7 | Télécharger un fichier | Cliquer sur le bouton de téléchargement | Fichier téléchargé via signed URL | ⬜ | |
| 6.8 | Supprimer un fichier | Cliquer sur Supprimer | Fichier retiré de la liste | ⬜ | |
| 6.9 | Types de fichier | Ajouter un de chaque type : client, maquette, BAT | Types correctement affichés et distingués | ⬜ | |
| 6.10 | Workflow BAT complet | Upload BAT → BAT en cours → BAT validé → En production | Chaque étape passe sans erreur | ⬜ | |
| 6.11 | Plusieurs BAT (corrections) | Uploader 2 versions de BAT successivement | Les 2 versions visibles, distinction claire | ⬜ | |

---

## 7. Tests imports / exports CSV

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 7.1 | Télécharger modèle catégories | Bouton "Télécharger le modèle" | Fichier CSV avec bons en-têtes | ⬜ | |
| 7.2 | Télécharger modèle produits | Idem | ⬜ | |
| 7.3 | Télécharger modèle prix | Idem | ⬜ | |
| 7.4 | Import catégories valides | Importer fichier correct | Aperçu : N lignes valides, 0 erreur → import OK | ⬜ | |
| 7.5 | Import produits valides | Importer fichier correct | Aperçu OK → import OK | ⬜ | |
| 7.6 | Import prix valides | Importer fichier correct | Aperçu OK → import OK | ⬜ | |
| 7.7 | Import avec slug existant | Importer un produit dont le slug existe déjà | Produit mis à jour (pas dupliqué) | ⬜ | |
| 7.8 | Import avec ligne invalide | Fichier avec une ligne manquant un champ obligatoire | Aperçu signale l'erreur, import partiel ou bloqué | ⬜ | |
| 7.9 | Import fichier non-CSV | Uploader un .xlsx ou .txt | Message d'erreur clair | ⬜ | |
| 7.10 | Import fichier trop grand | Uploader un CSV > 5 Mo | Message d'erreur clair | ⬜ | |
| 7.11 | Import en-têtes incorrects | CSV avec noms de colonnes erronés | Erreur signalée sur les colonnes manquantes | ⬜ | |
| 7.12 | Export clients | Bouton Exporter dans Clients | CSV téléchargé avec colonnes correctes | ⬜ | |
| 7.13 | Export devis | Bouton Exporter dans Devis | CSV téléchargé | ⬜ | |
| 7.14 | Export commandes | Bouton Exporter dans Commandes | CSV téléchargé | ⬜ | |
| 7.15 | Export produits | Bouton Exporter dans Produits | CSV téléchargé | ⬜ | |
| 7.16 | Export réalisations | Bouton Exporter dans Réalisations | CSV téléchargé | ⬜ | |

---

## 8. Tests par rôle

### Rôle : Commercial

Connecté avec un compte **commercial** :

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 8.1 | Menus visibles | Devis, Commandes, Clients, Vue d'ensemble, Aide | ⬜ | |
| 8.2 | Menus invisibles | Produits, Catégories, Réalisations, Utilisateurs, Paramètres, Imports | ⬜ | |
| 8.3 | Créer un devis | Formulaire accessible | ⬜ | |
| 8.4 | Générer PDF devis | Bouton PDF visible et fonctionnel | ⬜ | |
| 8.5 | Convertir devis | Bouton "Convertir en commande" présent | ⬜ | |
| 8.6 | Modifier les paiements | Bouton ou champ paiement absent | ⬜ | |
| 8.7 | Changer statut commande | Champ statut absent ou verrouillé | ⬜ | |
| 8.8 | Page Paramètres directe | URL `/admin/parametres` → AccessDenied | ⬜ | |
| 8.9 | Page Utilisateurs directe | URL `/admin/utilisateurs` → AccessDenied | ⬜ | |
| 8.10 | Page Imports directe | URL `/admin/imports` → AccessDenied | ⬜ | |

---

### Rôle : Production

Connecté avec un compte **production** :

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 8.11 | Menus visibles | Commandes, Vue d'ensemble, Aide | ⬜ | |
| 8.12 | Menus invisibles | Devis, Clients, Produits, Catégories, Utilisateurs, Paramètres, Imports | ⬜ | |
| 8.13 | Changer statut commande | Bouton Modifier → champ statut accessible | ⬜ | |
| 8.14 | Montants financiers | Montants, soldes, paiements absents de l'affichage | ⬜ | |
| 8.15 | Upload fichier BAT | Section fichiers accessible, upload possible | ⬜ | |
| 8.16 | Supprimer un fichier | Bouton supprimer visible | ⬜ | |
| 8.17 | Page Devis directe | URL `/admin/devis` → AccessDenied | ⬜ | |
| 8.18 | Journal d'activité | Visible dans les commandes | ⬜ | |

---

### Rôle : Infographiste

Connecté avec un compte **infographiste** :

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 8.19 | Menus visibles | Commandes, Vue d'ensemble, Aide | ⬜ | |
| 8.20 | Upload fichier | Possible depuis une commande | ⬜ | |
| 8.21 | Supprimer un fichier | Bouton supprimer absent | ⬜ | |
| 8.22 | Changer statut commande | Champ statut absent ou verrouillé | ⬜ | |
| 8.23 | Montants financiers | Absents de l'affichage | ⬜ | |
| 8.24 | Page Devis directe | URL `/admin/devis` → AccessDenied | ⬜ | |
| 8.25 | Page Utilisateurs directe | URL `/admin/utilisateurs` → AccessDenied | ⬜ | |

---

### Rôle : Admin

Connecté avec un compte **admin** :

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 8.26 | Accès catalogue | Produits et Catégories accessibles | ⬜ | |
| 8.27 | Imports CSV | Menu Imports visible et fonctionnel | ⬜ | |
| 8.28 | Paiements | Peut ajouter un paiement | ⬜ | |
| 8.29 | Page Utilisateurs | AccessDenied affiché | ⬜ | |
| 8.30 | Page Paramètres | AccessDenied affiché | ⬜ | |

---

## 9. Tests sécurité

| # | Cas de test | Méthode | Résultat attendu | Statut | Observations |
|---|-------------|---------|-----------------|--------|--------------|
| 9.1 | PDF devis sans auth | Ouvrir `/api/admin/devis/[id]/pdf` sans être connecté | HTTP 403 | ⬜ | |
| 9.2 | Reçu PDF sans auth | Ouvrir `/api/admin/commandes/[id]/receipt` sans être connecté | HTTP 403 | ⬜ | |
| 9.3 | PDF devis rôle insuffisant | Connecté en production → accéder à l'URL PDF | HTTP 403 | ⬜ | |
| 9.4 | Page admin sans auth | Ouvrir `/admin` sans être connecté | Redirection vers `/login` | ⬜ | |
| 9.5 | Fichiers privés Storage | Tenter d'accéder à un fichier order-files via URL directe | Accès refusé (bucket privé) | ⬜ | |
| 9.6 | Signed URL fichier | Utiliser le lien de téléchargement généré | Accès accordé temporairement | ⬜ | |
| 9.7 | Signed URL expirée | Réutiliser une signed URL après expiration | Accès refusé | ⬜ | |
| 9.8 | Server Action catégorie sans auth | Appeler `createCategoryAction` depuis une session non-admin | Erreur "Accès non autorisé" retournée | ⬜ | |
| 9.9 | Server Action produit rôle insuffisant | Commercial tente `deleteProductAction` | Erreur "Vous n'avez pas les droits" | ⬜ | |
| 9.10 | Clé service_role côté client | Inspecter le JS bundle en production | Clé absente des bundles | ⬜ | |
| 9.11 | Variables NEXT_PUBLIC sensibles | Inspecter le code source de la page | Aucune clé privée dans le HTML | ⬜ | |

---

## 10. Tests UX / responsive

### Desktop (≥ 1280px)

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 10.1 | Sidebar visible | Sidebar fixe à gauche | ⬜ | |
| 10.2 | Sidebar réduite | Bouton "Réduire" → sidebar passe en icônes | ⬜ | |
| 10.3 | Navigation sidebar complète | Tous les liens du menu fonctionnels | ⬜ | |
| 10.4 | Modale formulaire | Formulaire de création → centré, scrollable si contenu long | ⬜ | |
| 10.5 | Tableaux de liste | Colonnes toutes visibles, pas de débordement | ⬜ | |

### Tablette (768px – 1279px)

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 10.6 | Sidebar masquée | Sidebar absente, bouton hamburger présent | ⬜ | |
| 10.7 | Ouverture sidebar mobile | Cliquer sur hamburger → drawer s'ouvre | ⬜ | |
| 10.8 | Fermeture sidebar | Cliquer sur backdrop ou X | Drawer se ferme | ⬜ | |
| 10.9 | Tableaux | Tables lisibles ou remplacées par cards | ⬜ | |

### Mobile (< 768px)

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 10.10 | Hamburger menu | Ouverture du drawer mobile | ⬜ | |
| 10.11 | Fermeture sur navigation | Naviguer → drawer se referme | ⬜ | |
| 10.12 | Cards de liste | Commandes/Devis affichés en cards | ⬜ | |
| 10.13 | Modales bottom-sheet | Formulaires depuis le bas de l'écran | ⬜ | |
| 10.14 | Boutons accessibles | Boutons d'action pas masqués par le clavier virtuel | ⬜ | |
| 10.15 | Recherche Ctrl+K | Ouverture via l'icône loupe | ⬜ | |
| 10.16 | Recherche plein écran mobile | Champ de recherche plein écran sur mobile | ⬜ | |
| 10.17 | Page Aide mobile | Navigation par chips visible, contenu lisible | ⬜ | |

### Interactions clavier / accessibilité

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 10.18 | Ctrl+K | Ouvre la recherche globale | ⬜ | |
| 10.19 | Échap | Ferme la recherche | ⬜ | |
| 10.20 | ↑ ↓ dans la recherche | Navigation dans les résultats | ⬜ | |
| 10.21 | Entrée sur un résultat | Navigation vers la page | ⬜ | |

---

## 11. Tests notifications et recherche

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 11.1 | Badge notifications | Nombre de non-lues affiché en rouge | ⬜ | |
| 11.2 | Ouvrir le panneau | Cliquer sur la cloche | Liste des notifications | ⬜ | |
| 11.3 | Marquer une notification | Cliquer dessus | Badge mis à jour | ⬜ | |
| 11.4 | Tout marquer comme lu | Bouton "Tout marquer" | Badge disparaît | ⬜ | |
| 11.5 | Notification lors d'un changement de statut | Changer statut commande | Notification créée pour les rôles concernés | ⬜ | |
| 11.6 | Recherche client | Taper un nom ou WhatsApp | Client trouvé | ⬜ | |
| 11.7 | Recherche devis | Taper une référence de devis | Devis trouvé | ⬜ | |
| 11.8 | Recherche commande | Taper une référence de commande | Commande trouvée | ⬜ | |
| 11.9 | Recherche produit | Taper un nom de produit | Produit trouvé | ⬜ | |
| 11.10 | Recherche sans résultat | Taper un terme inexistant | "Aucun résultat" affiché proprement | ⬜ | |
| 11.11 | Résultats filtrés par rôle | Commercial → cherche → ne voit pas produits/catégories | ⬜ | |

---

## 12. Tests paramètres business

| # | Cas de test | Résultat attendu | Statut | Observations |
|---|-------------|-----------------|--------|--------------|
| 12.1 | Modifier coordonnées | Changer le nom de l'entreprise → Enregistrer | Message ✓ affiché, valeur persistée | ⬜ | |
| 12.2 | Vérifier sur PDF | Générer un PDF devis après modification | Nouveau nom visible sur le PDF | ⬜ | |
| 12.3 | Modifier conditions PDF | Ajouter une condition → Enregistrer | Condition visible sur le prochain PDF | ⬜ | |
| 12.4 | Modifier message WhatsApp | Changer le modèle de devis → Enregistrer | Persisté | ⬜ | |
| 12.5 | Variables WhatsApp intactes | Vérifier que `{{client_nom}}` etc. restent utilisables | Variables non cassées | ⬜ | |
| 12.6 | Acompte par défaut | Modifier le % d'acompte → vérifier le comportement | ⬜ | |
| 12.7 | Accès Paramètres rôle limité | Commercial / Production → page Paramètres | AccessDenied | ⬜ | |

---

## 13. Bugs connus et améliorations à traiter

> Bugs découverts lors de la recette ou connus avant. À traiter en phase 2.30+.

### Bugs critiques (bloquants pour la mise en production)

*Aucun bug critique identifié à ce stade.*

---

### Bugs mineurs (non bloquants)

| # | Description | Composant concerné | Priorité |
|---|-------------|-------------------|----------|
| — | — | — | — |

*À compléter lors de l'exécution des tests.*

---

### Améliorations identifiées (post-production)

| # | Description | Justification | Priorité |
|---|-------------|--------------|----------|
| A1 | Filtres avancés sur la liste des commandes (par date, montant, client) | Faciliter le suivi au quotidien | Moyenne |
| A2 | Pagination côté serveur sur les listes | Performance si > 500 entrées | Moyenne |
| A3 | Envoi e-mail automatique lors d'un changement de statut | Notification client par e-mail | Basse |
| A4 | Mode sombre du dashboard | Confort visuel équipe | Basse |
| A5 | Historique des PDF générés | Traçabilité des documents envoyés | Basse |
| A6 | Archivage automatique des devis expirés | Nettoyage automatique | Basse |
| A7 | Dashboard analytique avancé (graphiques CA, évolution mensuelle) | Suivi business | Haute |

---

## 14. Validation finale

> À remplir une fois tous les tests exécutés.

### Bilan

| Catégorie | Total cas | OK | KO | Mineurs | Non testés |
|-----------|-----------|----|----|---------|-----------|
| Parcours principal | 28 | | | | |
| Catalogue / site public | 11 | | | | |
| Devis | 13 | | | | |
| Commandes | 8 | | | | |
| Paiements & reçus | 10 | | | | |
| Fichiers & BAT | 11 | | | | |
| Imports / Exports | 16 | | | | |
| Tests par rôle | 30 | | | | |
| Sécurité | 11 | | | | |
| UX / responsive | 21 | | | | |
| Notifications & recherche | 11 | | | | |
| Paramètres business | 7 | | | | |
| **TOTAL** | **177** | | | | |

---

### Décision

| Critère | Statut |
|---------|--------|
| Aucun bug critique (KO) | ⬜ |
| Bugs mineurs documentés | ⬜ |
| Parcours principal complet sans blocage | ⬜ |
| Tous les rôles validés | ⬜ |
| Sécurité validée | ⬜ |

**Décision de mise en production :**

- [ ] ✅ **APPROUVÉ** — Le dashboard est prêt pour utilisation réelle par l'équipe
- [ ] ⚠️ **CONDITIONNEL** — Mise en production après correction des points KO listés
- [ ] ❌ **BLOQUÉ** — Bugs critiques à corriger avant tout déploiement

**Validé par :** ___________________________

**Date de validation :** ___________________________

**Prochaines étapes après validation :**
1. Créer les comptes utilisateurs réels (voir `CHECKLIST_ONBOARDING_EQUIPE.md`)
2. Importer le catalogue complet (catégories + produits + prix) via CSV
3. Renseigner les paramètres business définitifs
4. Former l'équipe en s'appuyant sur le guide intégré (`/admin/aide`)
5. Définir une date de démarrage réel

---

*Document de recette interne GLOBAL TIC — v1.0 — Mai 2026*
