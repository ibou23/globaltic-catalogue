"use server";

import { getCurrentAdmin } from "@/lib/db/admin";
import { requireActionDynamic } from "@/lib/auth/check-access";
import { updateOrderDelivery } from "@/lib/db/orders";
import { updateDeliverySchema } from "@/lib/validators/order";
import { logOrderEvent } from "@/lib/db/activity-log";
import { getActiveAdminProfiles } from "@/lib/db/admin-users";
import { createAdminNotifications } from "@/lib/db/notifications";
import { createSatisfactionTask } from "@/lib/services/auto-tasks";
import { err, type Result } from "@/lib/utils/result";
import type { Order, DeliveryStatus } from "@/lib/types/domain";

export async function updateDeliveryAction(
  orderId: string,
  orderRef: string,
  formData: unknown
): Promise<Result<Order>> {
  const adminCheck = await getCurrentAdmin();
  const admin = adminCheck.data;
  const denied = await requireActionDynamic(admin?.role, "commande:edit_status");
  if (denied) return err(denied);

  const parsed = updateDeliverySchema.safeParse(formData);
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Données invalides");

  const result = await updateOrderDelivery(orderId, parsed.data);
  if (!result.data) return result;

  const uid = admin?.userId ?? null;
  const status = parsed.data.delivery_status;

  const logActionMap: Record<DeliveryStatus, string> = {
    non_planifiee: "livraison_reinitialise",
    planifiee:     "livraison_planifiee",
    en_cours:      "livraison_en_cours",
    livree:        "livraison_livree",
    echec:         "livraison_echec",
    reportee:      "livraison_reportee",
  };
  await logOrderEvent(uid, orderId, logActionMap[status], {
    statut_livraison: status,
    mode:             parsed.data.delivery_method,
    adresse:          parsed.data.delivery_address ?? null,
    date_prevue:      parsed.data.estimated_delivery ?? null,
  });

  const profiles = await getActiveAdminProfiles();

  const notifMap: Partial<Record<DeliveryStatus, { eventKey: string; title: string; body: string }>> = {
    planifiee: {
      eventKey: "livraison_planifiee",
      title:    "Livraison planifiée",
      body:     `Commande ${orderRef} — livraison planifiée le ${parsed.data.estimated_delivery ?? "date inconnue"}`,
    },
    en_cours: {
      eventKey: "livraison_en_cours",
      title:    "Livraison en cours",
      body:     `Commande ${orderRef} — livreur en route`,
    },
    livree: {
      eventKey: "livraison_livree",
      title:    "Commande livrée",
      body:     `Commande ${orderRef} — livraison confirmée`,
    },
    echec: {
      eventKey: "livraison_echec",
      title:    "Échec de livraison",
      body:     `Commande ${orderRef} — client absent ou livraison non finalisée`,
    },
    reportee: {
      eventKey: "livraison_reportee",
      title:    "Livraison reportée",
      body:     `Commande ${orderRef} — livraison reportée`,
    },
  };

  const notif = notifMap[status];
  if (notif) {
    await createAdminNotifications({
      ...notif,
      entityType: "order",
      entityId:   orderId,
      link:       "/admin/commandes",
      adminProfiles: profiles,
    });
  }

  if (status === "livree") {
    createSatisfactionTask({
      orderId,
      orderRef,
      customerId: result.data.customerId,
      assignedTo: uid ?? "",
    });
  }

  return result;
}
