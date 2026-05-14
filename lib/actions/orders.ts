"use server";

import { createOrderSchema, updateOrderSchema } from "@/lib/validators/order";
import { createOrder, updateOrder, getOrderByQuoteId, getOrderById } from "@/lib/db/orders";
import { getQuoteById } from "@/lib/db/quotes";
import { generateReference } from "@/lib/services/reference";
import { getCurrentAdmin } from "@/lib/db/admin";
import { logOrderEvent } from "@/lib/db/activity-log";
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
  const result = await createOrder(parsed.data, reference);

  if (result.data) {
    const admin = await getCurrentAdmin();
    await logOrderEvent(admin.data?.userId ?? null, result.data.id, "commande_creee", {
      reference: result.data.reference,
      devis: quote.reference,
      total: result.data.total,
    });
  }

  return result;
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

  // Lire l'état avant la mise à jour pour détecter les changements
  const previousResult = await getOrderById(id);
  const previous = previousResult.data;

  const result = await updateOrder(id, parsed.data);

  if (result.data && previous) {
    const admin = await getCurrentAdmin();
    const uid = admin.data?.userId ?? null;
    const order = result.data;
    const events: Array<{ action: string; meta: Record<string, unknown> }> = [];

    if (previous.status !== order.status) {
      events.push({
        action: "statut_change",
        meta: { de: previous.status, vers: order.status },
      });
    }

    if (previous.paidAmount !== order.paidAmount) {
      events.push({
        action: "paiement_mis_a_jour",
        meta: {
          montant_precedent: previous.paidAmount,
          montant_nouveau: order.paidAmount,
          statut_paiement: order.paymentStatus,
          mode: order.paymentMethod ?? null,
        },
      });
    }

    if (previous.internalNotes !== order.internalNotes && order.internalNotes) {
      events.push({ action: "note_interne_modifiee", meta: {} });
    }

    for (const { action, meta } of events) {
      await logOrderEvent(uid, id, action, meta);
    }
  }

  return result;
}
