import { getRoleModuleAccess } from "@/lib/db/menu-config";
import { getRoleActionPermissions } from "@/lib/db/action-permissions";
import { canAccessModuleDynamic, canPerform } from "@/lib/auth/permissions";
import type { Module, Action } from "@/lib/auth/permissions";
import type { AdminRole } from "@/lib/types/domain";

/**
 * Vérifie l'accès module côté serveur en tenant compte des surcharges DB.
 * Fallback vers la matrice hardcoded si la table est vide ou inaccessible.
 */
export async function checkModuleAccess(role: AdminRole, module: Module): Promise<boolean> {
  if (role === "patron") return true;

  const result = await getRoleModuleAccess();
  const overrides = (result.data ?? []).map((entry) => ({
    role: entry.role,
    moduleKey: entry.moduleKey,
    canAccess: entry.canAccess,
  }));

  return canAccessModuleDynamic(role, module, overrides);
}

/**
 * Vérifie une permission action côté serveur en tenant compte des surcharges DB.
 * Fallback vers la matrice hardcoded si la table est vide ou inaccessible.
 */
export async function checkActionPermission(role: AdminRole, action: Action): Promise<boolean> {
  if (role === "patron") return true;

  const result = await getRoleActionPermissions();
  const overrides = result.data ?? [];

  const override = overrides.find(
    (o) => o.role === role && o.actionKey === action
  );

  if (override !== undefined) return override.canPerform;

  return canPerform(role, action);
}

/**
 * Comme requireRole mais dynamique (async).
 * Retourne un message d'erreur si l'action est refusée, null si autorisée.
 */
export async function requireActionDynamic(
  role: AdminRole | undefined,
  action: Action
): Promise<string | null> {
  if (!role) return "Accès non autorisé";
  const allowed = await checkActionPermission(role, action);
  if (!allowed) return "Vous n'avez pas les droits nécessaires pour cette action";
  return null;
}
