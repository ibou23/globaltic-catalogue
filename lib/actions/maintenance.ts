"use server";

import { z } from "zod";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { getOrderByQuoteId } from "@/lib/db/orders";
import { deleteQuote } from "@/lib/db/quotes";
import { deleteOrder } from "@/lib/db/orders";
import { deleteCustomer, getCustomerLinkedCount } from "@/lib/db/customers";
import { logMaintenanceEvent, deleteReadNotifications } from "@/lib/db/activity-log";
import { checkRateLimitSafe } from "@/lib/security/rate-limit";
import { err, ok, type Result } from "@/lib/utils/result";

const CONFIRM_WORD = "SUPPRIMER";

const deleteQuoteSchema = z.object({
  quoteId: z.string().uuid(),
  confirmation: z.literal(CONFIRM_WORD, {
    errorMap: () => ({ message: `Tapez ${CONFIRM_WORD} pour confirmer` }),
  }),
});

const deleteOrderSchema = z.object({
  orderId: z.string().uuid(),
  confirmation: z.literal(CONFIRM_WORD, {
    errorMap: () => ({ message: `Tapez ${CONFIRM_WORD} pour confirmer` }),
  }),
});

const deleteCustomerSchema = z.object({
  customerId: z.string().uuid(),
  confirmation: z.literal(CONFIRM_WORD, {
    errorMap: () => ({ message: `Tapez ${CONFIRM_WORD} pour confirmer` }),
  }),
});

export async function deleteQuoteAction(formData: unknown): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "devis:force_delete");
  if (denied) return err(denied);

  const rateLimitError = await checkRateLimitSafe("maintenance", admin.data!.userId);
  if (rateLimitError) return err(rateLimitError);

  const parsed = deleteQuoteSchema.safeParse(formData);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const { quoteId } = parsed.data;

  // Bloquer si déjà converti en commande
  const existingOrder = await getOrderByQuoteId(quoteId);
  if (existingOrder.data) {
    return err(
      `Ce devis a déjà été converti en commande (${existingOrder.data.reference}). Supprimez la commande d'abord.`
    );
  }

  const result = await deleteQuote(quoteId);
  if (result.error) return err(result.error);

  await logMaintenanceEvent(
    admin.data?.userId ?? null,
    "devis_supprime_maintenance",
    "quote",
    quoteId,
    { operator: admin.data?.fullName ?? "patron" }
  );

  return ok(null);
}

export async function deleteOrderAction(formData: unknown): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "commande:force_delete");
  if (denied) return err(denied);

  const rateLimitError = await checkRateLimitSafe("maintenance", admin.data!.userId);
  if (rateLimitError) return err(rateLimitError);

  const parsed = deleteOrderSchema.safeParse(formData);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const { orderId } = parsed.data;

  const result = await deleteOrder(orderId);
  if (result.error) return err(result.error);

  await logMaintenanceEvent(
    admin.data?.userId ?? null,
    "commande_supprimee_maintenance",
    "order",
    orderId,
    { operator: admin.data?.fullName ?? "patron" }
  );

  return ok(null);
}

export async function deleteCustomerAction(formData: unknown): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "client:delete");
  if (denied) return err(denied);

  const rateLimitError = await checkRateLimitSafe("maintenance", admin.data!.userId);
  if (rateLimitError) return err(rateLimitError);

  const parsed = deleteCustomerSchema.safeParse(formData);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const { customerId } = parsed.data;

  // Bloquer si le client a des commandes ou devis
  const linked = await getCustomerLinkedCount(customerId);
  if (linked.orders > 0) {
    return err(
      `Ce client a ${linked.orders} commande${linked.orders > 1 ? "s" : ""}. Supprimez-les d'abord.`
    );
  }
  if (linked.quotes > 0) {
    return err(
      `Ce client a ${linked.quotes} devis. Supprimez-les d'abord.`
    );
  }

  const result = await deleteCustomer(customerId);
  if (result.error) return err(result.error);

  await logMaintenanceEvent(
    admin.data?.userId ?? null,
    "client_supprime_maintenance",
    "customer",
    customerId,
    { operator: admin.data?.fullName ?? "patron" }
  );

  return ok(null);
}

export async function purgeReadNotificationsAction(): Promise<Result<number>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "notifications:purge");
  if (denied) return err(denied);

  const rateLimitError = await checkRateLimitSafe("maintenance", admin.data!.userId);
  if (rateLimitError) return err(rateLimitError);

  if (!admin.data?.userId) return err("Session invalide");

  const result = await deleteReadNotifications(admin.data.userId);
  if (result.error) return err(result.error);

  await logMaintenanceEvent(
    admin.data.userId,
    "notifications_purgees",
    "notification",
    null,
    { count: result.data, operator: admin.data.fullName ?? "patron" }
  );

  return ok(result.data ?? 0);
}
