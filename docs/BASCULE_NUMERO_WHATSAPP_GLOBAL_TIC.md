# Bascule vers le vrai numéro WhatsApp GLOBAL TIC

---

## Situation actuelle

| Élément | État |
|---|---|
| Webhook `/api/webhooks/whatsapp` | Validé et fonctionnel |
| Vérification Meta (GET) | Testée avec succès |
| Réception messages (POST) | Testée avec succès |
| Numéro utilisé | Numéro de test Meta |
| Compte Meta Business | En examen (correction site web) |
| Dashboard `/admin/whatsapp` | Opérationnel |
| Module prospects | Opérationnel |

Le webhook fonctionne déjà avec le numéro de test Meta. Dès que la restriction sera levée, il suffira d'ajouter le vrai numéro et mettre à jour une variable dans Vercel.

---

## Étapes de bascule

### 1. Vérifications préalables

- [ ] Meta a levé la restriction sur le compte Business
- [ ] Le Business Manager est conforme (pas d'avertissement en cours)
- [ ] Le site web https://www.globalticgroup.com est accessible et cohérent
- [ ] L'application Meta Developer `GLOBAL TIC WhatsApp` est accessible
- [ ] Le webhook est toujours listé comme validé dans Meta → WhatsApp → Configuration

### 2. Ajout du vrai numéro

1. Ouvrir https://business.facebook.com → WhatsApp Manager
2. Aller dans **Numéros de téléphone**
3. Cliquer **Ajouter un numéro de téléphone**
4. Saisir le numéro GLOBAL TIC : `+221 77 619 04 19`
5. Choisir la méthode de vérification : **SMS** (recommandé)
6. Saisir le code reçu
7. Attendre la confirmation "Numéro vérifié"

**Attention :** Si ce numéro est déjà utilisé sur WhatsApp classique ou WhatsApp Business (téléphone), il faudra d'abord le déconnecter de l'application mobile. Un numéro ne peut être connecté qu'à une seule plateforme à la fois.

### 3. Récupérer le nouveau Phone Number ID

1. Dans Meta Developer Console → WhatsApp → Mise en route
2. Sélectionner le nouveau numéro dans le menu déroulant
3. Copier le **Phone Number ID** affiché (ex: `987654321098765`)
4. Ce sera la nouvelle valeur de `WHATSAPP_PHONE_NUMBER_ID`

### 4. Vérifier l'abonnement webhook

1. Aller dans Meta Developer Console → WhatsApp → Configuration
2. Vérifier que le champ **messages** est bien coché
3. Si le webhook affiche une erreur, cliquer **Vérifier et enregistrer** à nouveau

### 5. Mise à jour Vercel

1. Ouvrir le projet sur https://vercel.com
2. Aller dans **Settings** → **Environment Variables**
3. Mettre à jour :

| Variable | Action |
|---|---|
| `WHATSAPP_PHONE_NUMBER_ID` | Remplacer par le nouveau Phone Number ID |
| `WHATSAPP_ACCESS_TOKEN` | Mettre à jour si un nouveau token a été généré |
| `META_APP_SECRET` | Vérifier qu'il est toujours valide |
| `WHATSAPP_VERIFY_TOKEN` | Ne pas modifier (déjà validé) |

4. **Redéployer** : onglet Deployments → Redeploy

**Rappels sécurité :**
- Ne jamais utiliser le préfixe `NEXT_PUBLIC_`
- Ne jamais partager les tokens par email
- Ne jamais mettre les tokens dans le code source

### 6. Tests après bascule

- [ ] Envoyer un message WhatsApp depuis un autre téléphone vers le +221 77 619 04 19
- [ ] Vérifier dans Vercel Logs qu'un `POST 200 /api/webhooks/whatsapp` apparaît
- [ ] Ouvrir `/admin/whatsapp` → le message doit apparaître
- [ ] Vérifier le rattachement : si le numéro est connu → lié au prospect/client
- [ ] Si numéro inconnu → un prospect est créé automatiquement
- [ ] Cliquer "Créer prospect" sur un nouveau message → vérifier dans `/admin/prospects`
- [ ] Cliquer "Tâche" → vérifier dans `/admin/taches`
- [ ] Cliquer "Traité" → le message change de statut
- [ ] Vérifier qu'aucun token n'apparaît dans les logs Vercel (rechercher `WHATSAPP`, `META_APP`)
- [ ] Vérifier qu'aucune erreur de signature n'apparaît dans `whatsapp_webhook_events`

---

## Risques identifiés

| Risque | Impact | Mitigation |
|---|---|---|
| Restriction Meta encore active | Impossible d'ajouter le numéro | Attendre la levée — ne rien forcer |
| Numéro déjà sur WhatsApp mobile | Conflit de connexion | Déconnecter le numéro de l'app mobile avant de l'ajouter |
| Mauvais Phone Number ID dans Vercel | Messages non reçus | Vérifier la valeur exacte dans Meta Developer Console |
| Webhook non abonné à `messages` | Aucun message transmis | Vérifier les champs cochés dans la configuration webhook |
| Token expiré | 401 sur les appels API sortants | Pas bloquant pour la réception (webhook), mais à régénérer pour l'envoi futur |
| Application Meta non publiée (mode Dev) | Seuls les numéros de test reçoivent | Passer l'app en mode **Live** dans Meta Developer Console |
| Limites du mode test | Max 5 destinataires / message simulé | Se résout en passant en mode Live |
| Changement d'App Secret côté Meta | Signature webhook invalide (401) | Mettre à jour `META_APP_SECRET` dans Vercel et redéployer |

---

## Décision de bascule

| Critère | Statut |
|---|---|
| Restriction Meta levée | ☐ Oui / ☐ Non |
| Numéro réel +221 77 619 04 19 ajouté et vérifié | ☐ Oui / ☐ Non |
| Phone Number ID mis à jour dans Vercel | ☐ Oui / ☐ Non |
| Webhook validé (pas d'erreur Meta) | ☐ Oui / ☐ Non |
| Message test reçu dans `/admin/whatsapp` | ☐ Oui / ☐ Non |
| Prospect créé automatiquement | ☐ Oui / ☐ Non |
| Dashboard prêt | ☐ Oui / ☐ Non |
| Aucun token dans les logs | ☐ Oui / ☐ Non |

**Décision :**

- ☐ **Bascule validée** — le système est opérationnel avec le vrai numéro
- ☐ **Bascule reportée** — raison : ___________________________

---

## Calendrier estimé

| Étape | Durée estimée |
|---|---|
| Levée restriction Meta | Variable (24h à 7 jours) |
| Ajout numéro + vérification | 10 minutes |
| Mise à jour Vercel + redeploy | 5 minutes |
| Tests complets | 15 minutes |
| **Total après levée restriction** | **~30 minutes** |

---

## Référence

- Guide complet de configuration : [CONFIGURATION_WHATSAPP_CLOUD_API.md](./CONFIGURATION_WHATSAPP_CLOUD_API.md)
- Meta Developer Console : https://developers.facebook.com
- WhatsApp Manager : https://business.facebook.com → WhatsApp
- Webhook URL : `https://imprimerie.globalticgroup.com/api/webhooks/whatsapp`
