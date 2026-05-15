"use server";

import { prospectUpdateSchema } from "@/lib/validators/prospect";
import { getProspectById, updateProspect, deleteProspect } from "@/lib/db/prospects";
import { deleteProspectFile, getProspectFileSignedUrl } from "@/lib/db/prospect-files";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { err, type Result } from "@/lib/utils/result";
import type { Prospect } from "@/lib/types/domain";

export async function updateProspectAction(
  id: string,
  formData: unknown
): Promise<Result<Prospect>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);

  if (!id) return err("Identifiant du prospect manquant");

  const parsed = prospectUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const existing = await getProspectById(id);
  if (!existing.data) return err("Prospect introuvable");

  return updateProspect(id, parsed.data);
}

export async function deleteProspectAction(
  id: string
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "prospect:delete");
  if (denied) return err(denied);

  if (!id) return err("Identifiant du prospect manquant");

  const existing = await getProspectById(id);
  if (!existing.data) return err("Prospect introuvable");

  return deleteProspect(id);
}

export async function deleteProspectFileAction(
  fileId: string
): Promise<Result<true>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "prospect:edit");
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
