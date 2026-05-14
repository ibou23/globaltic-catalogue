import { getAllProducts } from "@/lib/db/products";
import { getAllCategories } from "@/lib/db/categories";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ProductsClient } from "@/components/admin/ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; popular?: string; category?: string }>;
}) {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "produits")) {
    return <AccessDenied />;
  }

  const params = await searchParams;

  const [productsResult, categoriesResult] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  const allProducts = productsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  let products = allProducts;
  const labelParts: string[] = [];

  if (params.status === "active") {
    products = products.filter((p) => p.isActive);
    labelParts.push("Actifs");
  } else if (params.status === "inactive") {
    products = products.filter((p) => !p.isActive);
    labelParts.push("Inactifs");
  }

  if (params.popular === "true") {
    products = products.filter((p) => p.isPopular);
    labelParts.push("Populaires");
  }

  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category);
    if (cat) {
      products = products.filter((p) => p.categoryId === cat.id);
      labelParts.push(cat.name);
    }
  }

  const activeFilter =
    labelParts.length > 0
      ? { label: labelParts.join(" · "), count: products.length, resetHref: "/admin/produits" }
      : undefined;

  return (
    <ProductsClient
      products={products}
      categories={categories}
      totalCount={allProducts.length}
      activeFilter={activeFilter}
    />
  );
}
