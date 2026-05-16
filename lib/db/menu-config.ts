import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import type { Module } from "@/lib/auth/permissions";
import type { AdminRole } from "@/lib/types/domain";

export interface MenuConfigItem {
  moduleKey: Module;
  label: string;
  sortOrder: number;
  isEnabled: boolean;
  isSystem: boolean;
}

export interface RoleModuleAccess {
  role: AdminRole;
  moduleKey: Module;
  canAccess: boolean;
}

export async function getMenuConfig(): Promise<Result<MenuConfigItem[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_menu_config")
    .select("module_key, label, sort_order, is_enabled, is_system")
    .order("sort_order", { ascending: true });

  if (error) return err(error.message);

  return ok(
    (data ?? []).map((row) => ({
      moduleKey: row.module_key as Module,
      label: row.label as string,
      sortOrder: row.sort_order as number,
      isEnabled: row.is_enabled as boolean,
      isSystem: row.is_system as boolean,
    }))
  );
}

export async function getRoleModuleAccess(): Promise<Result<RoleModuleAccess[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("role_module_access")
    .select("role, module_key, can_access");

  if (error) return err(error.message);

  return ok(
    (data ?? []).map((row) => ({
      role: row.role as AdminRole,
      moduleKey: row.module_key as Module,
      canAccess: row.can_access as boolean,
    }))
  );
}

export async function updateMenuOrder(
  items: { moduleKey: string; sortOrder: number }[],
  userId: string
): Promise<Result<null>> {
  const supabase = await createClient();

  for (const item of items) {
    const { error } = await supabase
      .from("admin_menu_config")
      .update({ sort_order: item.sortOrder, updated_at: new Date().toISOString(), updated_by: userId })
      .eq("module_key", item.moduleKey);

    if (error) return err(error.message);
  }

  return ok(null);
}

export async function updateRoleModuleAccess(
  entries: { role: string; moduleKey: string; canAccess: boolean }[],
  userId: string
): Promise<Result<null>> {
  const supabase = await createClient();

  for (const entry of entries) {
    const { error } = await supabase
      .from("role_module_access")
      .upsert(
        {
          role: entry.role,
          module_key: entry.moduleKey,
          can_access: entry.canAccess,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        },
        { onConflict: "role,module_key" }
      );

    if (error) return err(error.message);
  }

  return ok(null);
}

export async function resetMenuOrder(userId: string): Promise<Result<null>> {
  const DEFAULT_ORDER: Record<string, number> = {
    dashboard: 1, prospects: 2, whatsapp: 3, clients: 4, devis: 5,
    commandes: 6, planning: 7, taches: 8, impayes: 9, factures: 10,
    rapports: 11, produits: 12, categories: 13, realisations: 14,
    imports: 15, parametres: 16, utilisateurs: 17, maintenance: 18, aide: 19,
  };

  const items = Object.entries(DEFAULT_ORDER).map(([moduleKey, sortOrder]) => ({
    moduleKey,
    sortOrder,
  }));

  return updateMenuOrder(items, userId);
}

export async function resetRoleAccess(userId: string): Promise<Result<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("role_module_access")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) return err(error.message);
  return ok(null);
}
