"use server";

import { getCurrentAdmin } from "@/lib/db/admin";
import { updateMenuOrder, updateRoleModuleAccess, resetMenuOrder, resetRoleAccess } from "@/lib/db/menu-config";
import { updateRoleActionPermissions, resetRoleActionPermissions } from "@/lib/db/action-permissions";
import { logAdminEvent } from "@/lib/db/activity-log";
import { isCriticalModule } from "@/lib/auth/permissions";
import { err, ok, type Result } from "@/lib/utils/result";
import type { Module } from "@/lib/auth/permissions";

function requirePatron(role: string | undefined): string | null {
  if (role !== "patron") return "Seul le patron peut modifier les permissions";
  return null;
}

export async function updateMenuOrderAction(
  items: { moduleKey: string; sortOrder: number }[]
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  const denied = requirePatron(admin.data.role);
  if (denied) return err(denied);

  const result = await updateMenuOrder(items, admin.data.userId);

  if (!result.error) {
    await logAdminEvent(admin.data.userId, "menu_order_updated", null, {
      items: items.length,
    });
  }

  return result;
}

export async function updateRoleAccessAction(
  entries: { role: string; moduleKey: string; canAccess: boolean }[]
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  const denied = requirePatron(admin.data.role);
  if (denied) return err(denied);

  // Protection: impossible de retirer l'accès du patron
  const patronEntries = entries.filter((e) => e.role === "patron");
  if (patronEntries.some((e) => !e.canAccess)) {
    return err("Impossible de retirer les droits du patron");
  }

  // Protection: les modules critiques ne peuvent être accordés qu'aux rôles autorisés par le patron
  for (const entry of entries) {
    if (isCriticalModule(entry.moduleKey as Module) && entry.canAccess && entry.role !== "patron") {
      // Autorisé — le patron accorde explicitement
    }
  }

  const result = await updateRoleModuleAccess(entries, admin.data.userId);

  if (!result.error) {
    await logAdminEvent(admin.data.userId, "role_access_updated", null, {
      changes: entries.length,
      roles: [...new Set(entries.map((e) => e.role))],
    });
  }

  return result;
}

export async function resetMenuOrderAction(): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  const denied = requirePatron(admin.data.role);
  if (denied) return err(denied);

  const result = await resetMenuOrder(admin.data.userId);

  if (!result.error) {
    await logAdminEvent(admin.data.userId, "menu_order_reset", null);
  }

  return result;
}

export async function resetRoleAccessAction(): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  const denied = requirePatron(admin.data.role);
  if (denied) return err(denied);

  const result = await resetRoleAccess(admin.data.userId);

  if (!result.error) {
    await logAdminEvent(admin.data.userId, "role_access_reset", null);
  }

  return result;
}

export async function updateActionPermissionsAction(
  entries: { role: string; actionKey: string; canPerform: boolean }[]
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  const denied = requirePatron(admin.data.role);
  if (denied) return err(denied);

  const patronEntries = entries.filter((e) => e.role === "patron");
  if (patronEntries.some((e) => !e.canPerform)) {
    return err("Impossible de retirer les droits du patron");
  }

  const result = await updateRoleActionPermissions(entries, admin.data.userId);

  if (!result.error) {
    await logAdminEvent(admin.data.userId, "action_permissions_updated", null, {
      changes: entries.length,
      roles: [...new Set(entries.map((e) => e.role))],
    });
  }

  return result;
}

export async function resetActionPermissionsAction(): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  const denied = requirePatron(admin.data.role);
  if (denied) return err(denied);

  const result = await resetRoleActionPermissions(admin.data.userId);

  if (!result.error) {
    await logAdminEvent(admin.data.userId, "action_permissions_reset", null);
  }

  return result;
}
