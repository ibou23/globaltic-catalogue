import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { ok, err, type Result } from "@/lib/utils/result";
import type { WhatsAppMessage, WhatsAppWebhookEvent } from "@/lib/types/domain";

function mapMessage(row: Record<string, unknown>): WhatsAppMessage {
  return {
    id: row.id as string,
    phoneNumber: (row.phone_number as string) ?? null,
    contactName: (row.contact_name as string) ?? null,
    prospectId: (row.prospect_id as string) ?? null,
    customerId: (row.customer_id as string) ?? null,
    whatsappMessageId: (row.whatsapp_message_id as string) ?? null,
    direction: row.direction as WhatsAppMessage["direction"],
    messageType: row.message_type as WhatsAppMessage["messageType"],
    content: (row.content as string) ?? null,
    status: row.status as WhatsAppMessage["status"],
    processed: row.processed as boolean,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    rawPayload: (row.raw_payload as Record<string, unknown>) ?? {},
    sentAt: row.sent_at as string,
    createdAt: row.created_at as string,
  };
}

function mapEvent(row: Record<string, unknown>): WhatsAppWebhookEvent {
  return {
    id: row.id as string,
    eventType: row.event_type as string,
    rawPayload: (row.raw_payload as Record<string, unknown>) ?? {},
    processed: row.processed as boolean,
    errorMessage: (row.error_message as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function getWhatsAppMessages(limit = 50): Promise<Result<WhatsAppMessage[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapMessage));
}

export async function getInboundMessages(limit = 50): Promise<Result<WhatsAppMessage[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("*")
    .eq("direction", "inbound")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapMessage));
}

export async function getUnprocessedMessages(): Promise<Result<WhatsAppMessage[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("*")
    .eq("processed", false)
    .eq("direction", "inbound")
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapMessage));
}

export async function markMessageProcessed(id: string): Promise<Result<null>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("whatsapp_messages")
    .update({ processed: true })
    .eq("id", id);

  if (error) return err(error.message);
  return ok(null);
}

export async function createInboundMessage(params: {
  phoneNumber: string;
  contactName: string | null;
  whatsappMessageId: string | null;
  messageType: WhatsAppMessage["messageType"];
  content: string | null;
  rawPayload: Record<string, unknown>;
  prospectId: string | null;
  customerId: string | null;
}): Promise<Result<WhatsAppMessage>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("whatsapp_messages")
    .insert({
      phone_number: params.phoneNumber,
      contact_name: params.contactName,
      whatsapp_message_id: params.whatsappMessageId,
      direction: "inbound",
      message_type: params.messageType,
      content: params.content,
      status: "received",
      raw_payload: params.rawPayload,
      prospect_id: params.prospectId,
      customer_id: params.customerId,
      processed: false,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapMessage(data as Record<string, unknown>));
}

export async function storeWebhookEvent(params: {
  eventType: string;
  rawPayload: Record<string, unknown>;
  processed?: boolean;
  errorMessage?: string;
}): Promise<Result<WhatsAppWebhookEvent>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("whatsapp_webhook_events")
    .insert({
      event_type: params.eventType,
      raw_payload: params.rawPayload,
      processed: params.processed ?? false,
      error_message: params.errorMessage ?? null,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapEvent(data as Record<string, unknown>));
}

export async function findContactByPhone(phone: string): Promise<{
  prospectId: string | null;
  customerId: string | null;
}> {
  const supabase = createAdminClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("whatsapp", phone)
    .maybeSingle();

  if (customer) return { prospectId: null, customerId: customer.id as string };

  const { data: prospect } = await supabase
    .from("prospects")
    .select("id")
    .eq("whatsapp", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (prospect) return { prospectId: prospect.id as string, customerId: null };

  return { prospectId: null, customerId: null };
}

export async function checkMessageDuplicate(messageId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { count } = await supabase
    .from("whatsapp_messages")
    .select("id", { count: "exact", head: true })
    .eq("whatsapp_message_id", messageId);

  return (count ?? 0) > 0;
}
