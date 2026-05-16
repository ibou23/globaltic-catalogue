import { getCurrentAdmin } from "@/lib/db/admin";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { canPerform } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { getOrdersEnriched } from "@/lib/db/orders";
import { getQualityChecksByOrderIds } from "@/lib/db/quality-checks";
import { PlanningClient } from "@/components/admin/PlanningClient";

export const dynamic = "force-dynamic";

// Statuts pertinents pour le planning de production
const PLANNING_STATUSES = [
  "confirmee",
  "bat_en_cours",
  "bat_valide",
  "en_production",
  "controle_qualite",
  "pret",
  "en_livraison",
];

export default async function AdminPlanningPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !(await checkModuleAccess(admin.role, "planning"))) {
    return <AccessDenied />;
  }

  const result = await getOrdersEnriched();
  const allOrders = result.data ?? [];

  const orders = allOrders.filter((o) => PLANNING_STATUSES.includes(o.status));

  const orderIds = orders.map((o) => o.id);
  const qcResult = await getQualityChecksByOrderIds(orderIds);
  const qcMap    = qcResult.data ?? new Map();

  const canSeeFinance =
    admin.role === "patron" || admin.role === "admin" || admin.role === "commercial";

  return (
    <PlanningClient
      orders={orders}
      qcMap={qcMap}
      role={admin.role}
      canEditStatus={canPerform(admin.role, "commande:edit_status")}
      canSeeFinance={canSeeFinance}
    />
  );
}
