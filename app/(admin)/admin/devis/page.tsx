import { getQuotesEnriched } from "@/lib/db/quotes";
import { DevisClient } from "@/components/admin/DevisClient";

export default async function AdminDevisPage() {
  const result = await getQuotesEnriched();
  const quotes = result.data ?? [];

  return <DevisClient quotes={quotes} />;
}
