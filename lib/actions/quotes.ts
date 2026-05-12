"use server";

import { createQuoteSchema, updateQuoteStatusSchema } from "@/lib/validators/quote";
import { createQuote, updateQuoteStatus } from "@/lib/db/quotes";
import { generateReference } from "@/lib/services/reference";
import { ok, err, type Result } from "@/lib/utils/result";
import type { Quote } from "@/lib/types/domain";

export async function createQuoteAction(
  formData: unknown
): Promise<Result<Quote>> {
  const parsed = createQuoteSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const reference = await generateReference("DEV");
  return createQuote(parsed.data, reference);
}

export async function updateQuoteStatusAction(
  formData: unknown
): Promise<Result<Quote>> {
  const parsed = updateQuoteStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  return updateQuoteStatus(parsed.data.id, parsed.data.status);
}
