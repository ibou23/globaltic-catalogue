import { getCurrentAdmin } from "@/lib/db/admin";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ImportsClient } from "@/components/admin/ImportsClient";

export const dynamic = "force-dynamic";

export default async function AdminImportsPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;
  if (!admin || !(await checkModuleAccess(admin.role, "imports"))) {
    return <AccessDenied message="Accès réservé au patron et à l'administrateur." />;
  }
  return <ImportsClient />;
}
