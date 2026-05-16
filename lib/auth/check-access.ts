import { getRoleModuleAccess } from "@/lib/db/menu-config";
import { canAccessModuleDynamic } from "@/lib/auth/permissions";
import type { Module } from "@/lib/auth/permissions";
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
