"use server";

import {
  createAdminUserSchema,
  updateAdminUserSchema,
} from "@/lib/validators/admin-user";
import {
  getAllAdminProfiles,
  createAdminUser,
  updateAdminProfile,
  getAdminProfileById,
  countActivePatrons,
} from "@/lib/db/admin-users";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { logAdminEvent } from "@/lib/db/activity-log";
import { err, ok, type Result } from "@/lib/utils/result";
import type { AdminProfile } from "@/lib/types/domain";

export async function getAdminUsersAction(): Promise<Result<AdminProfile[]>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "admin_user:read");
  if (denied) return err(denied);

  return getAllAdminProfiles();
}

export async function createAdminUserAction(
  formData: unknown
): Promise<Result<AdminProfile>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "admin_user:create");
  if (denied) return err(denied);

  const parsed = createAdminUserSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await createAdminUser({
    fullName: parsed.data.full_name,
    email: parsed.data.email,
    password: parsed.data.password,
    role: parsed.data.role,
    isActive: parsed.data.is_active,
  });

  if (result.data) {
    await logAdminEvent(admin.data?.userId ?? null, "admin_user_cree", result.data.id, {
      email: result.data.email,
      role: result.data.role,
    });
  }

  return result;
}

export async function updateAdminUserAction(
  id: string,
  formData: unknown
): Promise<Result<AdminProfile>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "admin_user:edit");
  if (denied) return err(denied);

  if (!id) return err("Identifiant utilisateur manquant");

  const parsed = updateAdminUserSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  // Protection : empêcher de retirer le rôle patron si c'est le seul patron actif
  if (parsed.data.role && parsed.data.role !== "patron") {
    const target = await getAdminProfileById(id);
    if (target.data?.role === "patron") {
      const activePatrons = await countActivePatrons();
      if (activePatrons <= 1) {
        return err("Impossible de modifier le rôle : c'est le seul patron actif");
      }
    }
  }

  const result = await updateAdminProfile(id, parsed.data);

  if (result.data) {
    await logAdminEvent(admin.data?.userId ?? null, "admin_user_modifie", id, {
      changements: parsed.data,
    });
  }

  return result;
}

export async function toggleAdminUserAction(
  id: string,
  isActive: boolean
): Promise<Result<AdminProfile>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "admin_user:toggle");
  if (denied) return err(denied);

  if (!id) return err("Identifiant utilisateur manquant");

  // Protection : empêcher la désactivation du dernier patron actif
  if (!isActive) {
    const target = await getAdminProfileById(id);
    if (target.data?.role === "patron") {
      const activePatrons = await countActivePatrons();
      if (activePatrons <= 1) {
        return err("Impossible de désactiver le dernier patron actif");
      }
    }
  }

  // Un patron ne peut pas se désactiver lui-même
  if (!isActive && admin.data?.id === id) {
    return err("Vous ne pouvez pas désactiver votre propre accès");
  }

  const result = await updateAdminProfile(id, { is_active: isActive });

  if (result.data) {
    const action = isActive ? "admin_user_reactive" : "admin_user_desactive";
    await logAdminEvent(admin.data?.userId ?? null, action, id, {
      email: result.data.email,
    });
  }

  return result;
}
