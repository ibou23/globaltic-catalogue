import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";

export interface DashboardStats {
  // Compteurs globaux
  totalProducts: number;
  totalCategories: number;
  totalQuotes: number;
  totalOrders: number;
  totalCustomers: number;
  totalRealisations: number;

  // Devis
  pendingQuotes: number;      // brouillon + envoye
  acceptedQuotes: number;     // accepte
  caDevisAcceptes: number;    // SUM(total) devis acceptés

  // Commandes par statut
  activeOrders: number;       // hors livre/annulee
  ordersInProduction: number; // en_production + controle_qualite
  ordersBat: number;          // bat_en_cours + bat_valide
  ordersPret: number;         // pret + en_livraison
  ordersLivres: number;       // livre

  // Finance commandes
  caCommandes: number;        // SUM(total) toutes commandes hors annulee
  montantEncaisse: number;    // SUM(paid_amount)
  soldeRestant: number;       // caCommandes - montantEncaisse

  // Listes récentes
  recentQuotes: Array<{
    id: string;
    reference: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  recentOrders: Array<{
    id: string;
    reference: string;
    status: string;
    total: number;
    paidAmount: number;
    createdAt: string;
  }>;
  recentCustomers: Array<{
    id: string;
    contactName: string;
    companyName: string | null;
    whatsapp: string;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  }>;
  // Commandes nécessitant une action immédiate
  urgentOrders: Array<{
    id: string;
    reference: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
}

export async function getDashboardStats(): Promise<Result<DashboardStats>> {
  const supabase = await createClient();

  const [
    productsRes,
    categoriesRes,
    quotesRes,
    ordersRes,
    customersRes,
    realisationsRes,
    pendingQuotesRes,
    acceptedQuotesRes,
    activeOrdersRes,
    ordersInProdRes,
    ordersBatRes,
    ordersPretRes,
    ordersLivresRes,
    caCommandesRes,
    recentQuotesRes,
    recentOrdersRes,
    recentCustomersRes,
    recentActivityRes,
    urgentOrdersRes,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("quotes").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("realisations").select("id", { count: "exact", head: true }),
    supabase.from("quotes").select("id", { count: "exact", head: true }).in("status", ["brouillon", "envoye"]),
    supabase.from("quotes").select("id, total").eq("status", "accepte"),
    supabase.from("orders").select("id", { count: "exact", head: true }).not("status", "in", '("livre","annulee")'),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["en_production", "controle_qualite"]),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["bat_en_cours", "bat_valide"]),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pret", "en_livraison"]),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "livre"),
    // Finance : total + paid_amount sur commandes non annulées
    supabase.from("orders").select("total, paid_amount").neq("status", "annulee"),
    supabase.from("quotes").select("id, reference, status, total, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("id, reference, status, total, paid_amount, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("customers").select("id, contact_name, company_name, whatsapp, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("activity_log").select("id, action, entity_type, metadata, created_at").order("created_at", { ascending: false }).limit(10),
    // Commandes urgentes : confirmées depuis plus de 24h sans progression
    supabase.from("orders").select("id, reference, status, total, created_at").in("status", ["en_attente", "confirmee", "bat_en_cours", "pret"]).order("created_at", { ascending: true }).limit(5),
  ]);

  const anyError = [productsRes, categoriesRes, quotesRes, ordersRes, customersRes, realisationsRes].find(r => r.error);
  if (anyError?.error) return err(anyError.error.message);

  // Calcul CA devis acceptés
  const acceptedRows = (acceptedQuotesRes.data ?? []) as Array<{ id: string; total: number }>;
  const caDevisAcceptes = acceptedRows.reduce((sum, r) => sum + (r.total ?? 0), 0);

  // Calcul CA commandes + encaissé
  const orderFinRows = (caCommandesRes.data ?? []) as Array<{ total: number; paid_amount: number }>;
  const caCommandes = orderFinRows.reduce((sum, r) => sum + (r.total ?? 0), 0);
  const montantEncaisse = orderFinRows.reduce((sum, r) => sum + (r.paid_amount ?? 0), 0);

  return ok({
    totalProducts: productsRes.count ?? 0,
    totalCategories: categoriesRes.count ?? 0,
    totalQuotes: quotesRes.count ?? 0,
    totalOrders: ordersRes.count ?? 0,
    totalCustomers: customersRes.count ?? 0,
    totalRealisations: realisationsRes.count ?? 0,
    pendingQuotes: pendingQuotesRes.count ?? 0,
    acceptedQuotes: acceptedRows.length,
    caDevisAcceptes,
    activeOrders: activeOrdersRes.count ?? 0,
    ordersInProduction: ordersInProdRes.count ?? 0,
    ordersBat: ordersBatRes.count ?? 0,
    ordersPret: ordersPretRes.count ?? 0,
    ordersLivres: ordersLivresRes.count ?? 0,
    caCommandes,
    montantEncaisse,
    soldeRestant: caCommandes - montantEncaisse,
    recentQuotes: (recentQuotesRes.data ?? []).map((q: Record<string, unknown>) => ({
      id: q.id as string,
      reference: q.reference as string,
      status: q.status as string,
      total: q.total as number,
      createdAt: q.created_at as string,
    })),
    recentOrders: (recentOrdersRes.data ?? []).map((o: Record<string, unknown>) => ({
      id: o.id as string,
      reference: o.reference as string,
      status: o.status as string,
      total: o.total as number,
      paidAmount: o.paid_amount as number,
      createdAt: o.created_at as string,
    })),
    recentCustomers: (recentCustomersRes.data ?? []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      contactName: c.contact_name as string,
      companyName: (c.company_name as string) ?? null,
      whatsapp: c.whatsapp as string,
      createdAt: c.created_at as string,
    })),
    recentActivity: (recentActivityRes.data ?? []).map((a: Record<string, unknown>) => ({
      id: a.id as string,
      action: a.action as string,
      entityType: (a.entity_type as string) ?? null,
      metadata: (a.metadata as Record<string, unknown>) ?? null,
      createdAt: a.created_at as string,
    })),
    urgentOrders: (urgentOrdersRes.data ?? []).map((o: Record<string, unknown>) => ({
      id: o.id as string,
      reference: o.reference as string,
      status: o.status as string,
      total: o.total as number,
      createdAt: o.created_at as string,
    })),
  });
}
