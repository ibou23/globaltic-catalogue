"use server";

import { revalidatePath } from "next/cache";
import { categorySchema } from "@/lib/validators/product";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/db/categories";
import { err, type Result } from "@/lib/utils/result";
import type { Category } from "@/lib/types/domain";

export async function createCategoryAction(
  formData: unknown
): Promise<Result<Category>> {
  const parsed = categorySchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await createCategory(parsed.data);

  if (result.data) {
    revalidatePath("/admin/categories");
    revalidatePath("/catalogue");
    revalidatePath("/");
  }

  return result;
}

export async function updateCategoryAction(
  id: string,
  formData: unknown
): Promise<Result<Category>> {
  const parsed = categorySchema.partial().safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await updateCategory(id, parsed.data);

  if (result.data) {
    revalidatePath("/admin/categories");
    revalidatePath("/catalogue");
    revalidatePath("/");
  }

  return result;
}

export async function deleteCategoryAction(
  id: string
): Promise<Result<null>> {
  const result = await deleteCategory(id);

  if (!result.error) {
    revalidatePath("/admin/categories");
    revalidatePath("/catalogue");
    revalidatePath("/");
  }

  return result;
}
