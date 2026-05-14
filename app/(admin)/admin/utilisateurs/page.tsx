import { getCurrentAdmin } from "@/lib/db/admin";
import { getAllAdminProfiles } from "@/lib/db/admin-users";
import { canAccessModule } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { UtilisateursClient } from "@/components/admin/UtilisateursClient";

export default async function AdminUtilisateursPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "utilisateurs")) {
    return <AccessDenied />;
  }

  const result = await getAllAdminProfiles();
  const profiles = result.data ?? [];

  return <UtilisateursClient profiles={profiles} currentAdminId={admin.id} />;
}
