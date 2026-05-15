# Plan de lancement équipe — GLOBAL TIC PrintTech

**Plateforme :** GLOBAL TIC PrintTech Admin  
**Version :** 2.46  
**Date :** 14 mai 2026  
**Responsable lancement :** Patron GLOBAL TIC

---

## Objectif

Ouvrir officiellement le dashboard GLOBAL TIC PrintTech à l'équipe interne et s'assurer que chaque membre peut effectuer ses tâches quotidiennes de façon autonome dès le premier jour.

---

## 1. Rôles concernés

| Rôle | Qui | Responsabilités principales |
|------|-----|-----------------------------|
| **Patron** | Gérant / Directeur | Pilotage global, paramètres, rapports, utilisateurs |
| **Admin** | Assistant de direction | Commandes, devis, clients, factures, rapports |
| **Commercial** | Responsable commercial | Devis, clients, paiements, impayés, tâches de relance |
| **Production** | Responsable atelier | Planning, statuts commandes, BAT, contrôle qualité |
| **Infographiste** | Graphiste / Maquettiste | Fichiers clients, maquettes, BAT, corrections |

---

## 2. Étapes avant ouverture (J-3 à J-1)

### J-3 : Configuration Supabase et Vercel

- [ ] Appliquer les 12 migrations SQL dans l'ordre (Supabase Dashboard → SQL Editor)
- [ ] Vérifier que le bucket `order-files` est **privé** (non public)
- [ ] Vérifier que le bucket `catalog-images` est **public en lecture**
- [ ] Configurer les 3 variables d'environnement dans Vercel :
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Déclencher un redéploiement Vercel et vérifier le statut **Ready / Current**

### J-2 : Création des comptes utilisateurs

- [ ] Créer le compte **Patron** dans Supabase Auth (email + mot de passe fort)
- [ ] Exécuter `supabase/admin_setup.sql` pour créer le profil patron en base
- [ ] Se connecter sur `/login` → vérifier accès complet `/admin`
- [ ] Créer les comptes des autres membres de l'équipe depuis `/admin/utilisateurs` :
  - Commercial : rôle `commercial`
  - Production : rôle `production`
  - Infographiste : rôle `infographiste`
  - Admin (si applicable) : rôle `admin`
- [ ] Communiquer les identifiants à chaque membre par canal sécurisé (WhatsApp privé ou en main propre)

> **Règle de sécurité :** Ne jamais envoyer les mots de passe par email ni les écrire dans un document partagé non sécurisé. Chaque membre doit changer son mot de passe lors de sa première connexion.

### J-1 : Configuration métier

- [ ] Se connecter en tant que Patron sur `/admin/parametres`
- [ ] Renseigner les informations entreprise :
  - Nom : `GLOBAL TIC PrintTech`
  - Adresse complète
  - Téléphone professionnel
  - Numéro WhatsApp (format international : `221XXXXXXXXX`)
  - Email professionnel
- [ ] Configurer l'URL Google Avis (optionnel mais recommandé)
- [ ] Vérifier les templates WhatsApp (devis, paiement, livraison)
- [ ] Vérifier les conditions générales dans les paramètres PDF
- [ ] Importer ou créer au moins 3 produits et 2 catégories de test
- [ ] Tester la génération de chaque PDF (devis, facture, reçu, bon de livraison) avec les nouvelles infos

---

## 3. Étapes pendant la formation (Jour J)

### Ordre de formation recommandé

```
09h00 — Patron / Admin         (pilotage, paramètres, accès global)
10h30 — Commercial             (devis, clients, paiements)
14h00 — Production             (planning, commandes, BAT, QC)
15h30 — Infographiste          (fichiers, maquettes, BAT)
```

### Déroulement pour chaque session

1. **Connexion** : chaque membre se connecte sur la plateforme avec ses identifiants
2. **Tour des menus** : présenter les modules visibles selon le rôle
3. **Scénario de démonstration** : exécuter le scénario "Cartes de visite" (voir section 5)
4. **Pratique guidée** : chaque membre refait les actions clés de son rôle
5. **Questions / réponses**

---

## 4. Étapes après ouverture (J+1 à J+7)

### J+1 : Suivi démarrage

- [ ] Vérifier que tous les membres ont pu se connecter
- [ ] Vérifier qu'aucun message d'erreur n'est remonté
- [ ] Créer au moins un devis réel et une commande test

### J+3 : Premier bilan

- [ ] Patron consulte le tableau de bord et vérifie les statistiques
- [ ] Vérifier que les notifications fonctionnent correctement
- [ ] Identifier les premières questions ou difficultés de l'équipe

### J+7 : Validation complète

- [ ] Chaque membre a utilisé son rôle en conditions réelles
- [ ] Aucun bug bloquant remonté
- [ ] Premier rapport PDF généré et validé
- [ ] Paramètres finalisés (logo, conditions, zones de livraison)

---

## 5. Scénario de démonstration — "Cartes de visite client"

> Ce scénario couvre l'intégralité du workflow GLOBAL TIC PrintTech.  
> À exécuter lors de la formation avec de vraies données de test.

### Acteurs du scénario
- **Client fictif :** M. Diallo, entreprise "Tech Sénégal", WhatsApp `221771234567`
- **Produit :** Cartes de visite 9×5 cm, 500 exemplaires, recto-verso

---

**Étape 1 — Création client** *(Commercial)*  
→ `/admin/clients` → Nouveau client  
→ Nom : Diallo, Entreprise : Tech Sénégal, WhatsApp : 221771234567

**Étape 2 — Création devis** *(Commercial)*  
→ `/admin/devis` → Nouveau devis  
→ Sélectionner le client, ajouter la ligne "Cartes de visite 500ex", saisir le montant  
→ Statut : `Envoyé`

**Étape 3 — Envoi WhatsApp devis** *(Commercial)*  
→ Depuis la fiche devis, cliquer "WhatsApp" → message pré-rempli s'ouvre  
→ Envoyer le lien PDF du devis au client

**Étape 4 — Acceptation devis** *(Commercial)*  
→ Passer le devis en statut `Accepté`  
→ Convertir en commande → la commande est créée automatiquement

**Étape 5 — Enregistrement acompte** *(Commercial / Admin)*  
→ Dans la commande, cliquer "Paiement rapide"  
→ Saisir le montant de l'acompte, méthode (Wave / Orange Money / Espèces)  
→ Générer le reçu PDF → envoyer au client

**Étape 6 — Upload fichier client** *(Infographiste)*  
→ Dans la commande, onglet Fichiers → Ajouter fichier → Type : "Fichier client"  
→ Charger le fichier PDF ou image fourni par le client

**Étape 7 — Préparation et upload BAT** *(Infographiste)*  
→ Préparer la maquette, l'exporter en PDF  
→ Dans la commande, Fichiers → Ajouter fichier → Type : "BAT"  
→ Changer le statut de la commande : `BAT en cours`

**Étape 8 — Validation BAT** *(Production / Infographiste)*  
→ Envoyer le BAT au client via WhatsApp (bouton dans la commande)  
→ Après accord client, passer le statut : `BAT validé`

**Étape 9 — Lancement production** *(Production)*  
→ Passer le statut : `En production`  
→ La commande apparaît dans le planning de production

**Étape 10 — Contrôle qualité** *(Production)*  
→ Après impression, cliquer "Contrôle qualité"  
→ Cocher les 8 points de contrôle (format, couleurs, texte, finition…)  
→ Valider → statut passe automatiquement à `Prête`

**Étape 11 — Planification livraison** *(Production / Admin)*  
→ Cliquer "Planifier livraison"  
→ Saisir adresse, date estimée, livreur  
→ Générer le bon de livraison PDF

**Étape 12 — Encaissement solde** *(Commercial / Admin)*  
→ Dans la commande, enregistrer le paiement du solde restant  
→ Générer la facture finale PDF  
→ Passer la commande en statut `Livrée`

**Étape 13 — Clôture et satisfaction** *(Commercial / Admin)*  
→ Cliquer "Clôturer la commande"  
→ Sélectionner "Satisfait" si le client est content  
→ Envoyer le message WhatsApp de demande d'avis Google (si `google_review_url` configuré)

**Étape 14 — Rapport d'activité** *(Patron / Admin)*  
→ `/admin/rapports` → Sélectionner la période  
→ Vérifier les KPIs (CA, commandes, taux satisfaction)  
→ Générer le PDF du rapport

---

## 6. Responsabilités par rôle

### Patron
| Responsabilité | Module / Action |
|----------------|-----------------|
| Surveiller le CA et les impayés | Tableau de bord, Impayés |
| Valider les paramètres entreprise | Paramètres |
| Gérer les accès de l'équipe | Utilisateurs |
| Générer les rapports mensuels | Rapports |
| Purger les notifications lues | Maintenance |
| Supprimer données incorrectes | Maintenance |

### Admin
| Responsabilité | Module / Action |
|----------------|-----------------|
| Gérer commandes et devis | Commandes, Devis |
| Suivre les factures | Factures |
| Gérer la base clients | Clients |
| Générer les rapports | Rapports |
| Gérer le catalogue | Produits, Catégories |

### Commercial
| Responsabilité | Module / Action |
|----------------|-----------------|
| Créer et envoyer les devis | Devis |
| Relancer les clients | Tâches, WhatsApp |
| Encaisser les acomptes | Commandes |
| Suivre les impayés | Impayés |
| Gérer le CRM clients | Clients |

### Production
| Responsabilité | Module / Action |
|----------------|-----------------|
| Suivre le planning | Planning |
| Changer les statuts de commande | Commandes |
| Valider les BAT | Commandes (fichiers) |
| Effectuer le contrôle qualité | Commandes (QC) |
| Planifier les livraisons | Commandes (livraison) |

### Infographiste
| Responsabilité | Module / Action |
|----------------|-----------------|
| Récupérer les fichiers clients | Commandes (fichiers) |
| Uploader les maquettes / BAT | Commandes (fichiers) |
| Suivre les corrections | Commandes |
| Mettre à jour le statut BAT | Commandes |

---

## 7. Règles de sécurité pour l'équipe

1. **Mot de passe fort** : minimum 12 caractères, chiffres + majuscules + caractères spéciaux. Ne jamais utiliser le prénom ou la date de naissance.

2. **Pas de partage de compte** : chaque membre a son propre compte. Ne jamais se connecter avec le compte d'un collègue.

3. **Déconnexion** : toujours se déconnecter en fin de journée, surtout depuis un ordinateur partagé. Bouton de déconnexion en bas du menu.

4. **Mots de passe oubliés** : contacter le Patron ou l'Admin pour réinitialisation depuis `/admin/utilisateurs`.

5. **Fichiers clients** : les fichiers uploadés (maquettes, BAT) sont stockés de façon sécurisée. Ne pas partager les liens de téléchargement à l'extérieur.

6. **Accès depuis l'extérieur** : la plateforme est accessible depuis n'importe quel appareil connecté à Internet. Éviter les réseaux WiFi publics non sécurisés.

7. **Signalement d'anomalie** : en cas de comportement suspect (accès refusé inhabituel, données manquantes), alerter immédiatement le Patron.

---

## 8. Support et assistance interne

### Premier recours : aide intégrée

→ Cliquer sur **Aide** dans le menu de gauche (`/admin/aide`)  
→ Guide contextuel par module disponible

### Deuxième recours : le Patron ou Admin

→ Pour toute question sur les droits d'accès ou les modules
→ Pour créer / désactiver un compte utilisateur

### Troisième recours : assistance technique

→ En cas de bug ou d'erreur technique, noter :
  1. La page où l'erreur s'est produite (URL)
  2. L'action effectuée
  3. Le message d'erreur affiché
→ Transmettre ces informations au responsable technique

---

## 9. Indicateurs de succès du lancement

| Indicateur | Cible J+7 |
|------------|-----------|
| Membres connectés avec succès | 100% |
| Premier devis créé | ✅ |
| Première commande convertie | ✅ |
| Premier PDF généré | ✅ |
| Aucun bug bloquant remonté | ✅ |
| Rapport d'activité généré par le Patron | ✅ |

---

*Document préparé dans le cadre de la Phase 2.46 — Lancement équipe GLOBAL TIC PrintTech.*
