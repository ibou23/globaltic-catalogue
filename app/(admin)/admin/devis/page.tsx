import { getQuotesEnriched } from "@/lib/db/quotes";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
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
  searchParams: Promise<{ status?: string }>;
}) {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "devis")) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const statusParam = VALID_STATUSES.includes(params.status as QuoteStatus)
    ? (params.status as QuoteStatus)
    : undefined;

  const result = await getQuotesEnriched();
  const allQuotes = result.data ?? [];

  const quotes = statusParam
    ? allQuotes.filter((q) => q.status === statusParam)
    : allQuotes;

  const activeFilter = statusParam
    ? {
        label: DEVIS_STATUS_LABELS[statusParam] ?? statusParam,
        count: quotes.length,
        resetHref: "/admin/devis",
      }
    : undefined;

  return <DevisClient quotes={quotes} totalCount={allQuotes.length} activeFilter={activeFilter} />;
}
