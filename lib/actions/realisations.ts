"use server";

import { revalidatePath } from "next/cache";
import { realisationSchema } from "@/lib/validators/realisation";
import {
  createRealisation,
  updateRealisation,
  deleteRealisation,
} from "@/lib/db/realisations";
import { err, type Result } from "@/lib/utils/result";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import type { Realisation } from "@/lib/types/domain";

export async function createRealisationAction(
  formData: unknown
): Promise<Result<Realisation>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "realisation:create");
  if (denied) return err(denied);

  const parsed = realisationSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await createRealisation(parsed.data);

  if (result.data) {
    revalidatePath("/admin/realisations");
    revalidatePath("/realisations");
    revalidatePath("/");
  }

  return result;
}

export async function updateRealisationAction(
  id: string,
  formData: unknown
): Promise<Result<Realisation>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "realisation:edit");
  if (denied) return err(denied);

  const parsed = realisationSchema.partial().safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await updateRealisation(id, parsed.data);

  if (result.data) {
    revalidatePath("/admin/realisations");
    revalidatePath("/realisations");
    revalidatePath("/");
  }

  return result;
}

export async function deleteRealisationAction(
  id: string
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "realisation:delete");
  if (denied) return err(denied);

  const result = await deleteRealisation(id);

  if (!result.error) {
    revalidatePath("/admin/realisations");
    revalidatePath("/realisations");
    revalidatePath("/");
  }

  return result;
}
