import type { AdminRole } from "@/lib/types/domain";

// Modules de navigation du dashboard
export type Module =
  | "dashboard"
  | "produits"
  | "categories"
  | "devis"
  | "commandes"
  | "clients"
  | "realisations"
  | "parametres"
  | "utilisateurs"
  | "imports"
  | "aide"
  | "maintenance"
  | "taches";

// Actions métier sensibles
export type Action =
  | "devis:create"
  | "devis:edit"
  | "devis:delete"
  | "devis:convert"
  | "commande:edit_status"
  | "commande:edit_payment"
  | "commande:upload_file"
  | "commande:delete_file"
  | "commande:bat"
  | "produit:create"
  | "produit:edit"
  | "produit:delete"
  | "categorie:create"
  | "categorie:edit"
  | "categorie:delete"
  | "realisation:create"
  | "realisation:edit"
  | "realisation:delete"
  | "client:create"
  | "client:edit"
  | "parametres:read"
  | "parametres:edit"
  | "receipt:generate"
  | "pdf:generate"
  | "admin_user:read"
  | "admin_user:create"
  | "admin_user:edit"
  | "admin_user:toggle"
  | "import:produits"
  | "import:categories"
  | "import:prix"
  | "maintenance:read"
  | "devis:force_delete"
  | "commande:force_delete"
  | "client:delete"
  | "notifications:purge"
  | "facture:generate"
  | "bl:generate"
  | "task:read"
  | "task:create"
  | "task:edit"
  | "task:delete";

// Matrice complète : role → modules accessibles
const MODULE_ACCESS: Record<Module, AdminRole[]> = {
  dashboard:    ["patron", "admin", "commercial", "production", "infographiste"],
  devis:        ["patron", "admin", "commercial"],
  commandes:    ["patron", "admin", "commercial", "production", "infographiste"],
  clients:      ["patron", "admin", "commercial"],
  produits:     ["patron", "admin"],
  categories:   ["patron", "admin"],
  realisations: ["patron", "admin"],
  parametres:   ["patron"],
  utilisateurs: ["patron"],
  imports:      ["patron", "admin"],
  aide:         ["patron", "admin", "commercial", "production", "infographiste"],
  maintenance:  ["patron"],
  taches:       ["patron", "admin", "commercial", "production", "infographiste"],
};

// Matrice complète : role → actions autorisées
const ACTION_ACCESS: Record<Action, AdminRole[]> = {
  "devis:create":           ["patron", "admin", "commercial"],
  "devis:edit":             ["patron", "admin", "commercial"],
  "devis:delete":           ["patron", "admin"],
  "devis:convert":          ["patron", "admin", "commercial"],
  "commande:edit_status":   ["patron", "admin", "production"],
  "commande:edit_payment":  ["patron", "admin"],
  "commande:upload_file":   ["patron", "admin", "production", "infographiste"],
  "commande:delete_file":   ["patron", "admin", "production"],
  "commande:bat":           ["patron", "admin", "production", "infographiste"],
  "produit:create":         ["patron", "admin"],
  "produit:edit":           ["patron", "admin"],
  "produit:delete":         ["patron", "admin"],
  "categorie:create":       ["patron", "admin"],
  "categorie:edit":         ["patron", "admin"],
  "categorie:delete":       ["patron", "admin"],
  "realisation:create":     ["patron", "admin"],
  "realisation:edit":       ["patron", "admin"],
  "realisation:delete":     ["patron", "admin"],
  "client:create":          ["patron", "admin", "commercial"],
  "client:edit":            ["patron", "admin", "commercial"],
  "parametres:read":        ["patron"],
  "parametres:edit":        ["patron"],
  "receipt:generate":       ["patron", "admin", "commercial"],
  "pdf:generate":           ["patron", "admin", "commercial"],
  "admin_user:read":        ["patron"],
  "admin_user:create":      ["patron"],
  "admin_user:edit":        ["patron"],
  "admin_user:toggle":      ["patron"],
  "import:produits":        ["patron", "admin"],
  "import:categories":      ["patron", "admin"],
  "import:prix":            ["patron", "admin"],
  "maintenance:read":       ["patron"],
  "devis:force_delete":     ["patron"],
  "commande:force_delete":  ["patron"],
  "client:delete":          ["patron"],
  "notifications:purge":    ["patron"],
  "facture:generate":       ["patron", "admin", "commercial"],
  "bl:generate":            ["patron", "admin", "commercial", "production"],
  "task:read":              ["patron", "admin", "commercial", "production", "infographiste"],
  "task:create":            ["patron", "admin", "commercial", "production"],
  "task:edit":              ["patron", "admin", "commercial", "production"],
  "task:delete":            ["patron", "admin"],
};

export function canAccessModule(role: AdminRole, module: Module): boolean {
  return MODULE_ACCESS[module].includes(role);
}

export function canPerform(role: AdminRole, action: Action): boolean {
  return ACTION_ACCESS[action].includes(role);
}

// Helper pour les Server Actions — lève une erreur Result-compatible
export function requireRole(role: AdminRole | undefined, action: Action): string | null {
  if (!role) return "Accès non autorisé";
  if (!canPerform(role, action)) return "Vous n'avez pas les droits nécessaires pour cette action";
  return null;
}
