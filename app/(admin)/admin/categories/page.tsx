import { getAllCategories } from "@/lib/db/categories";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export default async function AdminCategoriesPage() {
  const result = await getAllCategories();
  const categories = result.data ?? [];

  return <CategoriesClient categories={categories} />;
}
