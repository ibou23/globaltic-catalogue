import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { getBusinessConfig } from "@/lib/db/business-config";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ParametresClient } from "@/components/admin/ParametresClient";

export const dynamic = "force-dynamic";

export default async function AdminParametresPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "parametres")) {
    return <AccessDenied message="Seul le patron peut accéder aux paramètres." />;
  }

  const config = await getBusinessConfig();

  return <ParametresClient config={config} />;
}
