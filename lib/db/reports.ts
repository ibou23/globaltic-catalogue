import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapOrder } from "./mappers";
import { mapQuote } from "./mappers";
import type { ReportData, ReportPeriod, TopClient, ReportOrderRow } from "@/lib/types/reports";

function toDay(iso: string): string {
  return iso.slice(0, 10);
}

export async function getReportData(period: ReportPeriod): Promise<Result<ReportData>> {
  const supabase = await createClient();

  const from = `${period.from}T00:00:00.000Z`;
  const to   = `${period.to}T23:59:59.999Z`;

  const [quotesRes, ordersRes, invoicesRes] = await Promise.all([
    supabase
      .from("quotes")
      .select("id, status, total, created_at")
      .gte("created_at", from)
      .lte("created_at", to),
    supabase
      .from("orders")
      .select("*, customers(id, contact_name, company_name, whatsapp)")
      .gte("created_at", from)
      .lte("created_at", to)
      .order("total", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, status, created_at")
      .gte("created_at", from)
      .lte("created_at", to),
  ]);

  if (quotesRes.error)   return err(quotesRes.error.message);
  if (ordersRes.error)   return err(ordersRes.error.message);
  if (invoicesRes.error) return err(invoicesRes.error.message);

  const quotes   = (quotesRes.data   ?? []) as Record<string, unknown>[];
  const rawOrders = (ordersRes.data  ?? []) as Record<string, unknown>[];
  const invoices = (invoicesRes.data ?? []) as Record<string, unknown>[];

  // ── Devis ─────────────────────────────────────────────────────────────────
  const quotesCreated  = quotes.length;
  const quotesAccepted = quotes.filter((q) => q.status === "accepte").length;
  const quotesRefused  = quotes.filter((q) => q.status === "refuse").length;
  const quotesCA       = quotes
    .filter((q) => q.status === "accepte")
    .reduce((s, q) => s + ((q.total as number) ?? 0), 0);
  const tauxAcceptation = quotesCreated > 0
    ? Math.round((quotesAccepted / quotesCreated) * 100)
    : 0;

  // ── Commandes ─────────────────────────────────────────────────────────────
  const orders = rawOrders.map(mapOrder);

  const ordersCreated     = orders.length;
  const ordersCA          = orders.filter((o) => o.status !== "annulee").reduce((s, o) => s + o.total, 0);
  const ordersEncaisse    = orders.reduce((s, o) => s + o.paidAmount, 0);
  const ordersSolde       = orders
    .filter((o) => !["annulee", "livre"].includes(o.status))
    .reduce((s, o) => s + Math.max(0, o.total + (o.deliveryFee ?? 0) - o.paidAmount), 0);
  const ordersLivrees     = orders.filter((o) => o.status === "livre").length;
  const ordersEnCours     = orders.filter((o) => !["livre", "annulee"].includes(o.status)).length;
  const ordersAnnulees    = orders.filter((o) => o.status === "annulee").length;
  const ordersReclamations = orders.filter((o) => o.closureStatus === "reclamation").length;

  // ── Satisfaction ──────────────────────────────────────────────────────────
  const satisfaitCount   = orders.filter((o) => o.satisfaction === "satisfait").length;
  const neutreCount      = orders.filter((o) => o.satisfaction === "neutre").length;
  const insatisfaitCount = orders.filter((o) => o.satisfaction === "insatisfait").length;

  // ── Factures ──────────────────────────────────────────────────────────────
  const facturesEmises = invoices.filter((f) => f.status !== "brouillon").length;
  const facturesPayees = invoices.filter((f) => f.status === "payee").length;

  // ── Top clients ───────────────────────────────────────────────────────────
  const clientMap = new Map<string, TopClient>();
  for (const order of orders) {
    if (!order.customerId || order.status === "annulee") continue;
    const customerRaw = (rawOrders.find((r) => r.id === order.id) as Record<string, unknown> | undefined)?.customers as Record<string, unknown> | null;
    const name = (customerRaw?.contact_name as string) ?? "Client inconnu";
    const company = (customerRaw?.company_name as string) ?? null;
    const existing = clientMap.get(order.customerId);
    if (existing) {
      existing.ordersCount++;
      existing.totalCA   += order.total;
      existing.totalPaid += order.paidAmount;
    } else {
      clientMap.set(order.customerId, {
        customerId: order.customerId,
        name,
        company,
        ordersCount: 1,
        totalCA:    order.total,
        totalPaid:  order.paidAmount,
      });
    }
  }
  const topClients: TopClient[] = [...clientMap.values()]
    .sort((a, b) => b.totalCA - a.totalCA)
    .slice(0, 10);

  // ── Top commandes ─────────────────────────────────────────────────────────
  const toRow = (o: ReturnType<typeof mapOrder>, raw: Record<string, unknown>): ReportOrderRow => {
    const customerRaw = raw.customers as Record<string, unknown> | null;
    return {
      id:            o.id,
      reference:     o.reference,
      customer:      customerRaw ? (customerRaw.contact_name as string) : null,
      total:         o.total,
      paidAmount:    o.paidAmount,
      deliveryFee:   o.deliveryFee ?? 0,
      status:        o.status,
      createdAt:     o.createdAt,
      closureStatus: o.closureStatus,
      satisfaction:  o.satisfaction,
      complaint:     o.complaint,
    };
  };

  const topOrders: ReportOrderRow[] = orders
    .filter((o) => o.status !== "annulee")
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((o) => toRow(o, rawOrders.find((r) => r.id === o.id)!));

  const impayesOrders: ReportOrderRow[] = orders
    .filter((o) => o.total + (o.deliveryFee ?? 0) - o.paidAmount > 0 && !["annulee", "livre"].includes(o.status))
    .sort((a, b) => (b.total + (b.deliveryFee ?? 0) - b.paidAmount) - (a.total + (a.deliveryFee ?? 0) - a.paidAmount))
    .slice(0, 10)
    .map((o) => toRow(o, rawOrders.find((r) => r.id === o.id)!));

  const reclamations: ReportOrderRow[] = orders
    .filter((o) => o.closureStatus === "reclamation")
    .map((o) => toRow(o, rawOrders.find((r) => r.id === o.id)!));

  return ok({
    period,
    generatedAt: new Date().toISOString(),
    quotesCreated,
    quotesAccepted,
    quotesRefused,
    quotesCA,
    tauxAcceptation,
    ordersCreated,
    ordersCA,
    ordersEncaisse,
    ordersSolde,
    ordersLivrees,
    ordersEnCours,
    ordersAnnulees,
    ordersReclamations,
    satisfaitCount,
    neutreCount,
    insatisfaitCount,
    facturesEmises,
    facturesPayees,
    topClients,
    topOrders,
    impayesOrders,
    reclamations,
  });
}
