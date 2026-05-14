import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";

export interface ActivityLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

function mapEntry(row: Record<string, unknown>): ActivityLogEntry {
  return {
    id: row.id as string,
    userId: (row.user_id as string) ?? null,
    action: row.action as string,
    entityType: (row.entity_type as string) ?? null,
    entityId: (row.entity_id as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function getOrderActivityLog(
  orderId: string
): Promise<Result<ActivityLogEntry[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("entity_type", "order")
    .eq("entity_id", orderId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapEntry));
}

export async function logOrderEvent(
  userId: string | null,
  orderId: string,
  action: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("activity_log").insert({
    user_id: userId ?? null,
    action,
    entity_type: "order",
    entity_id: orderId,
    metadata: metadata ?? null,
  });
  // Non bloquant : on n'interrompt pas le flux principal si le log échoue
}
