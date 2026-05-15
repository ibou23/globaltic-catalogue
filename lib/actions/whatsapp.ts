"use server";

import { markMessageProcessed } from "@/lib/db/whatsapp-messages";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { err, type Result } from "@/lib/utils/result";

export async function markWhatsAppMessageProcessedAction(
  id: string
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);

  return markMessageProcessed(id);
}
