import { getRealisations } from "@/lib/db/realisations";
import { getAllCategories } from "@/lib/db/categories";
import { RealisationsClient } from "@/components/admin/RealisationsClient";

export default async function AdminRealisationsPage() {
  const [realisationsResult, categoriesResult] = await Promise.all([
    getRealisations(),
    getAllCategories(),
  ]);
  
  const realisations = realisationsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  return <RealisationsClient realisations={realisations} categories={categories} />;
}
