import { getProspectsWithFileFlags } from "@/lib/db/prospects";
import { getCurrentAdmin, getAdminProfiles } from "@/lib/db/admin";
import { checkModuleAccess, checkActionPermission } from "@/lib/auth/check-access";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ProspectBriefClient } from "@/components/admin/ProspectBriefClient";

export const dynamic = "force-dynamic";

export default async function AdminProspectsBriefPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !(await checkModuleAccess(admin.role, "prospects"))) {
    return <AccessDenied />;
  }

  const canAccessBrief = await checkActionPermission(admin.role, "prospect:brief");
  if (!canAccessBrief) {
    return <AccessDenied />;
  }

  const [prospectsResult, profilesResult] = await Promise.all([
    getProspectsWithFileFlags(),
    getAdminProfiles(),
  ]);

  return (
    <ProspectBriefClient
      prospects={prospectsResult.data ?? []}
      adminProfiles={profilesResult.data ?? []}
      canEdit={await checkActionPermission(admin.role, "prospect:edit")}
    />
  );
}
