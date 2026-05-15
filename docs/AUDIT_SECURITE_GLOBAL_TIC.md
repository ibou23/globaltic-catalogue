# Audit de sécurité — GLOBAL TIC PrintTech

**Plateforme :** GLOBAL TIC PrintTech Admin  
**Version :** 2.46  
**Date de l'audit :** 14 mai 2026  
**Auditeur :** Claude Sonnet 4.6  
**Statut :** Corrections hautes et moyennes appliquées

---

## Évaluation globale

```
🟡 ACCEPTABLE — Problèmes hauts corrigés, pas de risque immédiat d'exposition de données
```

Avant corrections : **🟠 À AMÉLIORER**  
Après corrections : **🟡 ACCEPTABLE**

---

## Résumé des conclusions

| # | Sévérité | Catégorie | Statut |
|---|----------|-----------|--------|
| 1 | HAUTE | Middleware non actif (proxy.ts) | ✅ Corrigé — clarification |
| 2 | HAUTE | Injection PostgREST dans `.or()` / ilike | ✅ Corrigé |
| 3 | MOYENNE | Absence de headers HTTP de sécurité | ✅ Corrigé |
| 4 | MOYENNE | Validation de démarrage vars env | ✅ Corrigé |
| 5 | MOYENNE | Absence de rate limiting | ⏳ Phase séparée |
| 6 | BASSE | dangerouslySetInnerHTML résiduel | ⏳ À surveiller |
| 7 | BASSE | CVE postcss moderate (via Next.js) | ⏳ Attendre mise à jour Next.js |

---

## Détail des corrections appliquées

---

### Conclusion #1 — Middleware (proxy.ts) — HAUTE

**Statut : ✅ CLARIFICATION — proxy.ts était déjà actif**

**Constat révisé :**  
L'audit initial signalait l'absence de `middleware.ts`. En réalité, Next.js 16.2.6 reconnaît **`proxy.ts`** à la racine comme fichier middleware (convention documentée `middleware-to-proxy`). La tentative de création d'un `middleware.ts` supplémentaire a produit l'erreur de build :

```
Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected.
Please use "./proxy.ts" only.
```

`proxy.ts` est confirmé actif — visible dans le build sous la section `Proxy (Middleware)`. Il protège :
- `/admin` → redirection `/login` si non authentifié
- `/api/admin` → retourne 401 si non authentifié
- `/login` → redirection `/admin` si déjà connecté

Utilise `supabase.auth.getUser()` (validation serveur stricte).

**Fichiers concernés :** `proxy.ts` (inchangé, déjà correct)

---

### Conclusion #2 — Injection PostgREST dans `.or()` — HAUTE

**Statut : ✅ Corrigé**

**Problème :**  
6 appels `.or()` avec interpolation directe de chaînes utilisateur non sanitisées. La syntaxe PostgREST accepte des virgules comme séparateurs de clauses — un attaquant pouvait injecter des clauses supplémentaires.

Exemple d'attaque :
```
Requête : a%,reference.ilike.%
Filtre résultant : contact_name.ilike.%a%,reference.ilike.%%
→ Retourne tous les enregistrements
```

Cas `tags.cs.{${query}}` dans `products.ts` : l'opérateur `cs` (contains) sur tableau PostgreSQL avec une valeur arbitraire pouvait causer des erreurs de parse.

**Correction :**  
Création du helper `lib/utils/postgrest.ts` :

```typescript
export function sanitizePostgrestSearchTerm(input: string, maxLength = 100): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[,(){}'"\\]/g, "");
}
```

Suppression de `tags.cs.{${query}}` (clause tableau non sanitisable simplement).

**Fichiers modifiés :**
- `lib/utils/postgrest.ts` — CRÉÉ
- `lib/db/global-search.ts` — sanitisation appliquée sur `q` (4 occurrences `.or()`)
- `lib/db/customers.ts` — sanitisation appliquée sur `searchCustomers()`
- `lib/db/products.ts` — sanitisation appliquée, clause `tags.cs` supprimée

---

### Conclusion #3 — Headers HTTP de sécurité — MOYENNE

**Statut : ✅ Corrigé**

**Problème :**  
`next.config.ts` ne configurait aucun header de sécurité HTTP, exposant l'application au clickjacking, MIME sniffing et fuite de Referer.

**Correction :**  
Ajout dans `next.config.ts` :

```typescript
const securityHeaders = [
  { key: "X-Content-Type-Options",  value: "nosniff" },
  { key: "X-Frame-Options",         value: "DENY" },
  { key: "X-XSS-Protection",        value: "0" },
  { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
];
```

**Note :** Content-Security-Policy (CSP) non ajouté intentionnellement — nécessite une phase dédiée pour ne pas bloquer Supabase Storage, les fonts Google, les scripts analytics tiers et le rendu PDF.

**Fichiers modifiés :** `next.config.ts`

---

### Conclusion #4 — Validation de démarrage des variables Supabase — MOYENNE

**Statut : ✅ Corrigé**

**Problème :**  
`lib/supabase/server.ts` utilisait l'opérateur `!` (non-null assertion TypeScript) sur les variables d'environnement. En cas de variable absente, l'application démarrait avec `undefined` et produisait des erreurs cryptiques à l'exécution.

**Correction :**  
Remplacement de l'assertion `!` par une garde explicite dans `lib/supabase/server.ts` :

```typescript
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  throw new Error(
    "Variables d'environnement Supabase manquantes (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)"
  );
}
```

`lib/supabase/admin-client.ts` avait déjà une garde correcte pour `SUPABASE_SERVICE_ROLE_KEY` — inchangé.

**Fichiers modifiés :** `lib/supabase/server.ts`

---

## Résultats du build après corrections

```
✅ Compiled successfully in 20.1s
✅ TypeScript — 0 erreur
✅ 8/8 pages statiques générées
✅ Toutes les routes dynamiques compilées
✅ Proxy (Middleware) actif — proxy.ts reconnu
```

Routes vérifiées :
- `/admin` — ✅ Dynamic, protégé par layout + middleware
- `/api/admin/commandes/[id]/facture` — ✅ Dynamic
- `/api/admin/commandes/[id]/receipt` — ✅ Dynamic
- `/api/admin/devis/[id]/pdf` — ✅ Dynamic
- `/api/admin/rapports/pdf` — ✅ Dynamic

---

## Ce qui n'a PAS été modifié (intentionnellement)

- **Rate limiting** — prévu dans une phase séparée
- **Content-Security-Policy** — à traiter dans une phase dédiée (risque de casser Supabase/analytics)
- **CVE postcss** — dépend d'une future mise à jour Next.js, `npm audit fix --force` casserait Next.js
- **dangerouslySetInnerHTML** dans `app/(site)/layout.tsx` — données 100% statiques, risque résiduel nul aujourd'hui
- **Toutes les fonctionnalités métier** — aucune modification du workflow commande/devis/PDF/storage

---

## Ce qui était déjà bien fait (confirmé par l'audit)

- `getUser()` utilisé partout (jamais `getSession()` seul)
- RLS activé sur les 20 tables avec `WITH CHECK` sur tous les INSERT/UPDATE
- `SUPABASE_SERVICE_ROLE_KEY` jamais exposé côté client ni dans git
- `.env.local` non commité (contrairement à une lecture incorrecte initiale)
- Zod sur 19/21 Server Actions
- Upload fichiers : whitelist MIME + limite 20 Mo
- Buckets Storage correctement configurés (order-files privé, catalog-images public-read)
- Suppressions de données protégées par mot de confirmation + rôle patron
- `console.log` uniquement en mode `development`
- `package-lock.json` présent et commité

---

## Points restants (non bloquants)

| Point | Sévérité | Action recommandée |
|-------|----------|-------------------|
| Rate limiting | MOYENNE | Implémenter via Vercel Dashboard ou Upstash |
| Content-Security-Policy | MOYENNE | Phase dédiée, tester avec Supabase/analytics |
| postcss CVE moderate | BASSE | Attendre Next.js > 16.3.0 |
| dangerouslySetInnerHTML | BASSE | Ne pas dynamiser sans sanitisation |

---

*Audit effectué dans le cadre de la Phase 2.46 — Sécurité GLOBAL TIC PrintTech.*  
*Corrections appliquées le 14 mai 2026.*
