import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapOrder } from "./mappers";
import type { Order, OrderEnriched, OrderStatus } from "@/lib/types/domain";
import type { CreateOrderInput, UpdateOrderInput } from "@/lib/validators/order";

export async function getOrders(): Promise<Result<Order[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok(data.map(mapOrder));
}

export async function getOrdersEnriched(): Promise<Result<OrderEnriched[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, customers(contact_name, whatsapp, company_name)")
    .order("created_at", { ascending: false });

  if (error) return err(error.message);

  const orders: OrderEnriched[] = (data as Record<string, unknown>[]).map((row) => {
    const order = mapOrder(row);
    const customerRaw = row.customers as Record<string, unknown> | null;
    return {
      ...order,
      customer: customerRaw
        ? {
            contactName: customerRaw.contact_name as string,
            whatsapp: customerRaw.whatsapp as string,
            companyName: (customerRaw.company_name as string) ?? null,
          }
        : null,
    };
  });

  return ok(orders);
}

export async function createOrder(
  input: CreateOrderInput,
  reference: string
): Promise<Result<Order>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      reference,
      quote_id: input.quote_id,
      customer_id: input.customer_id ?? null,
      status: "confirmee" as const,
      total: input.total,
      paid_amount: 0,
      payment_status: "non_paye" as const,
      delivery_method: input.delivery_method,
      delivery_fee: 0,
      notes: input.notes ?? null,
      internal_notes: input.internal_notes ?? null,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapOrder(data));
}

export async function getOrdersByStatus(
  status: OrderStatus
): Promise<Result<Order[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok(data.map(mapOrder));
}

export async function getOrderById(
  id: string
): Promise<Result<Order | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapOrder(data) : null);
}

export async function getOrderEnrichedById(
  id: string
): Promise<Result<OrderEnriched | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, customers(contact_name, whatsapp, company_name)")
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message);
  if (!data) return ok(null);

  const row = data as Record<string, unknown>;
  const order = mapOrder(row);
  const customerRaw = row.customers as Record<string, unknown> | null;
  return ok({
    ...order,
    customer: customerRaw
      ? {
          contactName: customerRaw.contact_name as string,
          whatsapp: customerRaw.whatsapp as string,
          companyName: (customerRaw.company_name as string) ?? null,
        }
      : null,
  });
}

export async function getOrderByReference(
  reference: string
): Promise<Result<Order | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapOrder(data) : null);
}

export async function getOrdersByCustomer(
  customerId: string
): Promise<Result<Order[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok(data.map(mapOrder));
}

export async function getOrderByQuoteId(
  quoteId: string
): Promise<Result<Order | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("quote_id", quoteId)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapOrder(data) : null);
}

export async function updateOrder(
  id: string,
  input: UpdateOrderInput
): Promise<Result<Order>> {
  const supabase = await createClient();

  const previousResult = await getOrderById(id);
  const previousPaidAmount = previousResult.data?.paidAmount ?? 0;
  const hadPayment = previousPaidAmount === 0 && input.paid_amount > 0;

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: input.status,
      payment_status: input.payment_status,
      paid_amount: input.paid_amount,
      payment_method: input.payment_method ?? null,
      payment_reference: input.payment_reference ?? null,
      payment_note: input.payment_note ?? null,
      last_payment_at: hadPayment ? new Date().toISOString() : undefined,
      delivery_method: input.delivery_method,
      delivery_address: input.delivery_address ?? null,
      estimated_delivery: input.estimated_delivery ?? null,
      actual_delivery: input.actual_delivery ?? null,
      notes: input.notes ?? null,
      internal_notes: input.internal_notes ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapOrder(data));
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Result<Order>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapOrder(data));
}

export async function getActiveOrders(): Promise<Result<Order[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .not("status", "in", '("livre","annulee")')
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok(data.map(mapOrder));
}
