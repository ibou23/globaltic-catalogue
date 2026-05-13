import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapProduct, mapProductWithOptions } from "./mappers";
import type { Product, ProductWithOptions } from "@/lib/types/domain";
import type { ProductInput, QuantityTierInput } from "@/lib/validators/product";

const PRODUCT_WITH_OPTIONS_SELECT = `
  *,
  categories(*),
  product_formats(*),
  product_papers(*),
  product_finishes(*),
  product_quantity_tiers(*)
`;

export async function getProducts(): Promise<Result<Product[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) return err(error.message);
  return ok(data.map(mapProduct));
}

export async function getAllProducts(): Promise<Result<Product[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) return err(error.message);
  return ok(data.map(mapProduct));
}

export async function getProductsByCategory(
  categoryId: string
): Promise<Result<Product[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) return err(error.message);
  return ok(data.map(mapProduct));
}

export async function getPopularProducts(): Promise<Result<Product[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_popular", true)
    .order("display_order", { ascending: true });

  if (error) return err(error.message);
  return ok(data.map(mapProduct));
}

export async function getProductBySlug(
  slug: string
): Promise<Result<ProductWithOptions | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_OPTIONS_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapProductWithOptions(data) : null);
}

export async function getProductById(
  id: string
): Promise<Result<ProductWithOptions | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_WITH_OPTIONS_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapProductWithOptions(data) : null);
}

export async function searchProducts(
  query: string
): Promise<Result<Product[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .or(`name.ilike.%${query}%,short_description.ilike.%${query}%,tags.cs.{${query}}`)
    .order("display_order", { ascending: true })
    .limit(20);

  if (error) return err(error.message);
  return ok(data.map(mapProduct));
}

export async function createProduct(
  input: ProductInput
): Promise<Result<Product>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapProduct(data));
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<Result<Product>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapProduct(data));
}

export async function deleteProduct(id: string): Promise<Result<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) return err(error.message);
  return ok(null);
}

export async function replaceQuantityTiers(
  productId: string,
  tiers: Omit<QuantityTierInput, "product_id">[]
): Promise<Result<null>> {
  const supabase = await createClient();

  const { error: delError } = await supabase
    .from("product_quantity_tiers")
    .delete()
    .eq("product_id", productId);

  if (delError) return err(delError.message);

  if (tiers.length > 0) {
    const rows = tiers.map((t) => ({ ...t, product_id: productId }));
    const { error: insError } = await supabase
      .from("product_quantity_tiers")
      .insert(rows);

    if (insError) return err(insError.message);
  }

  return ok(null);
}
