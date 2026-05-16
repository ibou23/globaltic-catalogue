import { getQuotesEnriched } from "@/lib/db/quotes";
import { getCurrentAdmin } from "@/lib/db/admin";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { canPerform } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { DevisClient } from "@/components/admin/DevisClient";
import type { QuoteStatus } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

const DEVIS_STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillons",
  envoye:    "Devis envoyés",
  accepte:   "Devis acceptés",
  refuse:    "Devis refusés",
  expire:    "Devis expirés",
};

const VALID_STATUSES: QuoteStatus[] = ["brouillon", "envoye", "accepte", "refuse", "expire"];

export default async function AdminDevisPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; client?: string }>;
}) {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !(await checkModuleAccess(admin.role, "devis"))) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const statusParam = VALID_STATUSES.includes(params.status as QuoteStatus)
    ? (params.status as QuoteStatus)
    : undefined;
  const clientParam = params.client?.trim() || undefined;

  const result = await getQuotesEnriched();
  const allQuotes = result.data ?? [];

  let quotes = allQuotes;
  let filterLabel = "";

  if (statusParam) {
    quotes = quotes.filter((q) => q.status === statusParam);
    filterLabel = DEVIS_STATUS_LABELS[statusParam] ?? statusParam;
  }
  if (clientParam) {
    quotes = quotes.filter((q) => q.customer?.whatsapp === clientParam);
    filterLabel = filterLabel ? `${filterLabel} · Client ${clientParam}` : `Client ${clientParam}`;
  }

  const activeFilter =
    statusParam || clientParam
      ? { label: filterLabel, count: quotes.length, resetHref: "/admin/devis" }
      : undefined;

  return (
    <DevisClient
      quotes={quotes}
      totalCount={allQuotes.length}
      activeFilter={activeFilter}
      canDelete={canPerform(admin.role, "devis:force_delete")}
    />
  );
}
