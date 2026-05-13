import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import type { Realisation } from "@/lib/types/domain";
import type { RealisationInput } from "@/lib/validators/realisation";

export function mapRealisation(row: any): Realisation {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    clientName: row.client_name,
    description: row.description,
    imageUrl: row.image_url,
    isFeatured: row.is_featured,
    displayOrder: row.display_order,
    createdAt: row.created_at,
  };
}

export async function getRealisations(): Promise<Result<Realisation[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("realisations")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok(data.map(mapRealisation));
}

export async function getFeaturedRealisations(): Promise<Result<Realisation[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("realisations")
    .select("*")
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok(data.map(mapRealisation));
}

export async function getRealisationById(
  id: string
): Promise<Result<Realisation | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("realisations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapRealisation(data) : null);
}

export async function createRealisation(
  input: RealisationInput
): Promise<Result<Realisation>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("realisations")
    .insert(input)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapRealisation(data));
}

export async function updateRealisation(
  id: string,
  input: Partial<RealisationInput>
): Promise<Result<Realisation>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("realisations")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapRealisation(data));
}

export async function deleteRealisation(id: string): Promise<Result<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("realisations")
    .delete()
    .eq("id", id);

  if (error) return err(error.message);
  return ok(null);
}
