"use server";

import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { updateBusinessConfig } from "@/lib/db/business-config";
import { err, type Result } from "@/lib/utils/result";
import {
  companyInfoSchema,
  commercialSchema,
  pdfContentSchema,
  waTemplatesSchema,
  type CompanyInfoInput,
  type CommercialInput,
  type PdfContentInput,
  type WaTemplatesInput,
} from "@/lib/validators/business-config";

async function getAdmin() {
  const r = await getCurrentAdmin();
  if (!r.data) return { admin: null, denied: "Non authentifié" };
  const denied = requireRole(r.data.role, "parametres:edit");
  return { admin: r.data, denied };
}

export async function updateCompanyInfoAction(input: CompanyInfoInput): Promise<Result<true>> {
  const { admin, denied } = await getAdmin();
  if (denied || !admin) return err(denied ?? "Accès refusé");

  const parsed = companyInfoSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.errors[0]?.message ?? "Données invalides");

  return updateBusinessConfig(parsed.data);
}

export async function updateCommercialAction(input: CommercialInput): Promise<Result<true>> {
  const { admin, denied } = await getAdmin();
  if (denied || !admin) return err(denied ?? "Accès refusé");

  const parsed = commercialSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.errors[0]?.message ?? "Données invalides");

  return updateBusinessConfig(parsed.data);
}

export async function updatePdfContentAction(input: PdfContentInput): Promise<Result<true>> {
  const { admin, denied } = await getAdmin();
  if (denied || !admin) return err(denied ?? "Accès refusé");

  const parsed = pdfContentSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.errors[0]?.message ?? "Données invalides");

  return updateBusinessConfig(parsed.data);
}

export async function updateWaTemplatesAction(input: WaTemplatesInput): Promise<Result<true>> {
  const { admin, denied } = await getAdmin();
  if (denied || !admin) return err(denied ?? "Accès refusé");

  const parsed = waTemplatesSchema.safeParse(input);
  if (!parsed.success) return err(parsed.error.errors[0]?.message ?? "Données invalides");

  return updateBusinessConfig(parsed.data);
}
