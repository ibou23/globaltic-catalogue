"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentAdmin, getAdminProfiles } from "@/lib/db/admin";
import { createAdminNotifications } from "@/lib/db/notifications";
import { logOrderEvent } from "@/lib/db/activity-log";
import { requireActionDynamic } from "@/lib/auth/check-access";
import { mapOrder } from "@/lib/db/mappers";
import { ok, err, type Result } from "@/lib/utils/result";
import type { Order, ClosureStatus } from "@/lib/types/domain";
import { z } from "zod";

const closureSchema = z.object({
  closure_status: z.enum(["non_cloturee", "cloturee", "satisfait", "reclamation"]),
  satisfaction: z.enum(["satisfait", "neutre", "insatisfait"]).nullable().optional(),
  customer_comment: z.string().max(2000).nullable().optional(),
  complaint: z.string().max(2000).nullable().optional(),
  corrective_action: z.string().max(2000).nullable().optional(),
});

export type ClosureInput = z.infer<typeof closureSchema>;

export async function saveClosureAction(
  orderId: string,
  orderRef: string,
  formData: unknown
): Promise<Result<Order>> {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;
  const permError = await requireActionDynamic(admin?.role, "commande:edit_status");
  if (permError) return err(permError);

  const parsed = closureSchema.safeParse(formData);
  if (!parsed.success) return err(parsed.error.errors[0]?.message ?? "Données invalides");

  const input = parsed.data;
  const isClosed = input.closure_status !== "non_cloturee";

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .update({
      closure_status:    input.closure_status,
      satisfaction:      input.satisfaction ?? null,
      customer_comment:  input.customer_comment ?? null,
      complaint:         input.complaint ?? null,
      corrective_action: input.corrective_action ?? null,
      closed_at:         isClosed ? new Date().toISOString() : null,
      closed_by:         isClosed && admin ? admin.userId : null,
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) return err(error.message);

  const order = mapOrder(data);

  // Journalisation
  const eventLabels: Record<ClosureStatus, string> = {
    non_cloturee: "réouverture",
    cloturee:     "clôturée",
    satisfait:    "clôturée (client satisfait)",
    reclamation:  "réclamation enregistrée",
  };
  await logOrderEvent(admin?.userId ?? null, orderId, `closure_${input.closure_status}`, {
    reference:      orderRef,
    vers:           eventLabels[input.closure_status as ClosureStatus],
    satisfaction:   input.satisfaction ?? null,
    has_complaint:  !!input.complaint,
    has_comment:    !!input.customer_comment,
  });

  // Notifications
  const profilesResult = await getAdminProfiles();
  const profiles = profilesResult.data ?? [];

  if (input.closure_status !== "non_cloturee") {
    let eventKey = "commande_cloturee";
    let title = `Commande clôturée : ${orderRef}`;
    let body = `La commande ${orderRef} a été clôturée.`;

    if (input.satisfaction === "insatisfait") {
      eventKey = "client_insatisfait";
      title = `Client insatisfait : ${orderRef}`;
      body = `Le client a exprimé son insatisfaction pour la commande ${orderRef}.`;
    }
    if (input.closure_status === "reclamation") {
      eventKey = "reclamation_creee";
      title = `Réclamation : ${orderRef}`;
      body = `Une réclamation a été ouverte pour la commande ${orderRef}.`;
    }

    await createAdminNotifications({
      eventKey,
      title,
      body,
      entityType: "order",
      entityId:   orderId,
      link:       `/admin/commandes`,
      adminProfiles: profiles,
    });
  }

  return ok(order);
}
