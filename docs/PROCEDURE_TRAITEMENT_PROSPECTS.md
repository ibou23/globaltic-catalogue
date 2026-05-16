# Procédure de traitement des prospects — GLOBAL TIC

Guide opérationnel pour l'équipe commerciale.

---

## 1. Nouveau prospect reçu

Quand un prospect arrive (formulaire `/demande` ou message WhatsApp), il apparaît dans `/admin/prospects` avec le statut **nouveau** et la priorité **a_qualifier**.

**Actions immédiates (dans les 15 min) :**

1. Ouvrir la fiche prospect
2. Lire le besoin exprimé (produits demandés, message)
3. Qualifier la priorité (voir section 2)
4. Envoyer le message WhatsApp **Bienvenue** depuis la fiche
5. Cliquer **Contacté** pour enregistrer la date de premier contact

---

## 2. Qualification — Changer la priorité

| Priorité | Quand l'utiliser |
|---|---|
| **Urgent** | Client pressé, événement proche, gros volume |
| **Chaud** | Besoin clair, budget confirmé, réponse rapide du prospect |
| **A qualifier** | Nouveau prospect, besoin pas encore clair |
| **Froid** | Pas de réponse après 2 relances, projet lointain |
| **Perdu** | Refus explicite, concurrent choisi, injoignable depuis 2 semaines |

**Comment changer :** Dans la fiche prospect → section Priorité → cliquer sur le nouveau niveau.

---

## 3. Marquer "Contacté"

Cliquer le bouton **Contacté** dans la fiche prospect dès que vous avez :
- Envoyé un message WhatsApp
- Passé un appel
- Envoyé un email

Cela enregistre la date et l'heure du dernier contact. Utile pour les relances.

---

## 4. Créer un devis

Quand le besoin est clair et les détails confirmés :

1. Dans la fiche prospect → cliquer **Créer devis**
2. Le prospect passe automatiquement en statut `devis_envoye`
3. Envoyer le PDF du devis au prospect via WhatsApp
4. Créer une **tâche de relance** à J+2 (voir section 6)

---

## 5. Convertir en client

Quand le prospect a accepté un devis et passé commande :

1. Ouvrir la fiche prospect
2. Cliquer **Convertir en client**
3. Le système crée automatiquement une fiche client avec les mêmes infos
4. Le prospect passe en statut `converti`
5. Continuer le suivi depuis la fiche client

**Ne convertir que si une commande réelle est confirmée.**

---

## 6. Créer une tâche de relance

Pour ne pas oublier de relancer un prospect :

1. Dans la fiche prospect → cliquer **Créer tâche**
2. La tâche est créée avec échéance J+1 (lendemain)
3. Elle apparaît dans `/admin/taches`
4. Type : "Appeler client", priorité haute

**Quand créer une tâche :**
- Après envoi d'un devis → relance à J+2
- Après un premier contact sans réponse → relance à J+1
- Après une promesse du prospect ("je vous rappelle demain")

---

## 7. Utiliser les messages WhatsApp

Depuis la fiche prospect, un menu déroulant propose 6 modèles de messages. Cliquer ouvre WhatsApp avec le message pré-rempli.

| Modèle | Quand l'utiliser |
|---|---|
| **Bienvenue** | Premier contact avec un nouveau prospect |
| **Demande de précision** | Besoin pas clair, il manque quantité/format/délai |
| **Relance** | Pas de réponse après 24-48h |
| **Relance devis** | Devis envoyé, pas de retour après 48h |
| **Reprise de contact** | Prospect froid, dernière tentative |
| **Envoi formulaire** | Demander au prospect de remplir `/demande` |

---

## 8. Messages WhatsApp entrants

Les messages reçus sur le numéro GLOBAL TIC apparaissent dans `/admin/whatsapp`.

**Workflow :**

1. Un message arrive → notification dans le dashboard
2. Ouvrir `/admin/whatsapp`
3. Si le numéro est connu → le message est lié au prospect/client
4. Si le numéro est inconnu → cliquer **Créer prospect** (création automatique)
5. Cliquer **Répondre** pour ouvrir WhatsApp
6. Cliquer **Tâche** pour créer une relance
7. Cliquer **Traité** quand le message est géré

---

## 9. Éviter les doublons

Le système détecte automatiquement les doublons par numéro WhatsApp.

**Bonnes pratiques :**
- Avant de créer un prospect manuellement, vérifier s'il existe déjà (recherche par numéro)
- Un message WhatsApp d'un numéro déjà connu se rattache automatiquement au bon prospect
- Ne pas créer de prospect depuis `/admin/whatsapp` si le contact existe déjà — il sera lié automatiquement

---

## 10. Scripts commerciaux

### Script 1 — Envoi du lien formulaire (prospection)

> Bonjour [Nom],
>
> Ici [Votre prénom] de GLOBAL TIC, imprimerie professionnelle à Dakar.
>
> Pour vous envoyer un devis adapté à votre besoin, merci de remplir ce court formulaire :
> https://imprimerie.globalticgroup.com/demande
>
> C'est rapide (2 min) et cela nous permet de vous proposer le meilleur tarif.
>
> GLOBAL TIC

### Script 2 — Relance premier contact (J+1)

> Bonjour [Nom],
>
> Je reviens vers vous suite à votre demande d'hier.
>
> Avez-vous pu réfléchir ? Je peux vous envoyer un devis rapide si vous me confirmez la quantité souhaitée.
>
> Je reste disponible.
> [Prénom] — GLOBAL TIC

### Script 3 — Remerciement après commande

> Bonjour [Nom],
>
> Merci pour votre confiance ! Votre commande est en production.
>
> Je vous tiendrai informé de l'avancement. N'hésitez pas si vous avez des questions.
>
> À très bientôt,
> [Prénom] — GLOBAL TIC

### Script 4 — Demande de précision

> Bonjour [Nom],
>
> Merci pour votre demande. Pour vous proposer le tarif le plus juste, pourriez-vous me préciser :
> - La quantité souhaitée
> - Le format (A4, A3, personnalisé...)
> - Le délai souhaité
>
> Si vous avez un visuel ou un exemple, envoyez-le moi ici.
>
> [Prénom] — GLOBAL TIC

### Script 5 — Annonce envoi devis

> Bonjour [Nom],
>
> Suite à notre échange, voici votre devis pour [produit].
>
> [Joindre le PDF]
>
> Le devis est valable 15 jours. N'hésitez pas à me contacter pour toute question ou ajustement.
>
> Bonne réception,
> [Prénom] — GLOBAL TIC

---

## 11. Tableau récapitulatif du flux

```
Prospect reçu → Qualifier priorité → Contacter (WhatsApp)
     ↓                                       ↓
  Préciser besoin ←──── Pas clair ────→ Demande précision
     ↓
  Devis envoyé → Relance J+2 → Accepté ? → Convertir en client
                                    ↓ Non
                              Relance finale → Perdu
```

---

## 12. Rôles et accès

| Rôle | Accès prospects | Actions autorisées |
|---|---|---|
| Patron | Complet | Tout |
| Admin | Complet | Tout |
| Commercial | Lecture + édition | Qualifier, contacter, créer devis, convertir |
| Production | Aucun | — |
| Infographiste | Aucun | — |

---

## 13. Indicateurs à surveiller

Dans le dashboard `/admin` :

- **Nouveaux aujourd'hui** : flux d'entrée
- **À traiter** : prospects non contactés (ne doit jamais dépasser 5)
- **Urgents** : à traiter immédiatement
- **Convertis** : objectif commercial

**Règle d'or : aucun prospect ne doit rester sans réponse plus de 2h pendant les heures de bureau.**

---

## 14. URL du formulaire public

Le formulaire de demande est accessible à :

```
https://imprimerie.globalticgroup.com/demande
```

Ce lien peut être partagé :
- Dans les messages WhatsApp (script 1)
- Sur les réseaux sociaux
- Sur les cartes de visite (QR code)
- Par email

Le formulaire crée automatiquement un prospect dans le système.
