# Permissions dynamiques par action

## Architecture

Le systeme de permissions fines par action permet au patron d'ajuster dynamiquement les droits de chaque role sur des operations specifiques, sans deploiement de code.

### Schema de decision

```
Action demandee
  |
  v
Role = patron ? --> OUI --> Autorise (toujours)
  |
  NON
  |
  v
Override DB existe pour (role, action) ? --> OUI --> Appliquer override.can_perform
  |
  NON
  |
  v
Fallback vers DEFAULT_ACTION_ACCESS (matrice statique)
```

## Table Supabase

```sql
-- supabase/migrations/018_role_action_permissions.sql
CREATE TABLE role_action_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('patron','admin','commercial','production','infographiste')),
  action_key TEXT NOT NULL,
  can_perform BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(role, action_key)
);
```

RLS : patron peut ecrire, tous les admins authentifies peuvent lire.

## Fichiers cles

| Fichier | Role |
|---------|------|
| `lib/auth/check-access.ts` | `checkActionPermission()`, `requireActionDynamic()` |
| `lib/auth/permissions.ts` | `DEFAULT_ACTION_ACCESS`, `canPerform()` (fallback statique) |
| `lib/db/action-permissions.ts` | CRUD vers la table `role_action_permissions` |
| `lib/actions/permissions.ts` | Server Actions d'admin (`updateActionPermissionsAction`, `resetActionPermissionsAction`) |
| `components/admin/PermissionsClient.tsx` | UI onglet "Actions par role" |
| `app/(admin)/admin/permissions/page.tsx` | Page d'administration |

## Actions protegees

Toutes les Server Actions dans `lib/actions/` utilisent `requireActionDynamic()` :

| Module | Actions |
|--------|---------|
| Devis | `devis:create`, `devis:edit`, `devis:convert` |
| Commandes | `commande:edit_status`, `commande:edit_payment`, `commande:upload_file`, `commande:delete_file`, `commande:bat` |
| Factures | `facture:generate` |
| Clients | `client:create`, `client:edit`, `client:delete` |
| Prospects | `prospect:edit`, `prospect:delete` |
| Produits | `produit:create`, `produit:edit`, `produit:delete` |
| Categories | `categorie:create`, `categorie:edit`, `categorie:delete` |
| Realisations | `realisation:create`, `realisation:edit`, `realisation:delete` |
| Taches | `task:create`, `task:edit`, `task:delete` |
| Import CSV | `import:categories`, `import:produits`, `import:prix` |
| Utilisateurs | `admin_user:create`, `admin_user:edit`, `admin_user:toggle`, `admin_user:read` |
| Maintenance | `devis:force_delete`, `commande:force_delete`, `client:delete`, `notifications:purge` |
| Parametres | `parametres:edit` |

## Actions critiques (non retirables au patron)

- `admin_user:create`
- `admin_user:edit`
- `admin_user:toggle`
- `devis:force_delete`
- `commande:force_delete`
- `parametres:edit`

## Securite

- Le role `patron` a toujours acces a toutes les actions (bypass dans `checkActionPermission`)
- Un non-patron ne peut pas modifier les permissions (RLS + guard serveur)
- Journalisation de chaque modification de permission
- Double verification : l'UI masque les boutons ET le serveur bloque l'execution
