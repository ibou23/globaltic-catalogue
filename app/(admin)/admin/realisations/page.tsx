import { getRealisations } from "@/lib/db/realisations";
import { RealisationsClient } from "@/components/admin/RealisationsClient";

export default async function AdminRealisationsPage() {
  const result = await getRealisations();
  const realisations = result.data ?? [];

  return <RealisationsClient realisations={realisations} />;
}
