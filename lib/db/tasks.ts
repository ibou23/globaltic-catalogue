import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import type { Task, TaskEnriched, TaskStatus } from "@/lib/types/domain";
import type { TaskInput } from "@/lib/validators/task";

function mapTask(row: Record<string, unknown>): Task {
  return {
    id:          row.id as string,
    title:       row.title as string,
    description: (row.description as string) ?? null,
    taskType:    row.task_type as Task["taskType"],
    priority:    row.priority as Task["priority"],
    status:      row.status as Task["status"],
    dueDate:     (row.due_date as string) ?? null,
    closedAt:    (row.closed_at as string) ?? null,
    customerId:  (row.customer_id as string) ?? null,
    quoteId:     (row.quote_id as string) ?? null,
    orderId:     (row.order_id as string) ?? null,
    createdBy:   (row.created_by as string) ?? null,
    assignedTo:  (row.assigned_to as string) ?? null,
    createdAt:   row.created_at as string,
    updatedAt:   row.updated_at as string,
  };
}

function mapTaskEnriched(row: Record<string, unknown>): TaskEnriched {
  const task = mapTask(row);

  const customerRaw    = row.customers as Record<string, unknown> | null;
  const quoteRaw       = row.quotes    as Record<string, unknown> | null;
  const orderRaw       = row.orders    as Record<string, unknown> | null;
  const assignedRaw    = row.assigned_admin  as Record<string, unknown> | null;
  const createdByRaw   = row.created_by_admin as Record<string, unknown> | null;

  return {
    ...task,
    customer: customerRaw
      ? {
          id:          customerRaw.id as string,
          contactName: customerRaw.contact_name as string,
          whatsapp:    customerRaw.whatsapp as string,
          companyName: (customerRaw.company_name as string) ?? null,
        }
      : null,
    quote: quoteRaw
      ? { id: quoteRaw.id as string, reference: quoteRaw.reference as string, total: quoteRaw.total as number }
      : null,
    order: orderRaw
      ? { id: orderRaw.id as string, reference: orderRaw.reference as string, total: orderRaw.total as number }
      : null,
    assignedAdmin: assignedRaw
      ? { id: assignedRaw.id as string, fullName: assignedRaw.full_name as string, email: assignedRaw.email as string }
      : null,
    createdByAdmin: createdByRaw
      ? { id: createdByRaw.id as string, fullName: createdByRaw.full_name as string }
      : null,
  };
}

// Jointures réutilisables
const ENRICHED_SELECT = `
  *,
  customers(id, contact_name, whatsapp, company_name),
  quotes(id, reference, total),
  orders(id, reference, total),
  assigned_admin:admin_profiles!tasks_assigned_to_fkey(id, full_name, email),
  created_by_admin:admin_profiles!tasks_created_by_fkey(id, full_name)
`;

export async function getTasks(): Promise<Result<TaskEnriched[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(ENRICHED_SELECT)
    .not("status", "in", '("terminee","annulee")')
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapTaskEnriched));
}

export async function getAllTasks(): Promise<Result<TaskEnriched[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(ENRICHED_SELECT)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapTaskEnriched));
}

export async function getTasksByCustomer(customerId: string): Promise<Result<TaskEnriched[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(ENRICHED_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapTaskEnriched));
}

export async function getTasksDueToday(): Promise<Result<TaskEnriched[]>> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("tasks")
    .select(ENRICHED_SELECT)
    .eq("due_date", today)
    .not("status", "in", '("terminee","annulee")')
    .order("priority", { ascending: false });

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapTaskEnriched));
}

export async function getOverdueTasks(): Promise<Result<TaskEnriched[]>> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("tasks")
    .select(ENRICHED_SELECT)
    .lt("due_date", today)
    .not("status", "in", '("terminee","annulee")')
    .order("due_date", { ascending: true });

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapTaskEnriched));
}

export async function createTask(
  input: TaskInput,
  createdByUserId: string
): Promise<Result<Task>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title:       input.title,
      description: input.description ?? null,
      task_type:   input.task_type,
      priority:    input.priority,
      status:      input.status ?? "a_faire",
      due_date:    input.due_date ?? null,
      customer_id: input.customer_id ?? null,
      quote_id:    input.quote_id ?? null,
      order_id:    input.order_id ?? null,
      assigned_to: input.assigned_to ?? null,
      created_by:  createdByUserId,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapTask(data as Record<string, unknown>));
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<Result<Task>> {
  const supabase = await createClient();

  const updates: Record<string, unknown> = { status };
  if (status === "terminee" || status === "annulee") {
    updates.closed_at = new Date().toISOString();
  } else {
    updates.closed_at = null;
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapTask(data as Record<string, unknown>));
}

export async function updateTask(
  id: string,
  input: Partial<TaskInput>
): Promise<Result<Task>> {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (input.title       !== undefined) updates.title       = input.title;
  if (input.description !== undefined) updates.description = input.description ?? null;
  if (input.task_type   !== undefined) updates.task_type   = input.task_type;
  if (input.priority    !== undefined) updates.priority    = input.priority;
  if (input.status      !== undefined) {
    updates.status = input.status;
    if (input.status === "terminee" || input.status === "annulee") {
      updates.closed_at = new Date().toISOString();
    } else {
      updates.closed_at = null;
    }
  }
  if (input.due_date    !== undefined) updates.due_date    = input.due_date ?? null;
  if (input.customer_id !== undefined) updates.customer_id = input.customer_id ?? null;
  if (input.quote_id    !== undefined) updates.quote_id    = input.quote_id ?? null;
  if (input.order_id    !== undefined) updates.order_id    = input.order_id ?? null;
  if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to ?? null;

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapTask(data as Record<string, unknown>));
}

export async function deleteTask(id: string): Promise<Result<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return err(error.message);
  return ok(null);
}
