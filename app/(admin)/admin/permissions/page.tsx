import { getCurrentAdmin } from "@/lib/db/admin";
import { getMenuConfig, getRoleModuleAccess } from "@/lib/db/menu-config";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { PermissionsClient } from "@/components/admin/PermissionsClient";
import { DEFAULT_MODULE_ACCESS } from "@/lib/auth/permissions";
import type { AdminRole } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

const ALL_ROLES: AdminRole[] = ["patron", "admin", "commercial", "production", "infographiste"];

export default async function AdminPermissionsPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || admin.role !== "patron") {
    return <AccessDenied message="Seul le patron peut gérer les permissions." />;
  }

  const [menuResult, accessResult] = await Promise.all([
    getMenuConfig(),
    getRoleModuleAccess(),
  ]);

  const menuConfig = menuResult.data ?? [];
  const roleAccess = accessResult.data ?? [];

  // Construire la matrice par défaut
  const defaultAccess: Record<string, Record<string, boolean>> = {};
  for (const [module, roles] of Object.entries(DEFAULT_MODULE_ACCESS)) {
    defaultAccess[module] = {};
    for (const role of ALL_ROLES) {
      defaultAccess[module][role] = roles.includes(role);
    }
  }

  return (
    <PermissionsClient
      menuConfig={menuConfig}
      roleAccess={roleAccess}
      defaultAccess={defaultAccess}
      roles={ALL_ROLES}
    />
  );
}
