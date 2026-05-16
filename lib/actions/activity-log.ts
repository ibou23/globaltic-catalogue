"use server";

import { getOrderActivityLog, type ActivityLogEntry } from "@/lib/db/activity-log";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireActionDynamic } from "@/lib/auth/check-access";
import { err, type Result } from "@/lib/utils/result";

export async function getOrderActivityLogAction(
  orderId: string
): Promise<Result<ActivityLogEntry[]>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "commande:edit_status");
  if (denied) return err(denied);
  return getOrderActivityLog(orderId);
}
