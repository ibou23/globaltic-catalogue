import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapProspect } from "./mappers";
import { sanitizePostgrestSearchTerm } from "@/lib/utils/postgrest";
import type { Prospect } from "@/lib/types/domain";
import type { ProspectPublicInput, ProspectUpdateInput } from "@/lib/validators/prospect";

export async function getProspects(): Promise<Result<Prospect[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapProspect));
}

export async function getProspectById(id: string): Promise<Result<Prospect | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapProspect(data as Record<string, unknown>) : null);
}

export async function createProspect(
  input: ProspectPublicInput,
  reference: string
): Promise<Result<Prospect>> {
  // Service_role bypass RLS — sécurisé car appelé uniquement depuis Server Action
  // avec validation Zod + rate limiting en amont
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("prospects")
    .insert({
      reference,
      full_name: input.full_name,
      whatsapp: input.whatsapp,
      phone_secondary: input.phone_secondary ?? null,
      email: input.email ?? null,
      company_name: input.company_name ?? null,
      company_address: input.company_address ?? null,
      website: input.website ?? null,
      sector: input.sector ?? null,
      products_services: input.products_services ?? null,
      preferred_colors: input.preferred_colors ?? null,
      support_text: input.support_text ?? null,
      requested_products: input.requested_products,
      other_product: input.other_product ?? null,
      quantity: input.quantity ?? null,
      format_dimensions: input.format_dimensions ?? null,
      finish: input.finish ?? null,
      desired_deadline: input.desired_deadline ?? null,
      delivery_zone: input.delivery_zone ?? null,
      message: input.message ?? null,
      status: "nouveau",
      source: "formulaire",
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapProspect(data as Record<string, unknown>));
}

export async function updateProspect(
  id: string,
  input: ProspectUpdateInput
): Promise<Result<Prospect>> {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (input.status !== undefined) updates.status = input.status;
  if (input.internal_notes !== undefined) updates.internal_notes = input.internal_notes;
  if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to;

  const { data, error } = await supabase
    .from("prospects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapProspect(data as Record<string, unknown>));
}

export async function deleteProspect(id: string): Promise<Result<null>> {
  const supabase = await createClient();

  const { error } = await supabase.from("prospects").delete().eq("id", id);
  if (error) return err(error.message);
  return ok(null);
}

export async function searchProspects(query: string): Promise<Result<Prospect[]>> {
  const supabase = await createClient();
  const q = sanitizePostgrestSearchTerm(query);

  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .or(
      `full_name.ilike.%${q}%,company_name.ilike.%${q}%,whatsapp.ilike.%${q}%,email.ilike.%${q}%`
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapProspect));
}
