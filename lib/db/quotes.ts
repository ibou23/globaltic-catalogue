import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapQuote, mapQuoteItem } from "./mappers";
import type { Quote, QuoteItem, QuoteEnriched, QuoteStatus } from "@/lib/types/domain";
import type { CreateQuoteInput } from "@/lib/validators/quote";

export async function getQuotes(): Promise<Result<Quote[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok(data.map(mapQuote));
}

export async function getQuotesEnriched(): Promise<Result<QuoteEnriched[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .select("*, customers(contact_name, whatsapp, company_name), quote_items(product_name, quantity, unit_price, total_price)")
    .order("created_at", { ascending: false });

  if (error) return err(error.message);

  const quotes: QuoteEnriched[] = (data as Record<string, unknown>[]).map((row) => {
    const quote = mapQuote(row);
    const customerRaw = row.customers as Record<string, unknown> | null;
    const itemsRaw = Array.isArray(row.quote_items)
      ? (row.quote_items as Record<string, unknown>[])
      : [];

    return {
      ...quote,
      customer: customerRaw
        ? {
            contactName: customerRaw.contact_name as string,
            whatsapp: customerRaw.whatsapp as string,
            companyName: (customerRaw.company_name as string) ?? null,
          }
        : null,
      firstItem: itemsRaw[0]
        ? {
            productName: itemsRaw[0].product_name as string,
            quantity: itemsRaw[0].quantity as number,
            unitPrice: itemsRaw[0].unit_price as number,
            totalPrice: itemsRaw[0].total_price as number,
          }
        : null,
    };
  });

  return ok(quotes);
}

export async function getQuotesByStatus(
  status: QuoteStatus
): Promise<Result<Quote[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok(data.map(mapQuote));
}

export async function getQuoteById(
  id: string
): Promise<Result<(Quote & { items: QuoteItem[] }) | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .select("*, quote_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message);
  if (!data) return ok(null);

  const quote = mapQuote(data);
  const items = Array.isArray(data.quote_items)
    ? (data.quote_items as Record<string, unknown>[]).map(mapQuoteItem)
    : [];

  return ok({ ...quote, items });
}

export async function getQuoteByReference(
  reference: string
): Promise<Result<Quote | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapQuote(data) : null);
}

export async function createQuote(
  input: CreateQuoteInput,
  reference: string
): Promise<Result<Quote>> {
  const supabase = await createClient();

  const subtotal = input.items.reduce((sum, item) => sum + item.total_price, 0);
  const discountAmount = Math.round(subtotal * (input.discount_percent / 100));
  const total = subtotal - discountAmount;

  const { data: quoteData, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      reference,
      customer_id: input.customer_id ?? null,
      status: "brouillon" as const,
      subtotal,
      discount_percent: input.discount_percent,
      discount_amount: discountAmount,
      total,
      is_urgent: input.is_urgent,
      notes: input.notes ?? null,
      internal_notes: input.internal_notes ?? null,
    })
    .select()
    .single();

  if (quoteError) return err(quoteError.message);

  const itemsToInsert = input.items.map((item) => ({
    quote_id: quoteData.id,
    product_id: item.product_id ?? null,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    config_snapshot: item.config_snapshot,
    notes: item.notes ?? null,
  }));

  const { error: itemsError } = await supabase
    .from("quote_items")
    .insert(itemsToInsert);

  if (itemsError) return err(itemsError.message);

  return ok(mapQuote(quoteData));
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus
): Promise<Result<Quote>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapQuote(data));
}
