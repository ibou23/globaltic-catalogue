"use server";

import { prospectUpdateSchema } from "@/lib/validators/prospect";
import { getProspectById, updateProspect, deleteProspect, getProspectLinkedEntities } from "@/lib/db/prospects";
import { deleteProspectFile, getProspectFileSignedUrl } from "@/lib/db/prospect-files";
import { createCustomer } from "@/lib/db/customers";
import { createTask } from "@/lib/db/tasks";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireActionDynamic } from "@/lib/auth/check-access";
import { logAdminEvent } from "@/lib/db/activity-log";
import { err, ok, type Result } from "@/lib/utils/result";
import type { Prospect, Customer, Task } from "@/lib/types/domain";

export async function updateProspectAction(
  id: string,
  formData: unknown
): Promise<Result<Prospect>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);

  if (!id) return err("Identifiant du prospect manquant");

  const parsed = prospectUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const existing = await getProspectById(id);
  if (!existing.data) return err("Prospect introuvable");

  const result = await updateProspect(id, parsed.data);

  if (result.data && admin.data) {
    await logAdminEvent(admin.data.userId, "prospect_modifie", id, {
      prospectName: result.data.fullName,
      fields: Object.keys(parsed.data),
    });
  }

  return result;
}

export async function deleteProspectAction(
  id: string
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:delete");
  if (denied) return err(denied);

  if (!id) return err("Identifiant du prospect manquant");

  const existing = await getProspectById(id);
  if (!existing.data) return err("Prospect introuvable");

  // Vérifier les entités liées
  const linked = await getProspectLinkedEntities(id);

  if (linked.convertedCustomerId) {
    // Le prospect a été converti en client — on autorise la suppression
    // mais on ne touche PAS au client converti (FK SET NULL)
  }

  const result = await deleteProspect(id);

  if (!result.error && admin.data) {
    await logAdminEvent(admin.data.userId, "prospect_supprime", id, {
      prospectName: existing.data.fullName,
      hadConvertedCustomer: !!linked.convertedCustomerId,
      linkedTasks: linked.tasks,
    });
  }

  return result;
}

/**
 * Retourne les infos sur les entités liées à un prospect (pour avertissement UI).
 */
export async function getProspectLinkedEntitiesAction(
  id: string
): Promise<Result<{ convertedCustomerId: string | null; tasks: number }>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");

  const linked = await getProspectLinkedEntities(id);
  return ok(linked);
}

export async function deleteProspectFileAction(
  fileId: string
): Promise<Result<true>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);

  return deleteProspectFile(fileId);
}

export async function getProspectFileUrlAction(
  storagePath: string
): Promise<Result<string>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  return getProspectFileSignedUrl(storagePath);
}

export async function markProspectContactedAction(
  id: string
): Promise<Result<Prospect>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);

  return updateProspect(id, { contacted_at: new Date().toISOString() });
}

export async function convertProspectToCustomerAction(
  id: string
): Promise<Result<Customer>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);

  const existing = await getProspectById(id);
  if (!existing.data) return err("Prospect introuvable");
  const p = existing.data;

  if (p.convertedCustomerId) return err("Ce prospect a déjà été converti");

  const result = await createCustomer({
    contact_name: p.fullName,
    whatsapp: p.whatsapp,
    email: p.email ?? undefined,
    phone: p.phoneSecondary ?? undefined,
    company_name: p.companyName ?? undefined,
    city: p.deliveryZone ?? "Dakar",
    customer_type: p.companyName ? "entreprise" : "particulier",
    source: "whatsapp",
    notes: p.internalNotes ?? undefined,
  });

  if (!result.data) return err(result.error ?? "Erreur création client");

  await updateProspect(id, {
    converted_customer_id: result.data.id,
    status: "commande_confirmee",
  });

  return ok(result.data);
}

export async function createProspectTaskAction(
  prospectId: string,
  taskType: "relancer_devis" | "appeler_client" | "autre",
  title: string,
  dueDate?: string
): Promise<Result<Task>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);
  if (!admin.data) return err("Accès non autorisé");

  const existing = await getProspectById(prospectId);
  if (!existing.data) return err("Prospect introuvable");

  return createTask(
    {
      title,
      task_type: taskType,
      priority: "haute",
      status: "a_faire",
      due_date: dueDate ?? null,
      prospect_id: prospectId,
      customer_id: null,
      quote_id: null,
      order_id: null,
      assigned_to: admin.data.userId,
    },
    admin.data.userId
  );
}
