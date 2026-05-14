import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import type { Notification, AdminRole } from "@/lib/types/domain";

function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    recipientType: row.recipient_type as Notification["recipientType"],
    recipientId: row.recipient_id as string,
    channel: row.channel as Notification["channel"],
    title: row.title as string,
    body: row.body as string,
    isRead: row.is_read as boolean,
    entityType: (row.entity_type as string) ?? null,
    entityId: (row.entity_id as string) ?? null,
    link: (row.link as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function getUnreadCount(adminId: string): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", adminId)
    .eq("recipient_type", "admin")
    .eq("channel", "in_app")
    .eq("is_read", false);

  return count ?? 0;
}

export async function getAdminNotifications(
  adminId: string,
  limit = 30
): Promise<Result<Notification[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", adminId)
    .eq("recipient_type", "admin")
    .eq("channel", "in_app")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapNotification));
}

export async function markNotificationRead(
  notificationId: string,
  adminId: string
): Promise<Result<true>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("recipient_id", adminId);

  if (error) return err(error.message);
  return ok(true);
}

export async function markAllNotificationsRead(adminId: string): Promise<Result<true>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient_id", adminId)
    .eq("recipient_type", "admin")
    .eq("channel", "in_app")
    .eq("is_read", false);

  if (error) return err(error.message);
  return ok(true);
}

// Rôles qui reçoivent une notification selon l'événement
const EVENT_TARGET_ROLES: Record<string, AdminRole[]> = {
  devis_cree:              ["patron", "admin", "commercial"],
  devis_accepte:           ["patron", "admin", "commercial"],
  commande_creee:          ["patron", "admin", "production"],
  paiement_mis_a_jour:     ["patron", "admin", "commercial"],
  solde_restant:           ["patron", "admin", "commercial"],
  fichier_ajoute:          ["patron", "admin", "infographiste"],
  bat_en_cours:            ["patron", "admin", "infographiste"],
  bat_valide:              ["patron", "admin", "production"],
  corrections_demandees:   ["patron", "admin", "infographiste"],
  commande_prete:          ["patron", "admin", "commercial"],
  en_livraison:            ["patron", "admin", "commercial"],
};

export async function createAdminNotifications(params: {
  eventKey: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  link?: string;
  // Liste de tous les profils admin actifs à filtrer
  adminProfiles: Array<{ id: string; userId: string; role: AdminRole; isActive: boolean }>;
}): Promise<void> {
  const targetRoles = EVENT_TARGET_ROLES[params.eventKey];
  if (!targetRoles) return;

  const recipients = params.adminProfiles.filter(
    (p) => p.isActive && targetRoles.includes(p.role)
  );
  if (recipients.length === 0) return;

  const supabase = await createClient();

  const rows = recipients.map((p) => ({
    recipient_type: "admin",
    recipient_id: p.userId,
    channel: "in_app",
    title: params.title,
    body: params.body,
    entity_type: params.entityType ?? null,
    entity_id: params.entityId ?? null,
    link: params.link ?? null,
    is_read: false,
  }));

  await supabase.from("notifications").insert(rows);
  // Non bloquant — échec silencieux
}
