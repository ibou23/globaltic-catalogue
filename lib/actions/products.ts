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
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireActionDynamic } from "@/lib/auth/check-access";
import type { Product } from "@/lib/types/domain";
import { z } from "zod";

export async function createProductAction(
  formData: unknown
): Promise<Result<Product>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "produit:create");
  if (denied) return err(denied);

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
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "produit:edit");
  if (denied) return err(denied);

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
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "produit:delete");
  if (denied) return err(denied);

  const result = await deleteProduct(id);

  if (!result.error) {
    revalidatePath("/admin/produits");
    revalidatePath("/catalogue");
    revalidatePath("/");
  }

  return result;
}

export async function getProductTiersAction(
  productId: string
): Promise<Result<{ quantityTiers: Array<{ id: string; productId: string; minQty: number; maxQty: number | null; baseUnitPrice: number; label: string | null }> }>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "produit:edit");
  if (denied) return err(denied);

  const { getProductById } = await import("@/lib/db/products");
  const result = await getProductById(productId);
  if (result.error) return err(result.error);
  if (!result.data) return err("Produit introuvable");

  return { data: { quantityTiers: result.data.quantityTiers }, error: null };
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
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "produit:edit");
  if (denied) return err(denied);

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
