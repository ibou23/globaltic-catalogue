import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import type { InvoiceStatus } from "@/lib/types/domain";

export interface ImpayeRow {
  type:             "invoice" | "order_only";
  invoiceId:        string | null;
  invoiceRef:       string | null;
  invoiceStatus:    InvoiceStatus | null;
  invoiceIssuedAt:  string | null;
  orderId:          string;
  orderRef:         string;
  orderStatus:      string;
  lastPaymentAt:    string | null;
  customerId:       string | null;
  customerName:     string | null;
  customerCompany:  string | null;
  customerWhatsapp: string | null;
  total:            number;
  paidAmount:       number;
  balance:          number;
}

export interface ImpayesStats {
  totalBalance:       number;
  nbInvoicesUnpaid:   number;
  nbDeliveredUnpaid:  number;
}

export async function getImpayeRows(): Promise<Result<ImpayeRow[]>> {
  const supabase = await createClient();

  // 1. Factures avec solde > 0 (hors annulées et payées)
  const { data: invData, error: invErr } = await supabase
    .from("invoices")
    .select(`
      id, reference, status, issued_at, order_id, customer_id, total, paid_amount,
      orders(id, reference, status, last_payment_at),
      customers(id, contact_name, company_name, whatsapp)
    `)
    .not("status", "in", '("annulee","payee")')
    .order("issued_at", { ascending: false });

  if (invErr) return err(invErr.message);

  const invoiceOrderIds = new Set<string>();
  const rows: ImpayeRow[] = [];

  for (const raw of (invData ?? []) as Record<string, unknown>[]) {
    const total      = raw.total       as number;
    const paidAmount = raw.paid_amount as number;
    const balance    = total - paidAmount;
    if (balance <= 0) continue;

    const orderId     = raw.order_id   as string;
    const orderRaw    = raw.orders     as Record<string, unknown> | null;
    const customerRaw = raw.customers  as Record<string, unknown> | null;
    invoiceOrderIds.add(orderId);

    rows.push({
      type:             "invoice",
      invoiceId:        raw.id        as string,
      invoiceRef:       raw.reference as string,
      invoiceStatus:    raw.status    as InvoiceStatus,
      invoiceIssuedAt:  raw.issued_at as string,
      orderId,
      orderRef:         (orderRaw?.reference      as string) ?? "",
      orderStatus:      (orderRaw?.status         as string) ?? "",
      lastPaymentAt:    (orderRaw?.last_payment_at as string) ?? null,
      customerId:       (raw.customer_id          as string) ?? null,
      customerName:     (customerRaw?.contact_name as string) ?? null,
      customerCompany:  (customerRaw?.company_name as string) ?? null,
      customerWhatsapp: (customerRaw?.whatsapp     as string) ?? null,
      total,
      paidAmount,
      balance,
    });
  }

  // 2. Commandes livrées avec solde > 0 sans facture existante
  const { data: ordData, error: ordErr } = await supabase
    .from("orders")
    .select(`
      id, reference, status, total, paid_amount, last_payment_at, customer_id,
      customers(id, contact_name, company_name, whatsapp)
    `)
    .eq("status", "livre")
    .order("created_at", { ascending: false });

  if (ordErr) return err(ordErr.message);

  for (const raw of (ordData ?? []) as Record<string, unknown>[]) {
    const total      = raw.total       as number;
    const paidAmount = raw.paid_amount as number;
    const balance    = total - paidAmount;
    if (balance <= 0) continue;

    const orderId = raw.id as string;
    if (invoiceOrderIds.has(orderId)) continue;

    const customerRaw = raw.customers as Record<string, unknown> | null;
    rows.push({
      type:             "order_only",
      invoiceId:        null,
      invoiceRef:       null,
      invoiceStatus:    null,
      invoiceIssuedAt:  null,
      orderId,
      orderRef:         raw.reference     as string,
      orderStatus:      raw.status        as string,
      lastPaymentAt:    (raw.last_payment_at as string) ?? null,
      customerId:       (raw.customer_id    as string) ?? null,
      customerName:     (customerRaw?.contact_name as string) ?? null,
      customerCompany:  (customerRaw?.company_name as string) ?? null,
      customerWhatsapp: (customerRaw?.whatsapp     as string) ?? null,
      total,
      paidAmount,
      balance,
    });
  }

  // Trier par solde décroissant
  rows.sort((a, b) => b.balance - a.balance);
  return ok(rows);
}

export async function getImpayesStats(): Promise<Result<ImpayesStats>> {
  const supabase = await createClient();

  const [invRes, ordRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("total, paid_amount")
      .not("status", "in", '("annulee","payee")'),
    supabase
      .from("orders")
      .select("total, paid_amount")
      .eq("status", "livre"),
  ]);

  if (invRes.error) return err(invRes.error.message);
  if (ordRes.error) return err(ordRes.error.message);

  const invRows = (invRes.data ?? []) as Array<{ total: number; paid_amount: number }>;
  const ordRows = (ordRes.data ?? []) as Array<{ total: number; paid_amount: number }>;

  let totalBalance = 0;
  let nbInvoicesUnpaid = 0;
  for (const r of invRows) {
    const b = r.total - r.paid_amount;
    if (b > 0) { totalBalance += b; nbInvoicesUnpaid++; }
  }

  const nbDeliveredUnpaid = ordRows.filter((r) => r.total - r.paid_amount > 0).length;

  return ok({ totalBalance, nbInvoicesUnpaid, nbDeliveredUnpaid });
}
