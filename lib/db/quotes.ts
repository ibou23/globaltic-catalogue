import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { computeQuoteDiscounts } from "@/lib/utils/discount";
import { mapQuote, mapQuoteItem } from "./mappers";
import type { Quote, QuoteItem, QuoteEnriched, QuoteStatus } from "@/lib/types/domain";
import type { CreateQuoteInput, UpdateQuoteInput } from "@/lib/validators/quote";

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
    .select("*, customers(contact_name, whatsapp, company_name), quote_items(id, product_name, quantity, unit_price, total_price, discount_percent, config_snapshot)")
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
            id: itemsRaw[0].id as string,
            productName: itemsRaw[0].product_name as string,
            quantity: itemsRaw[0].quantity as number,
            unitPrice: itemsRaw[0].unit_price as number,
            totalPrice: itemsRaw[0].total_price as number,
            configSnapshot: (itemsRaw[0].config_snapshot as Record<string, unknown>) ?? {},
          }
        : null,
      itemsCount: itemsRaw.length,
    };
  });

  return ok(quotes);
}

export async function getQuotesEnrichedByCustomer(
  customerId: string
): Promise<Result<QuoteEnriched[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quotes")
    .select("*, customers(contact_name, whatsapp, company_name), quote_items(id, product_name, quantity, unit_price, total_price, discount_percent, config_snapshot)")
    .eq("customer_id", customerId)
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
            id: itemsRaw[0].id as string,
            productName: itemsRaw[0].product_name as string,
            quantity: itemsRaw[0].quantity as number,
            unitPrice: itemsRaw[0].unit_price as number,
            totalPrice: itemsRaw[0].total_price as number,
            configSnapshot: (itemsRaw[0].config_snapshot as Record<string, unknown>) ?? {},
          }
        : null,
      itemsCount: itemsRaw.length,
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
    .or(`reference.eq.${reference},legacy_reference.eq.${reference}`)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapQuote(data) : null);
}

export async function createQuote(
  input: CreateQuoteInput,
  reference: string
): Promise<Result<Quote>> {
  const supabase = await createClient();

  const calc = computeQuoteDiscounts(
    input.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unit_price,
      discountPercent: item.discount_percent ?? 0,
    })),
    input.global_discount_type,
    input.global_discount_value ?? 0
  );
  const subtotal = calc.subtotal;
  const globalDiscountType = calc.globalDiscountType;
  const globalDiscountValue = calc.globalDiscountValue;
  const globalDiscountAmount = calc.globalDiscountAmount;
  const total = calc.total;

  const { data: quoteData, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      reference,
      customer_id: input.customer_id ?? null,
      status: "brouillon" as const,
      subtotal,
      discount_percent: input.discount_percent,
      discount_amount: 0,
      global_discount_type: globalDiscountType,
      global_discount_value: globalDiscountValue,
      global_discount_amount: globalDiscountAmount,
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
    discount_percent: item.discount_percent ?? 0,
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

export async function updateQuote(
  id: string,
  input: UpdateQuoteInput
): Promise<Result<Quote>> {
  const supabase = await createClient();

  const calc = computeQuoteDiscounts(
    input.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unit_price,
      discountPercent: item.discount_percent ?? 0,
    })),
    input.global_discount_type,
    input.global_discount_value ?? 0
  );

  const { data: quoteData, error: quoteError } = await supabase
    .from("quotes")
    .update({
      status: input.status,
      subtotal: calc.subtotal,
      discount_percent: input.discount_percent,
      discount_amount: 0,
      global_discount_type: calc.globalDiscountType,
      global_discount_value: calc.globalDiscountValue,
      global_discount_amount: calc.globalDiscountAmount,
      total: calc.total,
      is_urgent: input.is_urgent,
      notes: input.notes ?? null,
      internal_notes: input.internal_notes ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (quoteError) return err(quoteError.message);

  // Supprimer les anciennes lignes et reinseerer
  const { error: deleteError } = await supabase
    .from("quote_items")
    .delete()
    .eq("quote_id", id);

  if (deleteError) return err(deleteError.message);

  const itemsToInsert = input.items.map((item) => ({
    quote_id: id,
    product_id: item.product_id ?? null,
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    discount_percent: item.discount_percent ?? 0,
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

export async function deleteQuote(id: string): Promise<Result<null>> {
  const supabase = await createClient();

  // quote_items supprimes en CASCADE par la FK
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) return err(error.message);
  return ok(null);
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
