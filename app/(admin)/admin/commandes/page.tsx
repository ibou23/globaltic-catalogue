import { getOrdersEnriched } from "@/lib/db/orders";
import { getInvoicesByOrderIds } from "@/lib/db/invoices";
import { getQualityChecksByOrderIds } from "@/lib/db/quality-checks";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule, canPerform } from "@/lib/auth/permissions";
import { getConfigValue } from "@/lib/db/business-config";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { CommandesClient } from "@/components/admin/CommandesClient";
import type { OrderStatus } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

const ORDER_STATUS_LABELS: Record<string, string> = {
  en_attente:       "En attente",
  confirmee:        "Confirmées",
  bat_en_cours:     "BAT en cours",
  bat_valide:       "BAT validé",
  en_production:    "En production",
  controle_qualite: "Contrôle qualité",
  pret:             "Prêtes",
  en_livraison:     "En livraison",
  livre:            "Livrées",
  annulee:          "Annulées",
};

const VALID_STATUSES: OrderStatus[] = [
  "en_attente", "confirmee", "bat_en_cours", "bat_valide",
  "en_production", "controle_qualite", "pret", "en_livraison", "livre", "annulee",
];

export default async function AdminCommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment?: string; filter?: string; client?: string }>;
}) {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "commandes")) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const statusParam = VALID_STATUSES.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : undefined;
  const paymentParam = params.payment;
  const filterParam = params.filter;
  const clientParam = params.client?.trim() || undefined;

  const result = await getOrdersEnriched();
  const allOrders = result.data ?? [];

  const orderIds = allOrders.map((o) => o.id);
  const [invoicesResult, qcResult, googleReviewUrl] = await Promise.all([
    getInvoicesByOrderIds(orderIds),
    getQualityChecksByOrderIds(orderIds),
    getConfigValue("google_review_url"),
  ]);
  const invoicesMap = invoicesResult.data ?? new Map();
  const qcMap       = qcResult.data       ?? new Map();

  let orders = allOrders;
  let filterLabel = "";

  if (statusParam) {
    orders = allOrders.filter((o) => o.status === statusParam);
    filterLabel = ORDER_STATUS_LABELS[statusParam] ?? statusParam;
  } else if (paymentParam === "paid") {
    orders = allOrders.filter((o) => o.paidAmount > 0 && o.total - o.paidAmount <= 0);
    filterLabel = "Totalement payées";
  } else if (paymentParam === "remaining") {
    orders = allOrders.filter((o) => o.total - o.paidAmount > 0 && o.status !== "annulee");
    filterLabel = "Solde à encaisser";
  } else if (paymentParam === "unpaid") {
    orders = allOrders.filter((o) => o.paidAmount === 0 && o.status !== "annulee");
    filterLabel = "Non payées";
  } else if (filterParam === "a_traiter") {
    orders = allOrders.filter((o) => !["livre", "annulee"].includes(o.status));
    filterLabel = "À traiter";
  }
  if (clientParam) {
    orders = orders.filter((o) => o.customer?.whatsapp === clientParam);
    filterLabel = filterLabel ? `${filterLabel} · Client ${clientParam}` : `Client ${clientParam}`;
  }

  const activeFilter =
    statusParam || paymentParam || filterParam || clientParam
      ? { label: filterLabel, count: orders.length, resetHref: "/admin/commandes" }
      : undefined;

  const canSeeFinance =
    admin.role === "patron" || admin.role === "admin" || admin.role === "commercial";

  return (
    <CommandesClient
      orders={orders}
      invoicesMap={invoicesMap}
      qcMap={qcMap}
      role={admin.role}
      totalCount={allOrders.length}
      activeFilter={activeFilter}
      canDelete={canPerform(admin.role, "commande:force_delete")}
      canFacture={canPerform(admin.role, "facture:generate")}
      canBL={canPerform(admin.role, "bl:generate")}
      canSeeFinance={canSeeFinance}
      googleReviewUrl={googleReviewUrl}
    />
  );
}
