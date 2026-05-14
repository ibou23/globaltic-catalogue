import { getOrdersEnriched } from "@/lib/db/orders";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { CommandesClient } from "@/components/admin/CommandesClient";

export default async function AdminCommandesPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "commandes")) {
    return <AccessDenied />;
  }

  const result = await getOrdersEnriched();
  const orders = result.data ?? [];

  return <CommandesClient orders={orders} role={admin.role} />;
}
