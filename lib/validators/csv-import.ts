import { z } from "zod";

// ── Helpers ────────────────────────────────────────────────────────────────

const boolField = z
  .string()
  .transform((v) => ["1", "true", "oui", "yes"].includes(v.toLowerCase().trim()))
  .or(z.boolean());

const nullableStr = (max = 500) =>
  z.string().max(max).transform((v) => v.trim() || null).nullable().optional();

const intField = (min = 0) =>
  z.string().transform((v) => parseInt(v.trim(), 10)).pipe(z.number().int().min(min));

const slugField = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Slug invalide : lettres minuscules, chiffres et tirets uniquement");

// ── Produit CSV ────────────────────────────────────────────────────────────

export const csvProductRowSchema = z.object({
  slug:                  slugField,
  nom:                   z.string().min(2).max(300).transform((v) => v.trim()),
  categorie_slug:        slugField,
  description_courte:    nullableStr(500),
  description:           nullableStr(5000),
  image_url:             z.string().url().or(z.literal("")).optional().transform((v) => v?.trim() || null).nullable(),
  unite:                 z.enum(["piece", "m2", "lot"]).default("piece"),
  delai_production_jours: z.string().optional().default("3")
                          .transform((v) => parseInt(v || "3", 10))
                          .pipe(z.number().int().min(1).max(60)),
  quantite_minimale:     z.string().optional().default("1")
                          .transform((v) => parseInt(v || "1", 10))
                          .pipe(z.number().int().min(1)),
  populaire:             boolField.optional().default(false),
  actif:                 boolField.optional().default(true),
  tags:                  z.string().optional().default("").transform((v) =>
                           v ? v.split("|").map((t) => t.trim()).filter(Boolean) : []
                         ),
  titre_seo:             nullableStr(70),
  description_seo:       nullableStr(160),
  ordre_affichage:       z.string().optional().default("0")
                          .transform((v) => parseInt(v || "0", 10))
                          .pipe(z.number().int().min(0)),
});

// ── Catégorie CSV ──────────────────────────────────────────────────────────

export const csvCategoryRowSchema = z.object({
  slug:            slugField,
  nom:             z.string().min(2).max(200).transform((v) => v.trim()),
  description:     nullableStr(500),
  image_url:       z.string().url().or(z.literal("")).optional().transform((v) => v?.trim() || null).nullable(),
  icone:           nullableStr(50),
  ordre_affichage: z.string().optional().default("0")
                    .transform((v) => parseInt(v || "0", 10))
                    .pipe(z.number().int().min(0)),
  actif:           boolField.optional().default(true),
});

// ── Prix / tiers de quantité CSV ───────────────────────────────────────────

export const csvPrixRowSchema = z.object({
  produit_slug:   slugField,
  quantite_min:   intField(1),
  quantite_max:   z.string().optional().transform((v) => {
    if (!v || v.trim() === "" || v.trim() === "-") return null;
    const n = parseInt(v.trim(), 10);
    return isNaN(n) ? null : n;
  }),
  prix_unitaire:  intField(0),
  libelle:        nullableStr(100),
});

export type CsvProductRow    = z.infer<typeof csvProductRowSchema>;
export type CsvCategoryRow   = z.infer<typeof csvCategoryRowSchema>;
export type CsvPrixRow       = z.infer<typeof csvPrixRowSchema>;

// ── Colonnes attendues ─────────────────────────────────────────────────────

export const CSV_PRODUCT_HEADERS = [
  "slug", "nom", "categorie_slug", "description_courte", "description",
  "image_url", "unite", "delai_production_jours", "quantite_minimale",
  "populaire", "actif", "tags", "titre_seo", "description_seo", "ordre_affichage",
] as const;

export const CSV_CATEGORY_HEADERS = [
  "slug", "nom", "description", "image_url", "icone", "ordre_affichage", "actif",
] as const;

export const CSV_PRIX_HEADERS = [
  "produit_slug", "quantite_min", "quantite_max", "prix_unitaire", "libelle",
] as const;
