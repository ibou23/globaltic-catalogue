import { getCurrentAdmin } from "@/lib/db/admin";
import { getMenuConfig, getRoleModuleAccess } from "@/lib/db/menu-config";
import { getRoleActionPermissions } from "@/lib/db/action-permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { PermissionsClient } from "@/components/admin/PermissionsClient";
import { DEFAULT_MODULE_ACCESS, DEFAULT_ACTION_ACCESS } from "@/lib/auth/permissions";
import type { AdminRole } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

const ALL_ROLES: AdminRole[] = ["patron", "admin", "commercial", "production", "infographiste"];

export default async function AdminPermissionsPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || admin.role !== "patron") {
    return <AccessDenied message="Seul le patron peut gérer les permissions." />;
  }

  const [menuResult, accessResult, actionResult] = await Promise.all([
    getMenuConfig(),
    getRoleModuleAccess(),
    getRoleActionPermissions(),
  ]);

  const menuConfig = menuResult.data ?? [];
  const roleAccess = accessResult.data ?? [];
  const actionPermissions = actionResult.data ?? [];

  const defaultAccess: Record<string, Record<string, boolean>> = {};
  for (const [module, roles] of Object.entries(DEFAULT_MODULE_ACCESS)) {
    defaultAccess[module] = {};
    for (const role of ALL_ROLES) {
      defaultAccess[module][role] = roles.includes(role);
    }
  }

  const defaultActions: Record<string, Record<string, boolean>> = {};
  for (const [action, roles] of Object.entries(DEFAULT_ACTION_ACCESS)) {
    defaultActions[action] = {};
    for (const role of ALL_ROLES) {
      defaultActions[action][role] = roles.includes(role);
    }
  }

  return (
    <PermissionsClient
      menuConfig={menuConfig}
      roleAccess={roleAccess}
      defaultAccess={defaultAccess}
      roles={ALL_ROLES}
      actionPermissions={actionPermissions}
      defaultActions={defaultActions}
    />
  );
}
