import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapOrder } from "./mappers";
import type { Order, OrderStatus } from "@/lib/types/domain";

export async function getOrders(): Promise<Result<Order[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok(data.map(mapOrder));
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
