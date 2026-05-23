import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import type { Invoice, InvoiceEnriched, InvoiceStatus } from "@/lib/types/domain";

function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id:          row.id          as string,
    reference:   row.reference   as string,
    legacyReference: (row.legacy_reference as string) ?? null,
    orderId:     row.order_id    as string,
    customerId:  (row.customer_id  as string) ?? null,
    status:      row.status      as InvoiceStatus,
    total:       row.total       as number,
    paidAmount:  row.paid_amount as number,
    issuedAt:    row.issued_at   as string,
    generatedBy: (row.generated_by as string) ?? null,
    notes:       (row.notes        as string) ?? null,
    createdAt:   row.created_at  as string,
    updatedAt:   row.updated_at  as string,
  };
}

function mapInvoiceEnriched(row: Record<string, unknown>): InvoiceEnriched {
  const invoice = mapInvoice(row);
  const orderRaw   = row.orders   as Record<string, unknown> | null;
  const customerRaw = row.customers as Record<string, unknown> | null;
  return {
    ...invoice,
    order: orderRaw
      ? { id: orderRaw.id as string, reference: orderRaw.reference as string, status: orderRaw.status as string }
      : null,
    customer: customerRaw
      ? {
          id:          customerRaw.id          as string,
          contactName: customerRaw.contact_name as string,
          companyName: (customerRaw.company_name as string) ?? null,
          whatsapp:    customerRaw.whatsapp    as string,
        }
      : null,
  };
}

const ENRICHED_SELECT = `
  *,
  orders(id, reference, status),
  customers(id, contact_name, company_name, whatsapp)
`;

export async function getInvoices(): Promise<Result<InvoiceEnriched[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(ENRICHED_SELECT)
    .order("issued_at", { ascending: false });

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapInvoiceEnriched));
}

export async function getInvoiceByOrderId(
  orderId: string
): Promise<Result<Invoice | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapInvoice(data as Record<string, unknown>) : null);
}

export async function getInvoiceById(
  id: string
): Promise<Result<InvoiceEnriched | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(ENRICHED_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message);
  if (!data) return ok(null);
  return ok(mapInvoiceEnriched(data as Record<string, unknown>));
}

export async function createInvoice(input: {
  reference:   string;
  orderId:     string;
  customerId:  string | null;
  status:      InvoiceStatus;
  total:       number;
  paidAmount:  number;
  generatedBy: string | null;
  notes:       string | null;
}): Promise<Result<Invoice>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      reference:    input.reference,
      order_id:     input.orderId,
      customer_id:  input.customerId  ?? null,
      status:       input.status,
      total:        input.total,
      paid_amount:  input.paidAmount,
      generated_by: input.generatedBy ?? null,
      notes:        input.notes       ?? null,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapInvoice(data as Record<string, unknown>));
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<Result<Invoice>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapInvoice(data as Record<string, unknown>));
}

export async function syncInvoicePayment(
  orderId: string,
  paidAmount: number,
  total: number
): Promise<void> {
  const supabase = await createClient();

  const status: InvoiceStatus =
    paidAmount >= total ? "payee"
    : paidAmount > 0   ? "partiellement_payee"
    : "emise";

  await supabase
    .from("invoices")
    .update({ paid_amount: paidAmount, total, status, updated_at: new Date().toISOString() })
    .eq("order_id", orderId);
}

export async function getInvoicesByOrderIds(
  orderIds: string[]
): Promise<Result<Map<string, Invoice>>> {
  if (orderIds.length === 0) return ok(new Map());
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .in("order_id", orderIds);

  if (error) return err(error.message);
  const map = new Map<string, Invoice>();
  for (const row of (data as Record<string, unknown>[])) {
    const inv = mapInvoice(row);
    map.set(inv.orderId, inv);
  }
  return ok(map);
}
