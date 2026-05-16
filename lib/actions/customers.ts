"use server";

import { customerSchema } from "@/lib/validators/customer";
import {
  createCustomer,
  updateCustomer,
  updateCustomerNotes,
  getCustomerByWhatsapp,
  getCustomerLinkedCount,
  deleteCustomer,
} from "@/lib/db/customers";
import { ok, err, type Result } from "@/lib/utils/result";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireActionDynamic } from "@/lib/auth/check-access";
import { logAdminEvent } from "@/lib/db/activity-log";
import type { Customer } from "@/lib/types/domain";

export async function createCustomerAction(
  formData: unknown
): Promise<Result<Customer>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "client:create");
  if (denied) return err(denied);

  const parsed = customerSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const existing = await getCustomerByWhatsapp(parsed.data.whatsapp);
  if (existing.data) {
    return err("Un client avec ce numéro WhatsApp existe déjà");
  }

  return createCustomer(parsed.data);
}

export async function updateCustomerAction(
  id: string,
  formData: unknown
): Promise<Result<Customer>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "client:edit");
  if (denied) return err(denied);

  const parsed = customerSchema.partial().safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await updateCustomer(id, parsed.data);

  if (result.data && admin.data) {
    await logAdminEvent(admin.data.userId, "client_modifie", id, {
      clientName: result.data.contactName,
      fields: Object.keys(parsed.data),
    });
  }

  return result;
}

export async function updateCustomerNotesAction(
  id: string,
  notes: string
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "client:edit");
  if (denied) return err(denied);

  const trimmed = notes.trim().slice(0, 2000);
  return updateCustomerNotes(id, trimmed);
}

/**
 * Suppression d'un client avec vérifications de sécurité.
 * Bloque la suppression si le client a des devis, commandes, factures ou tâches.
 */
export async function deleteCustomerAction(
  id: string
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "client:delete");
  if (denied) return err(denied);

  if (!id) return err("Identifiant du client manquant");

  // Vérifier les entités liées
  const linked = await getCustomerLinkedCount(id);
  const total = linked.quotes + linked.orders + linked.invoices + linked.tasks;

  if (total > 0) {
    const parts: string[] = [];
    if (linked.orders > 0) parts.push(`${linked.orders} commande(s)`);
    if (linked.quotes > 0) parts.push(`${linked.quotes} devis`);
    if (linked.invoices > 0) parts.push(`${linked.invoices} facture(s)`);
    if (linked.tasks > 0) parts.push(`${linked.tasks} tâche(s)`);

    return err(
      `Ce client possède déjà des données commerciales (${parts.join(", ")}). ` +
      `Vous pouvez corriger ses informations, mais pas le supprimer.`
    );
  }

  const result = await deleteCustomer(id);

  if (!result.error && admin.data) {
    await logAdminEvent(admin.data.userId, "client_supprime", id, {
      clientId: id,
    });
  }

  return result;
}

/**
 * Retourne le nombre d'entités liées à un client (pour avertissement UI).
 */
export async function getCustomerLinkedCountAction(
  id: string
): Promise<Result<{ quotes: number; orders: number; invoices: number; tasks: number }>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");

  const linked = await getCustomerLinkedCount(id);
  return ok(linked);
}

// Utilisé lors de la création d'un devis — le commercial crée le client s'il n'existe pas
export async function findOrCreateCustomerAction(
  formData: unknown
): Promise<Result<Customer>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "client:create");
  if (denied) return err(denied);

  const parsed = customerSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const existing = await getCustomerByWhatsapp(parsed.data.whatsapp);
  if (existing.data) return ok(existing.data);

  return createCustomer(parsed.data);
}
