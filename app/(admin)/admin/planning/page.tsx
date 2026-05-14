import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule, canPerform } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { getOrdersEnriched } from "@/lib/db/orders";
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

  if (!admin || !canAccessModule(admin.role, "planning")) {
    return <AccessDenied />;
  }

  const result = await getOrdersEnriched();
  const allOrders = result.data ?? [];

  // Filtrer uniquement les commandes actives de production (pas livrées/annulées)
  const orders = allOrders.filter((o) => PLANNING_STATUSES.includes(o.status));

  return (
    <PlanningClient
      orders={orders}
      role={admin.role}
      canEditStatus={canPerform(admin.role, "commande:edit_status")}
      canSeeFinance={
        admin.role === "patron" ||
        admin.role === "admin" ||
        admin.role === "commercial"
      }
    />
  );
}
