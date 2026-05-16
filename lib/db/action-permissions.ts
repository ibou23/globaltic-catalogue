import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import type { Action } from "@/lib/auth/permissions";
import type { AdminRole } from "@/lib/types/domain";

export interface RoleActionPermission {
  role: AdminRole;
  actionKey: Action;
  canPerform: boolean;
}

export async function getRoleActionPermissions(): Promise<Result<RoleActionPermission[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("role_action_permissions")
    .select("role, action_key, can_perform");

  if (error) return err(error.message);

  return ok(
    (data ?? []).map((row) => ({
      role: row.role as AdminRole,
      actionKey: row.action_key as Action,
      canPerform: row.can_perform as boolean,
    }))
  );
}

export async function updateRoleActionPermissions(
  entries: { role: string; actionKey: string; canPerform: boolean }[],
  userId: string
): Promise<Result<null>> {
  const supabase = await createClient();

  for (const entry of entries) {
    const { error } = await supabase
      .from("role_action_permissions")
      .upsert(
        {
          role: entry.role,
          action_key: entry.actionKey,
          can_perform: entry.canPerform,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        },
        { onConflict: "role,action_key" }
      );

    if (error) return err(error.message);
  }

  return ok(null);
}

export async function resetRoleActionPermissions(userId: string): Promise<Result<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("role_action_permissions")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) return err(error.message);
  return ok(null);
}
