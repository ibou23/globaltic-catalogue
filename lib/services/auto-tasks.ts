import { createClient } from "@/lib/supabase/server";
import { createTask } from "@/lib/db/tasks";
import type { Task } from "@/lib/types/domain";
import type { Result } from "@/lib/utils/result";

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0]!;
}

async function taskExists(filters: {
  quoteId?: string;
  orderId?: string;
  customerId?: string;
  taskType: string;
  title: string;
}): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("task_type", filters.taskType)
    .eq("title", filters.title)
    .not("status", "in", '("terminee","annulee")');

  if (filters.quoteId) query = query.eq("quote_id", filters.quoteId);
  if (filters.orderId) query = query.eq("order_id", filters.orderId);
  if (filters.customerId) query = query.eq("customer_id", filters.customerId);

  const { count } = await query;
  return (count ?? 0) > 0;
}

export async function createQuoteFollowUpTasks(opts: {
  quoteId: string;
  quoteRef: string;
  customerId: string | null;
  assignedTo: string;
  isUrgent: boolean;
}): Promise<void> {
  const { quoteId, quoteRef, customerId, assignedTo, isUrgent } = opts;
  const priority = isUrgent ? "haute" : "normale";

  const tasks = [
    { title: `Relance devis ${quoteRef} — J+1`, days: 1 },
    { title: `Relance devis ${quoteRef} — J+3`, days: 3 },
    { title: `Relance devis ${quoteRef} — J+7`, days: 7 },
  ];

  for (const { title, days } of tasks) {
    const exists = await taskExists({ quoteId, taskType: "relancer_devis", title });
    if (exists) continue;

    await createTask(
      {
        title,
        task_type: "relancer_devis",
        priority,
        status: "a_faire",
        due_date: addDays(days),
        customer_id: customerId ?? null,
        prospect_id: null,
        quote_id: quoteId,
        order_id: null,
        assigned_to: assignedTo,
      },
      assignedTo
    );
  }
}

export async function createSatisfactionTask(opts: {
  orderId: string;
  orderRef: string;
  customerId: string | null;
  assignedTo: string;
}): Promise<void> {
  const { orderId, orderRef, customerId, assignedTo } = opts;
  const title = `Vérifier satisfaction client — ${orderRef}`;

  const exists = await taskExists({ orderId, taskType: "confirmer_livraison", title });
  if (exists) return;

  await createTask(
    {
      title,
      task_type: "confirmer_livraison",
      priority: "haute",
      status: "a_faire",
      due_date: addDays(1),
      customer_id: customerId ?? null,
      prospect_id: null,
      quote_id: null,
      order_id: orderId,
      assigned_to: assignedTo,
    },
    assignedTo
  );
}

export async function createLoyaltyTask(opts: {
  orderId: string;
  orderRef: string;
  customerId: string | null;
  assignedTo: string;
}): Promise<void> {
  const { orderId, orderRef, customerId, assignedTo } = opts;
  if (!customerId) return;

  const title = `Relancer client pour nouvelle commande — ${orderRef}`;

  const exists = await taskExists({ customerId, orderId, taskType: "appeler_client", title });
  if (exists) return;

  await createTask(
    {
      title,
      task_type: "appeler_client",
      priority: "normale",
      status: "a_faire",
      due_date: addDays(30),
      customer_id: customerId,
      prospect_id: null,
      quote_id: null,
      order_id: orderId,
      assigned_to: assignedTo,
    },
    assignedTo
  );
}

export interface UntreatedProspectAlert {
  count: number;
  oldestMinutes: number;
}

export async function getUntreatedProspectsAlert(): Promise<UntreatedProspectAlert | null> {
  const supabase = await createClient();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("prospects")
    .select("created_at")
    .eq("status", "nouveau")
    .is("contacted_at", null)
    .lt("created_at", twoHoursAgo)
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) return null;

  const oldest = new Date(data[0].created_at as string);
  const minutes = Math.floor((Date.now() - oldest.getTime()) / 60000);

  return { count: data.length, oldestMinutes: minutes };
}
