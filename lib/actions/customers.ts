"use server";

import { customerSchema } from "@/lib/validators/customer";
import {
  createCustomer,
  updateCustomer,
  getCustomerByWhatsapp,
} from "@/lib/db/customers";
import { ok, err, type Result } from "@/lib/utils/result";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import type { Customer } from "@/lib/types/domain";

export async function createCustomerAction(
  formData: unknown
): Promise<Result<Customer>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "client:create");
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
  const denied = requireRole(admin.data?.role, "client:edit");
  if (denied) return err(denied);

  const parsed = customerSchema.partial().safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  return updateCustomer(id, parsed.data);
}

// Utilisé lors de la création d'un devis — le commercial crée le client s'il n'existe pas
export async function findOrCreateCustomerAction(
  formData: unknown
): Promise<Result<Customer>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "client:create");
  if (denied) return err(denied);

  const parsed = customerSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const existing = await getCustomerByWhatsapp(parsed.data.whatsapp);
  if (existing.data) return ok(existing.data);

  return createCustomer(parsed.data);
}
