import { getAllProducts } from "@/lib/db/products";
import { getAllCategories } from "@/lib/db/categories";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ProductsClient } from "@/components/admin/ProductsClient";

export default async function AdminProductsPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "produits")) {
    return <AccessDenied />;
  }

  const [productsResult, categoriesResult] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  const products = productsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  return <ProductsClient products={products} categories={categories} />;
}
