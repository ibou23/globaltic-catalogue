import { getAllCategories } from "@/lib/db/categories";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "categories")) {
    return <AccessDenied />;
  }

  const result = await getAllCategories();
  const categories = result.data ?? [];

  return <CategoriesClient categories={categories} />;
}
