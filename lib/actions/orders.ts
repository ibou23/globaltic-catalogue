"use server";

import { createOrderSchema, updateOrderSchema } from "@/lib/validators/order";
import { createOrder, updateOrder, getOrderByQuoteId } from "@/lib/db/orders";
import { getQuoteById } from "@/lib/db/quotes";
import { generateReference } from "@/lib/services/reference";
import { err, type Result } from "@/lib/utils/result";
import type { Order } from "@/lib/types/domain";

export async function convertQuoteToOrderAction(
  quoteId: string
): Promise<Result<Order>> {
  if (!quoteId) return err("Identifiant du devis manquant");

  const quoteResult = await getQuoteById(quoteId);
  if (!quoteResult.data) {
    return err(quoteResult.error ?? "Devis introuvable");
  }

  const quote = quoteResult.data;

  if (quote.status !== "accepte") {
    return err("Seuls les devis acceptés peuvent être convertis en commande");
  }

  // Empêcher la double conversion
  const existingResult = await getOrderByQuoteId(quoteId);
  if (existingResult.data) {
    return err(`Une commande existe déjà pour ce devis (${existingResult.data.reference})`);
  }

  const parsed = createOrderSchema.safeParse({
    quote_id: quote.id,
    customer_id: quote.customerId,
    total: quote.total,
    notes: quote.notes,
    internal_notes: null,
    delivery_method: "retrait",
  });

  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const reference = await generateReference("CMD");
  return createOrder(parsed.data, reference);
}

export async function updateOrderAction(
  id: string,
  formData: unknown
): Promise<Result<Order>> {
  if (!id) return err("Identifiant de la commande manquant");
  const parsed = updateOrderSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }
  return updateOrder(id, parsed.data);
}
