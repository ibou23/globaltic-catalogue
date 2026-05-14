import { getCurrentAdmin } from "@/lib/db/admin";
import { getAdminProfiles } from "@/lib/db/admin";
import { canAccessModule, canPerform } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { getImpayeRows } from "@/lib/db/impayes";
import { ImpayesClient } from "@/components/admin/ImpayesClient";

export const dynamic = "force-dynamic";

export default async function AdminImpayesPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "impayes")) {
    return <AccessDenied />;
  }

  const [rowsResult, profilesResult] = await Promise.all([
    getImpayeRows(),
    getAdminProfiles(),
  ]);

  return (
    <ImpayesClient
      rows={rowsResult.data ?? []}
      adminProfiles={profilesResult.data ?? []}
      role={admin.role}
      canCreateTask={canPerform(admin.role, "task:create")}
    />
  );
}
