import { getProspectsWithFileFlags } from "@/lib/db/prospects";
import { getCurrentAdmin } from "@/lib/db/admin";
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

  const result = await getProspectsWithFileFlags();
  const prospects = result.data ?? [];

  return (
    <ProspectBriefClient
      prospects={prospects}
      canEdit={await checkActionPermission(admin.role, "prospect:edit")}
    />
  );
}
