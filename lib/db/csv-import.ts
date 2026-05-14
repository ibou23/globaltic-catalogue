import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import type { CsvProductRow, CsvCategoryRow, CsvPrixRow } from "@/lib/validators/csv-import";

export interface ImportLineResult {
  index: number;
  slug: string;
  action: "created" | "updated" | "skipped" | "error";
  error?: string;
}

export interface ImportSummary {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  lines: ImportLineResult[];
}

// ── Import catégories ──────────────────────────────────────────────────────

export async function importCategories(rows: CsvCategoryRow[]): Promise<Result<ImportSummary>> {
  const supabase = await createClient();
  const summary: ImportSummary = { created: 0, updated: 0, skipped: 0, errors: 0, lines: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      // Chercher si la catégorie existe par slug
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", row.slug)
        .maybeSingle();

      const payload = {
        slug:          row.slug,
        name:          row.nom,
        description:   row.description ?? null,
        image_url:     row.image_url ?? null,
        icon_name:     row.icone ?? null,
        display_order: row.ordre_affichage ?? 0,
        is_active:     row.actif ?? true,
        updated_at:    new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
        summary.updated++;
        summary.lines.push({ index: i + 1, slug: row.slug, action: "updated" });
      } else {
        const { error } = await supabase
          .from("categories")
          .insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw new Error(error.message);
        summary.created++;
        summary.lines.push({ index: i + 1, slug: row.slug, action: "created" });
      }
    } catch (e) {
      summary.errors++;
      summary.lines.push({ index: i + 1, slug: row.slug, action: "error", error: String(e) });
    }
  }

  return ok(summary);
}

// ── Import produits ────────────────────────────────────────────────────────

export async function importProducts(rows: CsvProductRow[]): Promise<Result<ImportSummary>> {
  const supabase = await createClient();
  const summary: ImportSummary = { created: 0, updated: 0, skipped: 0, errors: 0, lines: [] };

  // Charger toutes les catégories en une requête
  const { data: allCats } = await supabase.from("categories").select("id, slug");
  const catMap = new Map((allCats ?? []).map((c) => [c.slug as string, c.id as string]));

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const categoryId = catMap.get(row.categorie_slug);
      if (!categoryId) {
        throw new Error(`Catégorie introuvable : ${row.categorie_slug}`);
      }

      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", row.slug)
        .maybeSingle();

      const payload = {
        category_id:          categoryId,
        slug:                 row.slug,
        name:                 row.nom,
        short_description:    row.description_courte ?? null,
        description:          row.description ?? null,
        image_urls:           row.image_url ? [row.image_url] : [],
        base_turnaround_days: row.delai_production_jours ?? 3,
        min_order_quantity:   row.quantite_minimale ?? 1,
        unit_type:            row.unite ?? "piece",
        is_popular:           row.populaire ?? false,
        is_active:            row.actif ?? true,
        tags:                 row.tags ?? [],
        seo_title:            row.titre_seo ?? null,
        seo_description:      row.description_seo ?? null,
        display_order:        row.ordre_affichage ?? 0,
        updated_at:           new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", existing.id);
        if (error) throw new Error(error.message);
        summary.updated++;
        summary.lines.push({ index: i + 1, slug: row.slug, action: "updated" });
      } else {
        const { error } = await supabase
          .from("products")
          .insert({ ...payload, created_at: new Date().toISOString() });
        if (error) throw new Error(error.message);
        summary.created++;
        summary.lines.push({ index: i + 1, slug: row.slug, action: "created" });
      }
    } catch (e) {
      summary.errors++;
      summary.lines.push({ index: i + 1, slug: row.slug, action: "error", error: String(e) });
    }
  }

  return ok(summary);
}

// ── Import prix / tiers de quantité ───────────────────────────────────────

export async function importPrix(rows: CsvPrixRow[]): Promise<Result<ImportSummary>> {
  const supabase = await createClient();
  const summary: ImportSummary = { created: 0, updated: 0, skipped: 0, errors: 0, lines: [] };

  // Charger tous les produits en une requête
  const { data: allProds } = await supabase.from("products").select("id, slug");
  const prodMap = new Map((allProds ?? []).map((p) => [p.slug as string, p.id as string]));

  // Grouper les lignes par produit_slug pour les insérer par bloc
  const byProduct = new Map<string, CsvPrixRow[]>();
  for (const row of rows) {
    const list = byProduct.get(row.produit_slug) ?? [];
    list.push(row);
    byProduct.set(row.produit_slug, list);
  }

  let lineIndex = 0;
  for (const [prodSlug, tiers] of byProduct) {
    const productId = prodMap.get(prodSlug);
    lineIndex++;
    if (!productId) {
      for (const tier of tiers) {
        summary.errors++;
        summary.lines.push({ index: lineIndex, slug: prodSlug, action: "error", error: `Produit introuvable : ${prodSlug}` });
        lineIndex++;
      }
      continue;
    }

    try {
      // Supprimer les tiers existants pour ce produit, puis réinsérer
      const { error: delErr } = await supabase
        .from("product_quantity_tiers")
        .delete()
        .eq("product_id", productId);
      if (delErr) throw new Error(delErr.message);

      const rows2 = tiers.map((t) => ({
        product_id:      productId,
        min_qty:         t.quantite_min,
        max_qty:         t.quantite_max ?? null,
        base_unit_price: t.prix_unitaire,
        label:           t.libelle ?? null,
      }));

      const { error: insErr } = await supabase.from("product_quantity_tiers").insert(rows2);
      if (insErr) throw new Error(insErr.message);

      for (const _t of tiers) {
        summary.updated++;
        summary.lines.push({ index: lineIndex, slug: prodSlug, action: "updated" });
        lineIndex++;
      }
    } catch (e) {
      for (const _t of tiers) {
        summary.errors++;
        summary.lines.push({ index: lineIndex, slug: prodSlug, action: "error", error: String(e) });
        lineIndex++;
      }
    }
  }

  return ok(summary);
}
