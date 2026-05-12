import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapProduct, mapProductWithOptions } from "./mappers";
import type { Product, ProductWithOptions } from "@/lib/types/domain";

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
