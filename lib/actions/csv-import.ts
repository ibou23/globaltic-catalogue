"use server";

import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { importCategories, importProducts, importPrix, type ImportSummary } from "@/lib/db/csv-import";
import { csvProductRowSchema, csvCategoryRowSchema, csvPrixRowSchema } from "@/lib/validators/csv-import";
import { err, ok, type Result } from "@/lib/utils/result";
import { revalidatePath } from "next/cache";

// Chaque ligne brute du CSV (avant validation)
type RawRow = Record<string, string>;

export interface ParsedRow<T> {
  index: number;
  raw: RawRow;
  data?: T;
  error?: string;
}

// ── Import catégories ──────────────────────────────────────────────────────

export async function importCategoriesAction(
  rows: RawRow[]
): Promise<Result<ImportSummary>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "import:categories");
  if (denied) return err(denied);

  const validated = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const parsed = csvCategoryRowSchema.safeParse(rows[i]);
    if (parsed.success) {
      validated.push(parsed.data);
    } else {
      errors.push(`Ligne ${i + 2} : ${parsed.error.errors[0]?.message ?? "Erreur inconnue"}`);
    }
  }

  if (errors.length > 0 && validated.length === 0) {
    return err(`Aucune ligne valide.\n${errors.slice(0, 5).join("\n")}`);
  }

  const result = await importCategories(validated);
  if (result.data) {
    revalidatePath("/admin/categories");
    revalidatePath("/catalogue");
  }
  return result;
}

// ── Import produits ────────────────────────────────────────────────────────

export async function importProductsAction(
  rows: RawRow[]
): Promise<Result<ImportSummary>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "import:produits");
  if (denied) return err(denied);

  const validated = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const parsed = csvProductRowSchema.safeParse(rows[i]);
    if (parsed.success) {
      validated.push(parsed.data);
    } else {
      errors.push(`Ligne ${i + 2} : ${parsed.error.errors[0]?.message ?? "Erreur inconnue"}`);
    }
  }

  if (errors.length > 0 && validated.length === 0) {
    return err(`Aucune ligne valide.\n${errors.slice(0, 5).join("\n")}`);
  }

  const result = await importProducts(validated);
  if (result.data) {
    revalidatePath("/admin/produits");
    revalidatePath("/catalogue");
    revalidatePath("/");
  }
  return result;
}

// ── Import prix ────────────────────────────────────────────────────────────

export async function importPrixAction(
  rows: RawRow[]
): Promise<Result<ImportSummary>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "import:prix");
  if (denied) return err(denied);

  const validated = [];
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const parsed = csvPrixRowSchema.safeParse(rows[i]);
    if (parsed.success) {
      validated.push(parsed.data);
    } else {
      errors.push(`Ligne ${i + 2} : ${parsed.error.errors[0]?.message ?? "Erreur inconnue"}`);
    }
  }

  if (errors.length > 0 && validated.length === 0) {
    return err(`Aucune ligne valide.\n${errors.slice(0, 5).join("\n")}`);
  }

  const result = await importPrix(validated);
  if (result.data) {
    revalidatePath("/admin/produits");
    revalidatePath("/catalogue");
  }
  return result;
}

// ── Validation seulement (aperçu) ─────────────────────────────────────────

export async function previewCsvAction(
  type: "produits" | "categories" | "prix",
  rows: RawRow[]
): Promise<Result<{
  valid: number;
  invalid: number;
  errors: { index: number; message: string }[];
}>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Non authentifié");

  const actionMap = {
    produits:    "import:produits",
    categories:  "import:categories",
    prix:        "import:prix",
  } as const;
  const denied = requireRole(admin.data.role, actionMap[type]);
  if (denied) return err(denied);

  const schemaMap = {
    produits:   csvProductRowSchema,
    categories: csvCategoryRowSchema,
    prix:       csvPrixRowSchema,
  };
  const schema = schemaMap[type];

  let valid = 0;
  let invalid = 0;
  const errors: { index: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const parsed = schema.safeParse(rows[i]);
    if (parsed.success) {
      valid++;
    } else {
      invalid++;
      errors.push({
        index: i + 2,
        message: parsed.error.errors[0]?.message ?? "Erreur inconnue",
      });
    }
  }

  return ok({ valid, invalid, errors });
}
