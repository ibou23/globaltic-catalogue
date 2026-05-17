"use server";

import { markMessageProcessed, createInboundMessage } from "@/lib/db/whatsapp-messages";
import { createProspect } from "@/lib/db/prospects";
import { createTask } from "@/lib/db/tasks";
import { generateReference } from "@/lib/services/reference";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireActionDynamic } from "@/lib/auth/check-access";
import { err, ok, type Result } from "@/lib/utils/result";
import type { Prospect, Task } from "@/lib/types/domain";

export async function markWhatsAppMessageProcessedAction(
  id: string
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);

  return markMessageProcessed(id);
}

export async function unmarkWhatsAppMessageProcessedAction(
  id: string
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { error } = await supabase
    .from("whatsapp_messages")
    .update({ processed: false })
    .eq("id", id);

  if (error) return err(error.message);
  return ok(null);
}

export async function createProspectFromMessageAction(
  messageId: string,
  phoneNumber: string,
  contactName: string | null,
  content: string | null
): Promise<Result<Prospect>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);

  const reference = await generateReference("PRO");
  const result = await createProspect(
    {
      full_name: contactName || `WhatsApp ${phoneNumber}`,
      whatsapp: phoneNumber,
      requested_products: [],
      product_details: [],
      message: content ?? undefined,
    },
    reference
  );

  if (!result.data) return result;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase
    .from("whatsapp_messages")
    .update({ prospect_id: result.data.id, processed: true })
    .eq("id", messageId);

  return result;
}

export async function linkMessageToProspectAction(
  messageId: string,
  prospectId: string
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { error } = await supabase
    .from("whatsapp_messages")
    .update({ prospect_id: prospectId, processed: true })
    .eq("id", messageId);

  if (error) return err(error.message);
  return ok(null);
}

export async function linkMessageToCustomerAction(
  messageId: string,
  customerId: string
): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { error } = await supabase
    .from("whatsapp_messages")
    .update({ customer_id: customerId, processed: true })
    .eq("id", messageId);

  if (error) return err(error.message);
  return ok(null);
}

export async function createTaskFromMessageAction(
  messageId: string,
  phoneNumber: string,
  contactName: string | null,
  content: string | null,
  prospectId: string | null
): Promise<Result<Task>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "prospect:edit");
  if (denied) return err(denied);
  if (!admin.data) return err("Accès non autorisé");

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const title = `Répondre à ${contactName || phoneNumber}${content ? ` : "${content.slice(0, 50)}"` : ""}`;

  const result = await createTask(
    {
      title,
      description: content ?? undefined,
      task_type: "appeler_client",
      priority: "haute",
      status: "a_faire",
      due_date: tomorrow,
      prospect_id: prospectId,
      customer_id: null,
      quote_id: null,
      order_id: null,
      assigned_to: admin.data.userId,
    },
    admin.data.userId
  );

  if (result.data) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase
      .from("whatsapp_messages")
      .update({ processed: true })
      .eq("id", messageId);
  }

  return result;
}
