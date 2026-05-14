import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapCustomer } from "./mappers";
import type { Customer } from "@/lib/types/domain";
import type { CustomerInput } from "@/lib/validators/customer";

export async function getCustomers(): Promise<Result<Customer[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok(data.map(mapCustomer));
}

export async function getCustomerById(
  id: string
): Promise<Result<Customer | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapCustomer(data) : null);
}

export async function getCustomerByWhatsapp(
  whatsapp: string
): Promise<Result<Customer | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("whatsapp", whatsapp)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapCustomer(data) : null);
}

export async function createCustomer(
  input: CustomerInput
): Promise<Result<Customer>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .insert(input)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapCustomer(data));
}

export async function updateCustomer(
  id: string,
  input: Partial<CustomerInput>
): Promise<Result<Customer>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapCustomer(data));
}

export async function searchCustomers(
  query: string
): Promise<Result<Customer[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .or(
      `contact_name.ilike.%${query}%,company_name.ilike.%${query}%,whatsapp.ilike.%${query}%,email.ilike.%${query}%`
    )
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return err(error.message);
  return ok(data.map(mapCustomer));
}

export async function updateCustomerNotes(
  id: string,
  notes: string
): Promise<Result<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("customers")
    .update({ notes })
    .eq("id", id);

  if (error) return err(error.message);
  return ok(null);
}

export async function getCustomerLinkedCount(
  id: string
): Promise<{ quotes: number; orders: number }> {
  const supabase = await createClient();

  const [quotesResult, ordersResult] = await Promise.all([
    supabase.from("quotes").select("id", { count: "exact", head: true }).eq("customer_id", id),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("customer_id", id),
  ]);

  return {
    quotes: quotesResult.count ?? 0,
    orders: ordersResult.count ?? 0,
  };
}

export async function deleteCustomer(id: string): Promise<Result<null>> {
  const supabase = await createClient();

  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return err(error.message);
  return ok(null);
}
