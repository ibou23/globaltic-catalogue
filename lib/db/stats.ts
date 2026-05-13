import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalQuotes: number;
  totalOrders: number;
  totalCustomers: number;
  totalRealisations: number;
  pendingQuotes: number;
  activeOrders: number;
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
    activeOrdersRes,
    recentQuotesRes,
    recentOrdersRes,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("quotes").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("realisations").select("id", { count: "exact", head: true }),
    supabase.from("quotes").select("id", { count: "exact", head: true }).in("status", ["brouillon", "envoye"]),
    supabase.from("orders").select("id", { count: "exact", head: true }).not("status", "in", '("livre","annulee")'),
    supabase.from("quotes").select("id, reference, status, total, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("id, reference, status, total, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const anyError = [productsRes, categoriesRes, quotesRes, ordersRes, customersRes, realisationsRes].find(r => r.error);
  if (anyError?.error) return err(anyError.error.message);

  return ok({
    totalProducts: productsRes.count ?? 0,
    totalCategories: categoriesRes.count ?? 0,
    totalQuotes: quotesRes.count ?? 0,
    totalOrders: ordersRes.count ?? 0,
    totalCustomers: customersRes.count ?? 0,
    totalRealisations: realisationsRes.count ?? 0,
    pendingQuotes: pendingQuotesRes.count ?? 0,
    activeOrders: activeOrdersRes.count ?? 0,
    recentQuotes: (recentQuotesRes.data ?? []).map(q => ({
      id: q.id,
      reference: q.reference,
      status: q.status,
      total: q.total,
      createdAt: q.created_at,
    })),
    recentOrders: (recentOrdersRes.data ?? []).map(o => ({
      id: o.id,
      reference: o.reference,
      status: o.status,
      total: o.total,
      createdAt: o.created_at,
    })),
  });
}
