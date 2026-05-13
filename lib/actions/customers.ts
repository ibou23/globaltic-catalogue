"use server";

import { customerSchema } from "@/lib/validators/customer";
import {
  createCustomer,
  updateCustomer,
  getCustomerByWhatsapp,
} from "@/lib/db/customers";
import { ok, err, type Result } from "@/lib/utils/result";
import type { Customer } from "@/lib/types/domain";

export async function createCustomerAction(
  formData: unknown
): Promise<Result<Customer>> {
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
  const parsed = customerSchema.partial().safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  return updateCustomer(id, parsed.data);
}

// Crée le client s'il n'existe pas encore, sinon retourne l'existant
export async function findOrCreateCustomerAction(
  formData: unknown
): Promise<Result<Customer>> {
  const parsed = customerSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const existing = await getCustomerByWhatsapp(parsed.data.whatsapp);
  if (existing.data) return ok(existing.data);

  return createCustomer(parsed.data);
}
