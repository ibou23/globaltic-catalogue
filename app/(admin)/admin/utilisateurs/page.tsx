import { getCurrentAdmin } from "@/lib/db/admin";
import { getAllAdminProfiles } from "@/lib/db/admin-users";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { UtilisateursClient } from "@/components/admin/UtilisateursClient";

export const dynamic = "force-dynamic";

export default async function AdminUtilisateursPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !(await checkModuleAccess(admin.role, "utilisateurs"))) {
    return <AccessDenied />;
  }

  const result = await getAllAdminProfiles();
  const profiles = result.data ?? [];

  return <UtilisateursClient profiles={profiles} currentAdminId={admin.id} />;
}
