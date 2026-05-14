import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RapportsClient } from "@/components/admin/RapportsClient";

export const dynamic = "force-dynamic";

export default async function AdminRapportsPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "rapports")) {
    return <AccessDenied message="Accès réservé au patron et aux administrateurs." />;
  }

  const showFinance = admin.role === "patron" || admin.role === "admin";

  return <RapportsClient role={admin.role} showFinance={showFinance} />;
}
