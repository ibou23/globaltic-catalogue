import { getRealisations } from "@/lib/db/realisations";
import { getAllCategories } from "@/lib/db/categories";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RealisationsClient } from "@/components/admin/RealisationsClient";

export default async function AdminRealisationsPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "realisations")) {
    return <AccessDenied />;
  }

  const [realisationsResult, categoriesResult] = await Promise.all([
    getRealisations(),
    getAllCategories(),
  ]);
  
  const realisations = realisationsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  return <RealisationsClient realisations={realisations} categories={categories} />;
}
