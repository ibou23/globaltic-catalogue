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
  | "parametres";

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
  | "parametres:read"
  | "receipt:generate"
  | "pdf:generate";

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
  "parametres:read":        ["patron"],
  "receipt:generate":       ["patron", "admin", "commercial"],
  "pdf:generate":           ["patron", "admin", "commercial"],
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
