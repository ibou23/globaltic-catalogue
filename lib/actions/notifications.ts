"use server";

import {
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  insertDirectNotification,
} from "@/lib/db/notifications";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { err, ok, type Result } from "@/lib/utils/result";
import type { Notification } from "@/lib/types/domain";

export async function getNotificationsAction(): Promise<Result<Notification[]>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  return getAdminNotifications(admin.data.userId);
}

export async function markReadAction(notificationId: string): Promise<Result<true>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  return markNotificationRead(notificationId, admin.data.userId);
}

export async function markAllReadAction(): Promise<Result<true>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  return markAllNotificationsRead(admin.data.userId);
}

// Action de diagnostic — crée une notification test pour l'admin connecté (patron uniquement)
export async function createTestNotificationAction(): Promise<Result<true>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "admin_user:read");
  if (denied) return err(denied);
  if (!admin.data) return err("Accès non autorisé");

  const result = await insertDirectNotification({
    recipientUserId: admin.data.userId,
    title: "Notification test",
    body: "Le système de notifications fonctionne correctement.",
    entityType: "system",
    link: "/admin",
  });

  if (!result.ok) return err(result.error ?? "Erreur lors de la création");
  return ok(true);
}
