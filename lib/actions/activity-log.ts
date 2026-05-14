"use server";

import { getOrderActivityLog, type ActivityLogEntry } from "@/lib/db/activity-log";
import { getCurrentAdmin } from "@/lib/db/admin";
import { err, type Result } from "@/lib/utils/result";

export async function getOrderActivityLogAction(
  orderId: string
): Promise<Result<ActivityLogEntry[]>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  return getOrderActivityLog(orderId);
}
