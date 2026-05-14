"use server";

import { createQuoteSchema, updateQuoteStatusSchema, updateQuoteSchema } from "@/lib/validators/quote";
import { createQuote, updateQuote, updateQuoteStatus } from "@/lib/db/quotes";
import { generateReference } from "@/lib/services/reference";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { err, type Result } from "@/lib/utils/result";
import type { Quote } from "@/lib/types/domain";

export async function createQuoteAction(
  formData: unknown
): Promise<Result<Quote>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "devis:create");
  if (denied) return err(denied);

  const parsed = createQuoteSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const reference = await generateReference("DEV");
  return createQuote(parsed.data, reference);
}

export async function updateQuoteAction(
  id: string,
  formData: unknown
): Promise<Result<Quote>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "devis:edit");
  if (denied) return err(denied);

  if (!id) return err("Identifiant du devis manquant");
  const parsed = updateQuoteSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }
  return updateQuote(id, parsed.data);
}

export async function updateQuoteStatusAction(
  formData: unknown
): Promise<Result<Quote>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "devis:edit");
  if (denied) return err(denied);

  const parsed = updateQuoteStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  return updateQuoteStatus(parsed.data.id, parsed.data.status);
}
