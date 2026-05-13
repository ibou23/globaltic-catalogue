"use server";

import { revalidatePath } from "next/cache";
import { realisationSchema } from "@/lib/validators/realisation";
import {
  createRealisation,
  updateRealisation,
  deleteRealisation,
} from "@/lib/db/realisations";
import { err, type Result } from "@/lib/utils/result";
import type { Realisation } from "@/lib/types/domain";

export async function createRealisationAction(
  formData: unknown
): Promise<Result<Realisation>> {
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
  const result = await deleteRealisation(id);

  if (!result.error) {
    revalidatePath("/admin/realisations");
    revalidatePath("/realisations");
    revalidatePath("/");
  }

  return result;
}
