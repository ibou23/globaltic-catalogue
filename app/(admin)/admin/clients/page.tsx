import { getCustomers } from "@/lib/db/customers";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule, canPerform } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ClientsClient } from "@/components/admin/ClientsClient";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "clients")) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const result = await getCustomers();
  const allCustomers = result.data ?? [];

  let customers = allCustomers;
  let filterLabel = "";

  if (params.type === "recent") {
    // 30 derniers jours
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    customers = allCustomers.filter((c) => new Date(c.createdAt) >= cutoff);
    filterLabel = "Nouveaux (30 jours)";
  }
  // Les filtres "avec_commandes" et "avec_solde" nécessitent des jointures
  // non disponibles dans getCustomers() — on les réserve pour une future phase

  const activeFilter =
    filterLabel
      ? { label: filterLabel, count: customers.length, resetHref: "/admin/clients" }
      : undefined;

  return (
    <ClientsClient
      customers={customers}
      totalCount={allCustomers.length}
      activeFilter={activeFilter}
      canEdit={canPerform(admin.role, "client:edit")}
    />
  );
}
