"use server";

import { getCurrentAdmin } from "@/lib/db/admin";
import { requireActionDynamic } from "@/lib/auth/check-access";
import { upsertQualityCheck, getQualityCheckByOrderId } from "@/lib/db/quality-checks";
import { logOrderEvent } from "@/lib/db/activity-log";
import { getActiveAdminProfiles } from "@/lib/db/admin-users";
import { createAdminNotifications } from "@/lib/db/notifications";
import { err, type Result } from "@/lib/utils/result";
import type { QualityCheck, QCChecklist, QCStatus } from "@/lib/types/domain";

export async function saveQualityCheckAction(
  orderId: string,
  orderRef: string,
  input: {
    status: QCStatus;
    checklist: QCChecklist;
    notes: string | null;
    canSeePayment: boolean;
  }
): Promise<Result<QualityCheck>> {
  const adminCheck = await getCurrentAdmin();
  const admin = adminCheck.data;
  // production, patron, admin peuvent valider le QC
  const denied = await requireActionDynamic(admin?.role, "commande:edit_status");
  if (denied) return err(denied);

  const now = new Date().toISOString();
  const isValidated = input.status === "valide";

  const result = await upsertQualityCheck(orderId, {
    status:      input.status,
    checklist:   input.checklist,
    notes:       input.notes,
    validatedBy: isValidated ? (admin?.userId ?? null) : null,
    validatedAt: isValidated ? now : null,
  });

  if (result.data) {
    const uid = admin?.userId ?? null;

    // Journalisation selon le statut
    const actionMap: Record<QCStatus, string> = {
      non_verifie: "qc_reinitialise",
      en_cours:    "qc_demarre",
      valide:      "qc_valide",
      a_corriger:  "qc_correction_demandee",
    };
    await logOrderEvent(uid, orderId, actionMap[input.status], {
      statut: input.status,
      points_valides: Object.values(input.checklist).filter(Boolean).length,
      points_total:   Object.keys(input.checklist).length,
    });

    // Notifications ciblées
    const profiles = await getActiveAdminProfiles();

    if (input.status === "en_cours") {
      await createAdminNotifications({
        eventKey: "qc_demarre",
        title:    "Contrôle qualité à effectuer",
        body:     `Commande ${orderRef} — contrôle qualité démarré`,
        entityType: "order",
        entityId:   orderId,
        link:       "/admin/planning",
        adminProfiles: profiles,
      });
    }

    if (input.status === "valide") {
      await createAdminNotifications({
        eventKey: "qc_valide",
        title:    "Contrôle qualité validé",
        body:     `Commande ${orderRef} — contrôle qualité OK, prête pour livraison`,
        entityType: "order",
        entityId:   orderId,
        link:       "/admin/commandes",
        adminProfiles: profiles,
      });
    }

    if (input.status === "a_corriger") {
      await createAdminNotifications({
        eventKey: "qc_correction",
        title:    "Correction requise",
        body:     `Commande ${orderRef} — des corrections sont nécessaires avant livraison`,
        entityType: "order",
        entityId:   orderId,
        link:       "/admin/planning",
        adminProfiles: profiles,
      });
    }
  }

  return result;
}

export async function getQualityCheckAction(
  orderId: string
): Promise<Result<QualityCheck | null>> {
  const adminCheck = await getCurrentAdmin();
  if (!adminCheck.data) return err("Non autorisé");
  return getQualityCheckByOrderId(orderId);
}
