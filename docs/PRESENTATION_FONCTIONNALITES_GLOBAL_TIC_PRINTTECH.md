# Présentation des fonctionnalités — GLOBAL TIC PrintTech

> Document de référence — Version 2.67 — Mai 2026  
> Usage : équipe interne · commerciaux · infographistes · partenaires · investisseurs

---

## 1. Introduction

**GLOBAL TIC PrintTech** est une plateforme de gestion d'imprimerie développée sur mesure pour digitaliser et optimiser l'ensemble du cycle commercial et opérationnel de GLOBAL TIC.

Avant la mise en place de cette plateforme, la gestion des commandes reposait sur des échanges WhatsApp dispersés, des devis créés manuellement sur Excel, des relances oubliées et un suivi de production peu structuré. Les informations étaient éparpillées, les erreurs fréquentes, et la visibilité sur l'activité quasi inexistante.

Aujourd'hui, **GLOBAL TIC PrintTech centralise tout** : de la première demande du client jusqu'à la facturation, la livraison et la fidélisation, en passant par la production, le contrôle qualité et les paiements.

### Ce que la plateforme apporte

- **Gain de temps** : les devis sont générés en quelques clics, les relances se déclenchent automatiquement, les documents PDF (devis, factures, bons de livraison, reçus) sont produits instantanément.
- **Réduction des erreurs** : les calculs financiers sont automatisés, les montants cohérents à chaque étape, les doublons détectés dès la saisie.
- **Suivi client à 360°** : chaque commercial dispose d'une vue complète sur ses prospects, devis, commandes et impayés.
- **Collaboration fluide** : les infographistes accèdent directement aux briefs qui les concernent ; les équipes de production suivent les commandes en temps réel.
- **Pilotage professionnel** : le dirigeant dispose d'un tableau de bord avec les indicateurs financiers, commerciaux et opérationnels consolidés.

---

## 2. Vision globale du workflow

La plateforme couvre le cycle complet, de l'acquisition à la fidélisation :

```
Acquisition
    │
    ▼
Capture du prospect (formulaire web / WhatsApp)
    │
    ▼
Qualification commerciale & Brief infographiste
    │
    ▼
Création du devis → Envoi WhatsApp / PDF
    │
    ▼
Acceptation du devis → Conversion en commande
    │
    ▼
Paiement / Acompte → Reçu PDF
    │
    ▼
Envoi fichiers client → BAT en cours → BAT validé
    │
    ▼
Production → Planning atelier → Contrôle qualité
    │
    ▼
Commande prête → Livraison → Bon de livraison
    │
    ▼
Facturation → Solde encaissé
    │
    ▼
Satisfaction client → Clôture
    │
    ▼
Fidélisation → Nouvelle commande
```

Chaque étape est tracée, notifiée aux bonnes personnes, et accessible depuis n'importe quel appareil connecté.

---

## 3. Site public et catalogue

### Catalogue produits

Le site public présente l'ensemble des produits d'impression proposés par GLOBAL TIC : t-shirts, cartes de visite, affiches, kakémonos, broderie, etc. Chaque produit dispose d'une page dédiée avec :

- Description et visuels
- Options disponibles (format, finition, couleurs, matière, marquage…)
- Délais indicatifs de production

### Calculateur de prix

Sur chaque page produit, le client peut saisir sa quantité souhaitée et visualiser instantanément le prix correspondant. Le calculateur applique les tarifs du catalogue, respecte les quantités minimales de commande et affiche le prix unitaire dégressif selon le volume.

Si la quantité saisie est inférieure au minimum requis, le client est informé immédiatement et la quantité est automatiquement ajustée.

### Bouton WhatsApp

Un bouton de contact WhatsApp est affiché sur l'ensemble du site, permettant au visiteur de démarrer une conversation directe avec l'équipe commerciale en un clic.

### Formulaire de demande `/demande`

Le formulaire public permet à tout visiteur de soumettre une demande de devis sans créer de compte. Il collecte :

- Nom et prénom
- Numéro WhatsApp
- Produit souhaité
- Quantité
- Description du besoin

À la soumission, un prospect est créé automatiquement dans le système et l'équipe commerciale reçoit une notification immédiate. Si le numéro WhatsApp est déjà connu (prospect ou client existant), un doublon est détecté et l'entrée n'est pas dupliquée.

---

## 4. Module Prospects

### Collecte des prospects

Les prospects entrent dans le système depuis deux canaux :

1. **Le formulaire `/demande`** — soumission directe par le client sur le site
2. **WhatsApp** — message reçu dans l'inbox, converti en prospect en un clic

### Inbox prospects

L'interface `/admin/prospects` présente tous les prospects sous forme de liste filtrable et triable. Le commercial voit d'un coup d'œil :

- Le nom et le numéro WhatsApp du prospect
- Le produit demandé et la quantité
- Le statut actuel (nouveau, en cours, converti, perdu)
- La date de création et le commercial assigné

### Statuts et priorités

Chaque prospect suit un cycle de statuts :

| Statut | Signification |
|---|---|
| **Nouveau** | Demande reçue, pas encore traitée |
| **En cours** | Commercial en contact avec le prospect |
| **Converti** | Devis créé, prospect devenu client |
| **Perdu** | Prospect non converti (pas de suite donnée) |

### Alertes prospects non traités

Si un prospect reste en statut "nouveau" sans être contacté pendant plus de **2 heures**, une alerte apparaît automatiquement sur le tableau de bord. Cela garantit qu'aucune demande ne passe entre les mailles du filet.

### Qualification et actions

Depuis la fiche prospect, le commercial peut :

- Ajouter des notes et informations complémentaires
- Assigner le prospect à un collègue
- Créer un devis directement pré-rempli avec les informations du prospect
- Marquer le prospect comme perdu avec un motif
- Supprimer le prospect (action sécurisée avec confirmation)

---

## 5. Tableau Briefs infographistes

### Vue type tableur

Le tableau des briefs est conçu pour les infographistes. Il présente **une ligne par prospect**, avec toutes les informations nécessaires pour démarrer le travail de création :

- Nom du prospect / client
- Produit demandé
- Quantité
- Options (format, couleurs, finition, dimensions, marquage…)
- Fichiers joints
- Délai souhaité
- Commercial référent

### Fonctionnalités pratiques

- **Copie cellule / ligne / brief** : copier en un clic le contenu d'une cellule, d'une ligne entière ou du brief complet (format texte adapté à un message)
- **Export CSV** : exporter la liste complète dans un fichier compatible Excel pour archivage ou traitement externe
- **Aperçu des fichiers** : visualiser les fichiers joints (logos, visuels, références) directement depuis le tableau
- **Téléchargement** : télécharger les fichiers en un clic

### Accès contrôlé

L'infographiste accède uniquement au tableau des briefs et aux fichiers qui le concernent. Il ne voit pas les données financières, les paiements ni les informations commerciales confidentielles.

---

## 6. WhatsApp Inbox

### Réception des messages

La plateforme est connectée à l'**API WhatsApp Cloud** de Meta. Tous les messages WhatsApp entrants sont reçus en temps réel dans l'interface `/admin/whatsapp`.

Le commercial peut ainsi consulter tous les messages sans quitter la plateforme et sans risquer de manquer une demande.

### Actions depuis un message

Depuis chaque message reçu, le commercial peut :

- **Créer un prospect** en pré-remplissant automatiquement les informations détectées dans le message
- **Rattacher** le message à un prospect ou client existant
- **Créer une tâche** de suivi liée au message
- **Répondre** directement via WhatsApp depuis l'interface

### Intégration complète

Les messages WhatsApp envoyés automatiquement par la plateforme (devis, confirmation commande, statut, livraison…) sont également tracés, permettant d'avoir un historique complet des échanges avec chaque contact.

---

## 7. Module Clients CRM

### Fiche client

Chaque client dispose d'une fiche centralisée accessible depuis `/admin/clients`. Elle regroupe toutes les informations :

- Coordonnées (nom, société, WhatsApp, adresse)
- Historique complet des devis avec statuts et montants
- Historique complet des commandes avec statuts et paiements
- Soldes en cours et impayés
- Notes internes de l'équipe commerciale
- Réclamations éventuelles

### Indicateurs financiers client

La fiche client affiche en temps réel :

- Le chiffre d'affaires total réalisé avec ce client
- Le montant encaissé
- Le solde restant à percevoir
- Le nombre de commandes

### Actions depuis la fiche client

- Créer un nouveau devis directement depuis la fiche (pré-rempli avec les informations du client)
- Consulter et télécharger les documents (factures, bons de livraison)
- Modifier les informations client
- Supprimer le client (sécurisé, impossible si des commandes actives sont liées)

---

## 8. Module Devis

### Création flexible

Un devis peut être créé de trois façons :

1. **Depuis un prospect** — les informations sont pré-remplies automatiquement
2. **Depuis la fiche client** — pour une nouvelle commande d'un client existant
3. **Manuellement** — création libre depuis `/admin/devis`

### Devis multi-lignes

Un devis peut contenir **plusieurs lignes de produits** (ex. : 500 t-shirts + 200 cartes de visite + 50 affiches). Chaque ligne comprend :

- Le produit sélectionné depuis le catalogue
- La quantité
- Le prix unitaire calculé automatiquement
- Les options de configuration (format, finition, couleurs, marquage, dimensions, délai…)
- Le total de la ligne

Le total général est calculé et mis à jour en temps réel.

### Prix automatique depuis le catalogue

Lors de la sélection d'un produit, le prix est résolu automatiquement depuis le catalogue en fonction de la quantité saisie. Les tarifs dégressifs sont appliqués sans intervention manuelle.

### PDF devis

Le devis est exportable en **PDF professionnel** comportant :

- En-tête avec logo et coordonnées de GLOBAL TIC
- Informations client
- Tableau des lignes avec description complète des options
- Total HT et conditions
- Numéro de référence unique (DEV-XXXX)

### Message WhatsApp devis

D'un clic, le commercial envoie un message WhatsApp pré-rédigé au client avec :

- Un résumé du devis (produit, quantité, prix)
- Le lien vers le PDF
- Pour les devis multi-lignes : mention du nombre de lignes supplémentaires

### Relances automatiques

Dès qu'un devis est envoyé, la plateforme crée automatiquement trois tâches de relance :

| Relance | Délai |
|---|---|
| Relance J+1 | Le lendemain de l'envoi |
| Relance J+3 | 3 jours après l'envoi |
| Relance J+7 | 7 jours après l'envoi |

Ces tâches apparaissent dans le module Tâches, assignées au commercial concerné.

### Conversion en commande

Lorsque le client accepte le devis, le commercial le convertit en commande en un clic. Toutes les informations sont reprises automatiquement.

---

## 9. Module Commandes

### Suivi des statuts

Chaque commande suit un parcours de statuts précis :

| Statut | Signification |
|---|---|
| **En attente** | Commande créée, en attente de paiement ou de fichiers |
| **Confirmée** | Acompte reçu ou commande validée |
| **BAT en cours** | Fichiers envoyés, BAT en préparation |
| **BAT validé** | Client a approuvé le BAT |
| **En production** | Fabrication en cours |
| **Contrôle qualité** | Vérification avant expédition |
| **Prête** | Commande prête à livrer |
| **En livraison** | En route vers le client |
| **Livrée** | Commande remise au client |
| **Annulée** | Commande annulée |

### Vue d'ensemble

La liste des commandes (`/admin/commandes`) est filtrée, triée et recherchable par référence, client, statut, ou date. Un code couleur visuel permet d'identifier immédiatement les commandes urgentes ou en retard.

### Suivi financier

Pour chaque commande, la plateforme affiche :

- Le total produits
- Les frais de livraison
- Le **total client** (produits + livraison)
- Le montant encaissé
- Le **solde restant**
- Le statut de paiement (non payé / acompte / payé)

---

## 10. Paiements, reçus et impayés

### Enregistrement des paiements

Le commercial enregistre chaque paiement reçu directement depuis la fiche commande. Il saisit :

- Le montant encaissé
- Le mode de paiement (espèces, virement, mobile money…)
- La date de réception

Le statut de paiement (non payé / acompte / payé) est mis à jour automatiquement.

### Reçu de paiement PDF

À chaque encaissement, un **reçu PDF** est généré instantanément. Il mentionne :

- La référence de la commande
- Le nom du client
- Le montant encaissé
- Le mode de paiement
- Le solde restant

Ce reçu peut être partagé immédiatement par WhatsApp.

### Calcul du total client

Le total réellement dû par le client est toujours calculé selon la règle :

> **Total client = Total produits + Frais de livraison**

Cette règle est appliquée de manière cohérente dans toute la plateforme : liste des commandes, fiche commande, factures, reçus, messages WhatsApp, rapports et tableau de bord.

### Module impayés

L'écran `/admin/impayes` liste toutes les commandes livrées ou facturées avec un solde restant. Le commercial peut :

- Voir le montant exact encore dû
- Envoyer un rappel de paiement par WhatsApp
- Consulter l'historique des paiements partiels

---

## 11. Factures et bons de livraison

### Facture PDF

La facture est générée automatiquement à partir des données de la commande. Elle comprend :

- En-tête GLOBAL TIC avec logo et coordonnées légales
- Numéro de facture unique (FAC-XXXX)
- Informations client complètes
- Détail des lignes de la commande avec options
- Frais de livraison
- **Total client** (produits + livraison)
- Statut de paiement (émise / partiellement payée / payée)
- Montants encaissés et solde restant

Le statut de la facture est synchronisé avec les paiements enregistrés.

### Bon de livraison PDF

Le bon de livraison est généré pour accompagner chaque livraison. Il indique :

- Référence de la commande
- Informations client et adresse de livraison
- Liste des articles livrés
- Livreur assigné
- Mode de livraison
- Frais de livraison
- Zone pour la signature du client et du livreur

---

## 12. Production, BAT et contrôle qualité

### Gestion des fichiers client

Dès la confirmation de la commande, le client ou le commercial peut uploader les fichiers nécessaires à la production (logos, visuels, gabarits, textes…). Ces fichiers sont stockés de manière sécurisée et accessibles à l'infographiste.

### Cycle BAT (Bon À Tirer)

Le BAT est le processus de validation visuelle avant impression :

1. L'infographiste prépare le fichier de production
2. Le commercial envoie le BAT au client (PDF ou visuel)
3. Le client valide ou refuse
4. En cas de refus, le cycle recommence avec les corrections demandées
5. À la validation, la commande passe automatiquement en production

### Planning atelier

L'écran de planning (`/admin/planning`) offre une vue d'ensemble des commandes en cours de production. L'équipe peut suivre :

- Les commandes en attente de démarrage
- Les commandes en cours de fabrication
- Les commandes en contrôle qualité

### Contrôle qualité

Avant de marquer une commande comme "prête", l'équipe de production effectue un contrôle qualité basé sur une checklist. Tant que le contrôle n'est pas validé, la commande ne peut pas passer à l'étape suivante. Ce blocage évite qu'une commande défectueuse soit livrée.

---

## 13. Livraison

### Statuts de livraison

La livraison dispose de ses propres statuts :

| Statut | Signification |
|---|---|
| **Prête** | Commande en attente de départ |
| **En livraison** | Livreur en route |
| **Livrée** | Remise au client confirmée |
| **Reportée** | Livraison décalée à une date ultérieure |
| **Échouée** | Tentative de livraison infructueuse |

### Informations de livraison

Pour chaque commande, les informations de livraison comprennent :

- Adresse de livraison
- Livreur assigné
- Mode de livraison (domicile, retrait en boutique, coursier)
- Frais de livraison facturés au client
- Date et créneau prévus

### Notifications WhatsApp livraison

Le client est informé automatiquement par WhatsApp :

- Quand sa commande est **prête** à être récupérée ou livrée
- Quand la livraison est **en cours** (livreur en route)
- Quand la commande est **livrée**

---

## 14. Satisfaction et fidélisation

### Tâche satisfaction J+1

Le lendemain de la livraison, une tâche est automatiquement créée pour le commercial : **"Vérifier la satisfaction client"**. Il contacte le client pour s'assurer que la commande correspond à ses attentes et que la livraison s'est bien passée.

### Gestion des réclamations

En cas d'insatisfaction, le commercial peut enregistrer une réclamation avec :

- La nature du problème
- L'action corrective engagée
- Le suivi de résolution

### Demande d'avis Google

Après une livraison réussie, la plateforme permet d'envoyer un message WhatsApp invitant le client à laisser un avis Google. Cela contribue à la réputation en ligne de GLOBAL TIC.

### Tâche fidélisation J+30

Trente jours après la livraison, une tâche de **relance commerciale** est créée automatiquement : elle rappelle au commercial de recontacter le client pour lui proposer une nouvelle commande ou un produit complémentaire.

---

## 15. Tâches et relances

### Types de tâches

La plateforme distingue deux types de tâches :

- **Tâches manuelles** : créées librement par le commercial (appel à passer, email à envoyer, réunion à planifier…)
- **Tâches automatiques** : déclenchées automatiquement par le système (relances devis, satisfaction, fidélisation)

### Catalogue de types de tâches

| Type | Déclencheur |
|---|---|
| Relancer devis | Devis envoyé au client (J+1, J+3, J+7) |
| Relancer paiement | Solde impayé détecté |
| Confirmer livraison / Satisfaction | Commande livrée (J+1) |
| Appeler client (fidélisation) | Commande livrée (J+30) |
| Tâche libre | Saisie manuelle |

### Interface des tâches

L'écran `/admin/taches` présente toutes les tâches sous forme de liste avec :

- Priorité (urgente / haute / normale)
- Date d'échéance
- Commercial assigné
- Statut (à faire / en cours / terminée / annulée)
- Liens vers la commande ou le devis concerné

---

## 16. Notifications

### Notifications en temps réel

La plateforme envoie des notifications instantanées aux bonnes personnes selon les événements :

| Événement | Destinataires |
|---|---|
| Nouveau prospect reçu | Admin, commerciaux |
| Devis créé / envoyé | Admin, commercial assigné |
| Commande confirmée | Admin, production |
| Paiement reçu | Admin, commercial assigné |
| Fichier client uploadé | Infographiste, production |
| BAT validé | Commercial, production |
| Commande prête | Commercial assigné |
| Commande livrée | Admin, commercial |
| Réclamation enregistrée | Admin, commercial |
| Tâche assignée | Utilisateur concerné |

### Notifications par rôle

Chaque rôle ne reçoit que les notifications pertinentes à ses responsabilités. Un infographiste ne reçoit pas les alertes de paiement ; un commercial de production ne reçoit pas les alertes de prospection.

---

## 17. Rapports et pilotage

### Tableau de bord `/admin`

Le tableau de bord offre une vue synthétique de l'activité en temps réel :

**Indicateurs financiers :**
- Chiffre d'affaires commandes (total produits + livraison, hors annulées)
- Montant encaissé
- Solde restant à percevoir

**Indicateurs commerciaux :**
- Nombre de devis en attente de réponse
- Nombre de commandes actives (hors livrées / annulées)
- Commandes en production et en contrôle qualité
- Commandes prêtes ou en livraison

**Alertes :**
- Prospects non traités depuis plus de 2 heures
- Commandes urgentes nécessitant une action

### Rapports détaillés

L'écran `/admin/rapports` génère des rapports sur une période sélectionnée :

- **CA commandes** : total des ventes (produits + livraison)
- **CA devis acceptés** : devis transformés en commandes
- **Top clients** : classement par chiffre d'affaires
- **Soldes impayés** : commandes avec balance positive
- **Rapport PDF** : exportable pour réunion ou archivage

### Impayés

L'écran `/admin/impayes` liste tous les impayés, qu'il s'agisse de :
- Commandes livrées sans facture et non réglées
- Factures émises partiellement ou non payées

---

## 18. Permissions et sécurité

### Rôles utilisateurs

La plateforme définit cinq rôles aux accès distincts :

| Rôle | Périmètre |
|---|---|
| **Patron** | Accès complet à toutes les fonctionnalités et données |
| **Admin** | Gestion opérationnelle complète (commandes, clients, rapports) |
| **Commercial** | Prospects, devis, commandes de son portefeuille, tâches |
| **Production** | Planning, statuts production, BAT, contrôle qualité |
| **Infographiste** | Tableau des briefs, fichiers client uniquement |

### Sécurité des données

- **RLS Supabase** (Row Level Security) : les règles de sécurité sont appliquées directement au niveau de la base de données. Un utilisateur ne peut pas accéder aux données auxquelles il n'est pas autorisé, même en cas de bug applicatif.
- **Accès fichiers sécurisé** : les fichiers client (logos, visuels, BAT) sont stockés dans des espaces privés. Seuls les utilisateurs autorisés peuvent les consulter ou les télécharger.
- **Rate limiting** : les API publiques (formulaire de demande, webhook WhatsApp) sont protégées contre les abus par un limiteur de requêtes.
- **Suppression sécurisée** : les suppressions de données sensibles (clients, commandes, prospects) demandent une confirmation explicite et sont bloquées si des dépendances existent.

### Journal d'activité

Toutes les actions importantes sont enregistrées dans un journal d'activité (`activity_log`) : création, modification, suppression, changement de statut, paiement, envoi WhatsApp. Ce journal est consultable par les administrateurs.

---

## 19. Maintenance et administration

### Paramètres business

L'espace d'administration (`/admin/settings`) permet de configurer :

- Les informations de l'entreprise (nom, adresse, logo, coordonnées)
- Les paramètres de facturation (numérotation, conditions de paiement)
- Les intégrations (WhatsApp Cloud API, stockage fichiers)

### Gestion des utilisateurs

Les administrateurs peuvent :

- Créer et inviter de nouveaux utilisateurs
- Attribuer les rôles
- Désactiver un compte
- Réinitialiser un mot de passe

### Exports de données

La plateforme permet l'export des données clés :

- Export CSV des prospects, clients, devis, commandes
- Export CSV du tableau des briefs
- Rapports PDF sur mesure

### Documentation interne

Le dossier `docs/` contient les documents de référence de la plateforme :

- Recette du parcours Prospect → Devis → Commande
- Recette du parcours Commande → Production → Livraison
- Audit des montants financiers
- Recette finale dossier client
- Ce document de présentation

### Checklist Go Live

Avant la mise en production complète, la plateforme dispose d'une checklist de vérification couvrant les paramètres techniques, les permissions, les intégrations et les données de référence (catalogue, utilisateurs, configuration WhatsApp).

---

## 20. Bénéfices pour GLOBAL TIC

### Moins de prospects perdus

Grâce au formulaire `/demande`, à l'inbox WhatsApp et aux alertes de non-traitement, aucun prospect ne reste sans réponse. L'équipe commerciale dispose d'une vue centralisée de toutes les demandes en cours.

### Meilleure organisation commerciale

Les devis sont créés en quelques minutes, les relances se déclenchent automatiquement, les tâches sont assignées et visibles par tous. Le commercial sait toujours où en est chaque dossier.

### Collaboration infographiste / commercial fluide

Le tableau des briefs élimine les échanges WhatsApp interminables pour transmettre les spécifications. L'infographiste accède directement à ce dont il a besoin, sans perturber le commercial.

### Devis plus rapides et plus précis

Le calcul automatique des prix depuis le catalogue, la validation des quantités minimales et la génération PDF instantanée permettent de produire un devis professionnel en moins de 5 minutes.

### Production mieux suivie

Le planning atelier, les statuts clairs et le blocage avant livraison si le contrôle qualité n'est pas validé garantissent une production organisée et sans oubli.

### Réduction des erreurs financières

La règle `clientTotal = total + frais de livraison` est appliquée de manière systématique et cohérente dans toute la plateforme : aucun montant différent selon l'écran, aucune surprise pour le client.

### Meilleure transparence client

Les messages WhatsApp automatiques tiennent le client informé à chaque étape : devis envoyé, commande confirmée, BAT prêt, commande en livraison. Le client se sent suivi et rassuré.

### Meilleure fidélisation

La tâche de satisfaction J+1 et la relance de fidélisation J+30 garantissent que chaque client livré est recontacté. Ce suivi structuré augmente le taux de réachat et la satisfaction globale.

### Pilotage plus professionnel

Le dirigeant dispose d'un tableau de bord clair avec les chiffres clés de l'activité. Les rapports permettent d'analyser les performances, d'identifier les meilleurs clients et de mesurer la santé financière de l'entreprise en temps réel.

---

## 21. Conclusion

**GLOBAL TIC PrintTech** est une plateforme complète, intégrée et conçue spécifiquement pour les besoins d'une imprimerie moderne en Afrique de l'Ouest.

Elle couvre l'intégralité du cycle client — de la première demande en ligne jusqu'à la fidélisation — en automatisant les tâches répétitives, en centralisant l'information et en donnant à chaque membre de l'équipe les outils dont il a besoin pour travailler efficacement.

La plateforme est :

- **Opérationnelle** : testée sur l'ensemble du parcours client avec des données réelles
- **Cohérente** : les données financières, les statuts et les documents sont synchronisés à chaque étape
- **Sécurisée** : les accès sont contrôlés par rôle et sécurisés au niveau de la base de données
- **Évolutive** : l'architecture modulaire permet d'ajouter de nouvelles fonctionnalités sans perturber l'existant

GLOBAL TIC dispose désormais d'un outil à la hauteur de ses ambitions : **professional, digital, et centré sur le client.**

---

*Document généré par l'équipe technique GLOBAL TIC PrintTech — Mai 2026*  
*Pour toute question : contacter l'équipe de développement*
