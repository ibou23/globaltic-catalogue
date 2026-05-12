import { createClient } from "@/lib/supabase/server";
import { mapCategory, mapProduct, mapProductWithOptions } from "./mappers";
import {
  getFallbackCategories,
  getFallbackProducts,
  getFallbackProductsByCategory,
  getFallbackPopularProducts,
  getFallbackProductBySlug,
  getFallbackCategoryBySlug,
  getFallbackRealisations,
  getFallbackRealisationCategories,
  type FallbackRealisation,
} from "./fallback";
import { products as rawProducts } from "@/data/products";
import type { Category, Product, ProductWithOptions } from "@/lib/types/domain";

const PRODUCT_WITH_OPTIONS_SELECT = `
  *,
  categories(*),
  product_formats(*),
  product_papers(*),
  product_finishes(*),
  product_quantity_tiers(*)
`;

export async function getSafeCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return getFallbackCategories();
    }
    return data.map(mapCategory);
  } catch {
    return getFallbackCategories();
  }
}

export async function getSafeCategoryBySlug(
  slug: string
): Promise<Category | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return getFallbackCategoryBySlug(slug);
    }
    return mapCategory(data);
  } catch {
    return getFallbackCategoryBySlug(slug);
  }
}

export async function getSafeProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return getFallbackProducts();
    }
    return data.map(mapProduct);
  } catch {
    return getFallbackProducts();
  }
}

export async function getSafeProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return getFallbackProductsByCategory(categoryId);
    }
    return data.map(mapProduct);
  } catch {
    return getFallbackProductsByCategory(categoryId);
  }
}

export async function getSafePopularProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_popular", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return getFallbackPopularProducts();
    }
    return data.map(mapProduct);
  } catch {
    return getFallbackPopularProducts();
  }
}

export async function getSafeProductBySlug(
  slug: string
): Promise<ProductWithOptions | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_WITH_OPTIONS_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return getFallbackProductBySlug(slug);
    }
    return mapProductWithOptions(data);
  } catch {
    return getFallbackProductBySlug(slug);
  }
}

export async function getSafeRealisations(): Promise<FallbackRealisation[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("realisations")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return getFallbackRealisations();
    }
    return data.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      category: row.category as string,
      imageUrl: row.image_url as string,
      client: (row.client_name as string) ?? null,
    }));
  } catch {
    return getFallbackRealisations();
  }
}

export async function getSafeRealisationCategories(): Promise<string[]> {
  try {
    const realisations = await getSafeRealisations();
    const cats = new Set(realisations.map((r) => r.category));
    return ["Tous", ...Array.from(cats).sort()];
  } catch {
    return getFallbackRealisationCategories();
  }
}

export async function getSafeMinPrices(
  products: Product[]
): Promise<Record<string, number>> {
  try {
    const supabase = await createClient();
    const productIds = products.map((p) => p.id);

    const { data, error } = await supabase
      .from("product_quantity_tiers")
      .select("product_id, base_unit_price, min_qty")
      .in("product_id", productIds)
      .order("min_qty", { ascending: true });

    if (error || !data || data.length === 0) {
      return getStaticMinPrices(products);
    }

    const prices: Record<string, number> = {};
    for (const row of data) {
      const pid = row.product_id as string;
      if (!(pid in prices)) {
        prices[pid] = row.base_unit_price as number;
      }
    }
    return prices;
  } catch {
    return getStaticMinPrices(products);
  }
}

function getStaticMinPrices(products: Product[]): Record<string, number> {
  const prices: Record<string, number> = {};
  for (const product of products) {
    const raw = rawProducts.find((p) => p.id === product.id);
    prices[product.id] = raw?.quantityTiers[0]?.baseUnitPrice ?? 0;
  }
  return prices;
}
