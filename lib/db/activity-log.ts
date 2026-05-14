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
  // Non bloquant
}

export async function logAdminEvent(
  actorId: string | null,
  action: string,
  targetId: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("activity_log").insert({
    user_id: actorId ?? null,
    action,
    entity_type: "admin_user",
    entity_id: targetId ?? null,
    metadata: metadata ?? null,
  });
  // Non bloquant
}

export async function logMaintenanceEvent(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("activity_log").insert({
    user_id: actorId ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    metadata: { ...metadata, _maintenance: true },
  });
  // Non bloquant
}

export async function deleteReadNotifications(recipientId: string): Promise<Result<number>> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .delete({ count: "exact" })
    .eq("recipient_id", recipientId)
    .eq("is_read", true);

  if (error) return err(error.message);
  return ok(count ?? 0);
}

export async function getMaintenanceStats(): Promise<Result<{
  readNotifications: number;
  orphanQuotes: number;
}>> {
  const supabase = await createClient();

  const [notifResult, quotesResult] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", true),
    supabase.from("quotes").select("id", { count: "exact", head: true }),
  ]);

  if (notifResult.error) return err(notifResult.error.message);

  return ok({
    readNotifications: notifResult.count ?? 0,
    orphanQuotes: quotesResult.count ?? 0,
  });
}
