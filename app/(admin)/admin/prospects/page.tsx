import { getProspects } from "@/lib/db/prospects";
import { getCurrentAdmin } from "@/lib/db/admin";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { getUntreatedProspectsAlert } from "@/lib/services/auto-tasks";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ProspectsClient } from "@/components/admin/ProspectsClient";
import type { ProspectStatus } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

const VALID_STATUSES: ProspectStatus[] = [
  "nouveau", "devis_envoye", "en_negociation", "validation_conception",
  "commande_confirmee", "en_production", "livre", "annule",
];

export default async function AdminProspectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !(await checkModuleAccess(admin.role, "prospects"))) {
    return <AccessDenied />;
  }

  const params = await searchParams;
  const statusParam = VALID_STATUSES.includes(params.status as ProspectStatus)
    ? (params.status as ProspectStatus)
    : undefined;

  const [result, untreatedAlert] = await Promise.all([
    getProspects(),
    getUntreatedProspectsAlert(),
  ]);
  const allProspects = result.data ?? [];

  let prospects = allProspects;
  let filterLabel = "";

  if (statusParam) {
    prospects = allProspects.filter((p) => p.status === statusParam);
    filterLabel = statusParam;
  }

  const activeFilter = statusParam
    ? { label: filterLabel, count: prospects.length, resetHref: "/admin/prospects" }
    : undefined;

  return (
    <ProspectsClient
      prospects={prospects}
      totalCount={allProspects.length}
      activeFilter={activeFilter}
      role={admin.role}
      untreatedAlert={untreatedAlert}
    />
  );
}
