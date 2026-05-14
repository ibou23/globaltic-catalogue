"use server";

import {
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/db/notifications";
import { getCurrentAdmin } from "@/lib/db/admin";
import { err, type Result } from "@/lib/utils/result";
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
