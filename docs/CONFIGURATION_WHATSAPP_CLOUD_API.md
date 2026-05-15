# Configuration WhatsApp Cloud API — GLOBAL TIC

Guide complet pour connecter le webhook GLOBAL TIC à Meta WhatsApp Cloud API.

---

## Prérequis

- Un compte Meta Business (https://business.facebook.com)
- Un numéro de téléphone dédié (pas déjà utilisé sur WhatsApp classique)
- Un accès administrateur au projet Vercel
- L'URL de production : `https://imprimerie.globalticgroup.com`

---

## Étape 1 — Créer une application Meta Developer

1. Ouvrir https://developers.facebook.com
2. Se connecter avec le compte Meta Business GLOBAL TIC
3. Cliquer **Mes applications** → **Créer une application**
4. Choisir le type **Business**
5. Nom de l'application : `GLOBAL TIC WhatsApp`
6. Sélectionner le compte Business associé
7. Valider la création

---

## Étape 2 — Ajouter le produit WhatsApp

1. Dans le tableau de bord de l'application, cliquer **Ajouter un produit**
2. Trouver **WhatsApp** → cliquer **Configurer**
3. Meta affiche la page WhatsApp avec un numéro de test temporaire

---

## Étape 3 — Enregistrer un numéro de téléphone

1. Aller dans **WhatsApp** → **Mise en route** (Getting Started)
2. Cliquer **Ajouter un numéro de téléphone**
3. Saisir le numéro GLOBAL TIC (format international : +221 77 619 04 19)
4. Vérifier par SMS ou appel vocal
5. Une fois vérifié, noter le **Phone Number ID** affiché (ex: `123456789012345`)

---

## Étape 4 — Récupérer les identifiants

### Phone Number ID
- Visible dans **WhatsApp** → **Mise en route** → sous le numéro ajouté
- Valeur à copier dans `WHATSAPP_PHONE_NUMBER_ID`

### Access Token (permanent)
1. Aller dans **WhatsApp** → **Configuration de l'API**
2. Le token temporaire expire après 24h
3. Pour un token permanent : **Paramètres de l'application** → **Rôles de l'application** → générer un token système avec la permission `whatsapp_business_messaging`
4. Copier le token → `WHATSAPP_ACCESS_TOKEN`

### App Secret
1. Aller dans **Paramètres** → **Base** (dans le menu latéral de l'application)
2. Cliquer **Afficher** à côté de **Clé secrète de l'application**
3. Copier la valeur → `META_APP_SECRET`

---

## Étape 5 — Configurer le webhook

1. Aller dans **WhatsApp** → **Configuration** (ou Configuration Webhook)
2. Cliquer **Modifier** à côté de l'URL du webhook
3. Remplir les champs :

| Champ | Valeur |
|---|---|
| URL de rappel | `https://imprimerie.globalticgroup.com/api/webhooks/whatsapp` |
| Token de vérification | La même valeur que `WHATSAPP_VERIFY_TOKEN` dans Vercel |

4. Cliquer **Vérifier et enregistrer**
5. Meta envoie une requête GET avec le token → le serveur doit répondre le challenge

### Champs webhook à sélectionner

Après la vérification, cocher les champs suivants :

- **messages** (obligatoire) — réception des messages entrants
- **messaging_handovers** — optionnel, pour les transferts d'agents

Ne pas cocher les champs inutiles pour limiter le trafic.

---

## Étape 6 — Ajouter les variables dans Vercel

1. Ouvrir le projet sur https://vercel.com
2. Aller dans **Settings** → **Environment Variables**
3. Ajouter les 4 variables (environnement : Production + Preview) :

| Variable | Description |
|---|---|
| `WHATSAPP_VERIFY_TOKEN` | Un secret de votre choix (ex: une chaîne aléatoire de 32 caractères) |
| `META_APP_SECRET` | Clé secrète de l'application Meta (étape 4) |
| `WHATSAPP_ACCESS_TOKEN` | Token permanent Meta (étape 4) |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone Number ID (étape 4) |

4. **Redéployer** le projet (onglet Deployments → Redeploy le dernier commit)

---

## Étape 7 — Tester la connexion

### Test 1 — Vérification webhook
Si l'étape 5 a réussi (pas d'erreur Meta), le webhook est vérifié.

### Test 2 — Message entrant
1. Depuis un autre téléphone, envoyer un message WhatsApp au numéro GLOBAL TIC
2. Attendre 10-30 secondes
3. Ouvrir `/admin/whatsapp` dans le dashboard
4. Le message doit apparaître avec :
   - Le numéro de l'expéditeur
   - Le nom du contact (si disponible dans le profil WhatsApp)
   - Le contenu du message
   - Un prospect créé automatiquement si le numéro est inconnu

### Test 3 — Prospect automatique
1. Envoyer un message depuis un numéro qui n'est ni client ni prospect
2. Vérifier dans `/admin/prospects` qu'un nouveau prospect est créé
3. Le prospect a le statut `nouveau` et la source `formulaire`

---

## Sécurité

### Règles absolues

- **Ne jamais** mettre les tokens dans le code source (GitHub)
- **Ne jamais** utiliser le préfixe `NEXT_PUBLIC_` pour ces variables
- **Ne jamais** afficher les tokens dans les logs ou les réponses HTTP
- **Ne jamais** partager les tokens par email ou messagerie non chiffrée

### Vérification signature

Le webhook vérifie automatiquement la signature `X-Hub-Signature-256` envoyée par Meta si `META_APP_SECRET` est configuré. Cela garantit que les requêtes proviennent bien de Meta.

### Permissions Vercel

- Les variables d'environnement ne sont accessibles qu'en lecture par les déploiements
- Seuls les administrateurs Vercel peuvent voir/modifier les variables
- Les branches de preview ont accès aux mêmes variables (attention en cas de PR de développeurs externes)

### Rotation des tokens

En cas de compromission suspectée :
1. Régénérer le token dans Meta Developer Console
2. Mettre à jour dans Vercel
3. Redéployer

---

## Dépannage

### Webhook verification failed (Meta refuse l'URL)

**Causes possibles :**
- Le déploiement Vercel n'est pas à jour (la route n'existe pas encore)
- La variable `WHATSAPP_VERIFY_TOKEN` n'est pas configurée dans Vercel
- Le token dans Meta ne correspond pas à celui dans Vercel
- L'URL est incorrecte (vérifier le `/api/webhooks/whatsapp` exact)

**Solution :** Vérifier que le dernier commit est déployé, puis réessayer la vérification dans Meta.

---

### Erreur 403 — Verify token invalide

Le token envoyé par Meta ne correspond pas à `WHATSAPP_VERIFY_TOKEN` dans les variables Vercel.

**Solution :** Vérifier que la valeur est identique des deux côtés (pas d'espace en trop, pas de guillemets).

---

### Erreur 503 — Webhook not configured

La variable `WHATSAPP_VERIFY_TOKEN` n'existe pas dans l'environnement Vercel.

**Solution :** Ajouter la variable et redéployer.

---

### Message reçu mais non visible dans /admin/whatsapp

**Causes possibles :**
- La migration 016 n'a pas été exécutée (table `whatsapp_webhook_events` manquante)
- Le message est un doublon (même `whatsapp_message_id` déjà reçu)
- Erreur silencieuse — vérifier `whatsapp_webhook_events` dans Supabase :
  ```sql
  SELECT * FROM whatsapp_webhook_events ORDER BY created_at DESC LIMIT 10;
  ```

---

### Signature Meta invalide (erreur 401)

**Causes possibles :**
- `META_APP_SECRET` incorrect ou pas encore configuré
- Le secret a été régénéré côté Meta mais pas mis à jour dans Vercel

**Solution :** Vérifier la valeur dans Meta → Paramètres → Base → Clé secrète, puis mettre à jour dans Vercel et redéployer.

---

### Variable Vercel manquante

Symptôme : le webhook répond 503 ou ne traite pas les messages.

**Solution :**
1. Vérifier toutes les variables dans Vercel → Settings → Environment Variables
2. S'assurer que l'environnement est `Production` (pas seulement Development)
3. Redéployer après ajout

---

### Webhook non appelé par Meta

**Causes possibles :**
- Les champs webhook ne sont pas cochés (messages non souscrit)
- L'application Meta est en mode Développement (pas Live)
- Le numéro WhatsApp n'est pas encore vérifié

**Solution :**
1. Vérifier les champs cochés dans WhatsApp → Configuration
2. Passer l'application en mode **Live** si nécessaire
3. Vérifier le statut du numéro dans WhatsApp → Numéros de téléphone

---

### Numéro WhatsApp pas encore validé

Meta exige que le numéro soit vérifié et que le Business soit approuvé pour recevoir des messages en production.

**Solution :**
- En mode développement : utiliser les numéros de test autorisés
- En production : attendre la validation Meta du Business (peut prendre 24-48h)

---

## Checklist finale

- [ ] Application Meta créée et configurée
- [ ] Numéro de téléphone vérifié dans Meta
- [ ] Phone Number ID récupéré
- [ ] Access Token permanent généré
- [ ] App Secret récupéré
- [ ] URL webhook enregistrée : `https://imprimerie.globalticgroup.com/api/webhooks/whatsapp`
- [ ] Verify Token identique entre Meta et Vercel
- [ ] Champ `messages` coché dans les abonnements webhook
- [ ] 4 variables ajoutées dans Vercel (Production)
- [ ] Redéploiement effectué après ajout des variables
- [ ] Vérification webhook réussie (pas d'erreur dans Meta)
- [ ] Message test envoyé depuis un autre téléphone
- [ ] Message visible dans `/admin/whatsapp`
- [ ] Prospect créé automatiquement si numéro inconnu
- [ ] Application passée en mode Live (pour la production)

---

## Variables d'environnement (récapitulatif)

| Variable | Où la trouver | Où la mettre |
|---|---|---|
| `WHATSAPP_VERIFY_TOKEN` | Vous la choisissez (chaîne aléatoire) | Vercel + Meta webhook config |
| `META_APP_SECRET` | Meta → Paramètres → Base → Clé secrète | Vercel uniquement |
| `WHATSAPP_ACCESS_TOKEN` | Meta → WhatsApp → Configuration API | Vercel uniquement |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta → WhatsApp → Mise en route | Vercel uniquement |
