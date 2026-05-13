"use server";

import { revalidatePath } from "next/cache";
import { productSchema, quantityTierSchema } from "@/lib/validators/product";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  replaceQuantityTiers,
} from "@/lib/db/products";
import { err, type Result } from "@/lib/utils/result";
import type { Product } from "@/lib/types/domain";
import { z } from "zod";

export async function createProductAction(
  formData: unknown
): Promise<Result<Product>> {
  const parsed = productSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await createProduct(parsed.data);

  if (result.data) {
    revalidatePath("/admin/produits");
    revalidatePath("/catalogue");
    revalidatePath("/");
  }

  return result;
}

export async function updateProductAction(
  id: string,
  formData: unknown
): Promise<Result<Product>> {
  const parsed = productSchema.partial().safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await updateProduct(id, parsed.data);

  if (result.data) {
    revalidatePath("/admin/produits");
    revalidatePath("/catalogue");
    revalidatePath("/");
  }

  return result;
}

export async function deleteProductAction(
  id: string
): Promise<Result<null>> {
  const result = await deleteProduct(id);

  if (!result.error) {
    revalidatePath("/admin/produits");
    revalidatePath("/catalogue");
    revalidatePath("/");
  }

  return result;
}

const tiersPayloadSchema = z.object({
  productId: z.string().uuid(),
  tiers: z.array(
    quantityTierSchema.omit({ product_id: true })
  ),
});

export async function replaceQuantityTiersAction(
  formData: unknown
): Promise<Result<null>> {
  const parsed = tiersPayloadSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await replaceQuantityTiers(
    parsed.data.productId,
    parsed.data.tiers
  );

  if (!result.error) {
    revalidatePath("/admin/produits");
    revalidatePath("/catalogue");
  }

  return result;
}
