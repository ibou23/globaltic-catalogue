import { createClient } from "@/lib/supabase/server";
import { canAccessModule } from "@/lib/auth/permissions";
import type { AdminRole } from "@/lib/types/domain";

export type SearchResultType = "commande" | "devis" | "client" | "produit" | "realisation" | "fichier";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  status?: string;
  link: string;
}

const LIMIT = 5;

export async function globalSearch(
  query: string,
  role: AdminRole
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();
  const supabase = await createClient();
  const results: SearchResult[] = [];

  const jobs: Promise<void>[] = [];
  const push = (p: PromiseLike<void>) => jobs.push(Promise.resolve(p));

  // ── Commandes (tous les rôles) ──
  if (canAccessModule(role, "commandes")) {
    push(
      supabase
        .from("orders")
        .select("id, reference, status, total, customers(contact_name, whatsapp)")
        .ilike("reference", `%${q}%`)
        .limit(LIMIT)
        .then(({ data }) => {
          for (const o of data ?? []) {
            const r = o as Record<string, unknown>;
            const customer = r.customers as { contact_name?: string; whatsapp?: string } | null;
            results.push({
              id: r.id as string,
              type: "commande",
              title: r.reference as string,
              subtitle: customer?.contact_name ?? "Client inconnu",
              status: r.status as string,
              link: "/admin/commandes",
            });
          }
        })
    );
  }

  // ── Devis (patron/admin/commercial) ──
  if (canAccessModule(role, "devis")) {
    push(
      supabase
        .from("quotes")
        .select("id, reference, status, total, customers(contact_name)")
        .ilike("reference", `%${q}%`)
        .limit(LIMIT)
        .then(({ data }) => {
          for (const d of data ?? []) {
            const r = d as Record<string, unknown>;
            const customer = r.customers as { contact_name?: string } | null;
            results.push({
              id: r.id as string,
              type: "devis",
              title: r.reference as string,
              subtitle: customer?.contact_name ?? "Client inconnu",
              status: r.status as string,
              link: "/admin/devis",
            });
          }
        })
    );
  }

  // ── Clients — recherche multi-champ (patron/admin/commercial) ──
  if (canAccessModule(role, "clients")) {
    push(
      supabase
        .from("customers")
        .select("id, contact_name, company_name, whatsapp, email")
        .or(
          `contact_name.ilike.%${q}%,whatsapp.ilike.%${q}%,email.ilike.%${q}%,company_name.ilike.%${q}%`
        )
        .limit(LIMIT)
        .then(({ data }) => {
          for (const c of data ?? []) {
            const r = c as Record<string, unknown>;
            const sub = [r.company_name, r.whatsapp].filter(Boolean).join(" · ");
            results.push({
              id: r.id as string,
              type: "client",
              title: r.contact_name as string,
              subtitle: sub || (r.email as string) || "",
              link: "/admin/clients",
            });
          }
        })
    );
  }

  // ── Produits (patron/admin) ──
  if (canAccessModule(role, "produits")) {
    push(
      supabase
        .from("products")
        .select("id, name, slug, categories(name)")
        .or(`name.ilike.%${q}%,slug.ilike.%${q}%`)
        .eq("is_active", true)
        .limit(LIMIT)
        .then(({ data }) => {
          for (const p of data ?? []) {
            const r = p as Record<string, unknown>;
            const cat = r.categories as { name?: string } | null;
            results.push({
              id: r.id as string,
              type: "produit",
              title: r.name as string,
              subtitle: cat?.name ?? "Sans catégorie",
              link: "/admin/produits",
            });
          }
        })
    );
  }

  // ── Réalisations (patron/admin) ──
  if (canAccessModule(role, "realisations")) {
    push(
      supabase
        .from("realisations")
        .select("id, title, client_name, category")
        .or(`title.ilike.%${q}%,client_name.ilike.%${q}%,category.ilike.%${q}%`)
        .limit(LIMIT)
        .then(({ data }) => {
          for (const r of data ?? []) {
            const row = r as Record<string, unknown>;
            results.push({
              id: row.id as string,
              type: "realisation",
              title: row.title as string,
              subtitle: [row.client_name, row.category].filter(Boolean).join(" · "),
              link: "/admin/realisations",
            });
          }
        })
    );
  }

  // ── Fichiers commande (patron/admin/production/infographiste) ──
  if (canAccessModule(role, "commandes")) {
    push(
      supabase
        .from("order_files")
        .select("id, file_name, file_type, order_id, orders(reference)")
        .or(`file_name.ilike.%${q}%,file_type.ilike.%${q}%`)
        .limit(LIMIT)
        .then(({ data }) => {
          for (const f of data ?? []) {
            const row = f as Record<string, unknown>;
            const order = row.orders as { reference?: string } | null;
            if (!row.file_name) continue;
            results.push({
              id: row.id as string,
              type: "fichier",
              title: row.file_name as string,
              subtitle: order?.reference ? `Commande ${order.reference}` : "Commande inconnue",
              link: "/admin/commandes",
            });
          }
        })
    );
  }

  await Promise.all(jobs);
  return results;
}
