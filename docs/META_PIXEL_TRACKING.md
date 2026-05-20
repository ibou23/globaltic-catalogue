# Meta Pixel Tracking - GLOBAL TIC

## Pixel ID

`989212627079878`

## Installation

Le pixel est installé **une seule fois** dans `app/layout.tsx` via `next/script` (strategy: afterInteractive).

- `fbq('init', '989212627079878')` -- initialisation
- `fbq('track', 'PageView')` -- automatique sur chaque page
- Fallback `<noscript>` inclus

**Important** : ne pas ajouter de second script pixel (ni dans `Tracking.tsx`, ni via Meta Event Setup Tool).

## Événements standards configurés

| Événement | Déclencheur | Fichier |
|-----------|-------------|---------|
| `PageView` | Chaque page (layout global) | `app/layout.tsx` |
| `ViewContent` | Page produit + page catalogue catégorie | `ProductCalculator.tsx`, `CatalogueClient.tsx` |
| `Contact` | Clic sur tout bouton WhatsApp | `ProductCalculator.tsx`, `StickyWhatsApp.tsx` |
| `Lead` | Soumission réussie formulaire /demande | `DemandeForm.tsx` |

## Payloads envoyés

### ViewContent (produit)

```json
{
  "content_name": "Flyers A5",
  "content_category": "Impression offset",
  "content_type": "product",
  "content_ids": ["flyers-a5"],
  "currency": "XOF",
  "value": 25
}
```

### ViewContent (catégorie catalogue)

```json
{
  "content_name": "Grand format",
  "content_category": "catalogue",
  "content_ids": ["grand-format"],
  "content_type": "product_group"
}
```

### Contact

```json
{
  "content_name": "Flyers A5",
  "content_category": "Impression offset",
  "source": "whatsapp"
}
```

### Lead

```json
{
  "content_name": "Demande de devis",
  "content_category": "formulaire",
  "source": "demande_form"
}
```

## Helper technique

Fichier : `lib/tracking/meta-pixel.ts`

Fonctions exportées :
- `trackViewContent(payload)` -- dédupliqué par slug/session
- `trackContact(payload)`
- `trackLead(payload)`
- `trackCustomEvent(name, payload)`

Sécurités intégrées :
- `typeof window !== "undefined"` avant tout appel
- `window.fbq` vérifié
- try/catch silencieux si pixel bloqué
- Dédoublonnage ViewContent par clé `slug`

## Événements custom legacy (transition)

Ces événements sont envoyés en parallèle via `lib/analytics.ts` (trackCustom) :
- `view_item` -- sur page produit
- `whatsapp_conversion` -- sur clic WhatsApp

Ils n'interfèrent pas avec les standards car envoyés via `fbq('trackCustom', ...)`.
Ils peuvent être supprimés une fois les campagnes Meta Ads migrées sur les standards.

## Procédure de test

1. Ouvrir **Meta Events Manager** > Événements de test
2. Entrer l'URL du site dans "Tester les événements du navigateur"
3. Naviguer sur le site et vérifier :

| Action | Événement attendu |
|--------|-------------------|
| Accueil | `PageView` |
| Page produit | `PageView` + `ViewContent` |
| Page catalogue catégorie | `PageView` + `ViewContent` |
| Clic WhatsApp (produit ou flottant) | `Contact` |
| Soumission formulaire /demande réussie | `Lead` |

## Recommandations

- **Ne pas utiliser l'Event Setup Tool** pour recréer ViewContent, Contact ou Lead -- ils sont déjà gérés par le code
- Le "50% terminé" dans Meta Events Manager est normal tant que la Conversions API (CAPI) n'est pas connectée -- les événements côté navigateur fonctionnent indépendamment
- Pour améliorer le matching : envisager la Conversions API (server-side) à terme

## Checklist avant lancement campagne

- [ ] Pixel installé et actif (vérifier avec Meta Pixel Helper extension Chrome)
- [ ] `PageView` reçu dans Events Manager
- [ ] `ViewContent` reçu sur pages produit
- [ ] `Contact` reçu sur clic WhatsApp
- [ ] `Lead` reçu après formulaire réussi
- [ ] Aucun doublon visible (un seul pixel fire par page)
- [ ] Event Setup Tool désactivé / pas d'événements dupliqués
- [ ] Domaine vérifié dans Meta Business Suite
- [ ] Événements agrégés configurés (priorité : Lead > Contact > ViewContent > PageView)
