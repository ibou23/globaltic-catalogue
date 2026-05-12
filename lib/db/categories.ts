import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapCategory } from "./mappers";
import type { Category } from "@/lib/types/domain";

export async function getCategories(): Promise<Result<Category[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) return err(error.message);
  return ok(data.map(mapCategory));
}

export async function getCategoryBySlug(
  slug: string
): Promise<Result<Category | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapCategory(data) : null);
}

export async function getCategoryById(
  id: string
): Promise<Result<Category | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapCategory(data) : null);
}
