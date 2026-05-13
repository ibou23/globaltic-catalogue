import { getAllProducts } from "@/lib/db/products";
import { getAllCategories } from "@/lib/db/categories";
import { ProductsClient } from "@/components/admin/ProductsClient";

export default async function AdminProductsPage() {
  const [productsResult, categoriesResult] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
  ]);

  const products = productsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  return <ProductsClient products={products} categories={categories} />;
}
