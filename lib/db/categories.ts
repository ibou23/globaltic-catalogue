import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapCategory } from "./mappers";
import type { Category } from "@/lib/types/domain";
import type { CategoryInput } from "@/lib/validators/product";

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

export async function getAllCategories(): Promise<Result<Category[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
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

export async function createCategory(
  input: CategoryInput
): Promise<Result<Category>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .insert(input)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapCategory(data));
}

export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>
): Promise<Result<Category>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapCategory(data));
}

export async function deleteCategory(id: string): Promise<Result<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) return err(error.message);
  return ok(null);
}
