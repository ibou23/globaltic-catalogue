import { getQuotesEnriched } from "@/lib/db/quotes";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { DevisClient } from "@/components/admin/DevisClient";

export default async function AdminDevisPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "devis")) {
    return <AccessDenied />;
  }

  const result = await getQuotesEnriched();
  const quotes = result.data ?? [];

  return <DevisClient quotes={quotes} />;
}
