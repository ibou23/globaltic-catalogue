import { getCurrentAdmin } from "@/lib/db/admin";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { canPerform } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { getInvoices } from "@/lib/db/invoices";
import { FacturesClient } from "@/components/admin/FacturesClient";

export const dynamic = "force-dynamic";

export default async function AdminFacturesPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !(await checkModuleAccess(admin.role, "factures"))) {
    return <AccessDenied />;
  }

  const result = await getInvoices();
  const invoices = result.data ?? [];

  return (
    <FacturesClient
      invoices={invoices}
      role={admin.role}
      canEdit={canPerform(admin.role, "facture:generate")}
    />
  );
}
