import crypto from "crypto";
import {
  createInboundMessage,
  storeWebhookEvent,
  findContactByPhone,
  checkMessageDuplicate,
} from "@/lib/db/whatsapp-messages";
import { createProspect } from "@/lib/db/prospects";
import { generateReference } from "@/lib/services/reference";
import { notifyNewProspect } from "@/lib/services/prospect-notify";

export function verifyMetaSignature(
  body: string,
  signature: string | null,
  appSecret: string
): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(body)
    .digest("hex");
  const provided = signature.replace("sha256=", "");
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(provided, "hex")
  );
}

interface MetaMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; caption?: string };
  document?: { id: string; filename?: string; caption?: string };
  audio?: { id: string };
}

interface MetaContact {
  wa_id: string;
  profile?: { name?: string };
}

interface MetaWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata?: { display_phone_number?: string; phone_number_id?: string };
      contacts?: MetaContact[];
      messages?: MetaMessage[];
      statuses?: Array<{ id: string; status: string; timestamp: string; recipient_id: string }>;
    };
    field: string;
  }>;
}

export interface MetaWebhookPayload {
  object: string;
  entry: MetaWebhookEntry[];
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

function getMessageType(type: string): "text" | "image" | "document" | "audio" | "other" {
  if (type === "text") return "text";
  if (type === "image") return "image";
  if (type === "document") return "document";
  if (type === "audio") return "audio";
  return "other";
}

function getMessageContent(msg: MetaMessage): string | null {
  if (msg.text?.body) return msg.text.body;
  if (msg.image?.caption) return msg.image.caption;
  if (msg.document?.caption) return msg.document.caption;
  if (msg.document?.filename) return `[Document: ${msg.document.filename}]`;
  if (msg.type === "image") return "[Image]";
  if (msg.type === "audio") return "[Audio]";
  return null;
}

export async function processWebhookPayload(payload: MetaWebhookPayload): Promise<{
  messagesProcessed: number;
  errors: string[];
}> {
  let messagesProcessed = 0;
  const errors: string[] = [];

  await storeWebhookEvent({
    eventType: payload.object === "whatsapp_business_account" ? "messages" : payload.object,
    rawPayload: payload as unknown as Record<string, unknown>,
  });

  if (payload.object !== "whatsapp_business_account") {
    return { messagesProcessed: 0, errors: ["Not a WhatsApp Business payload"] };
  }

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const value = change.value;

      if (value.statuses) {
        await storeWebhookEvent({
          eventType: "status_update",
          rawPayload: { statuses: value.statuses } as unknown as Record<string, unknown>,
          processed: true,
        });
        continue;
      }

      if (!value.messages) continue;

      const contacts = value.contacts ?? [];

      for (const msg of value.messages) {
        try {
          if (await checkMessageDuplicate(msg.id)) continue;

          const phone = normalizePhone(msg.from);
          const contact = contacts.find(c => normalizePhone(c.wa_id) === phone);
          const contactName = contact?.profile?.name ?? null;

          let { prospectId, customerId } = await findContactByPhone(phone);

          if (!prospectId && !customerId) {
            const reference = await generateReference("PRO");
            const prospectResult = await createProspect(
              {
                full_name: contactName || `WhatsApp ${phone}`,
                whatsapp: phone,
                requested_products: [],
                product_details: [],
              },
              reference
            );
            if (prospectResult.data) {
              prospectId = prospectResult.data.id;
              notifyNewProspect(prospectResult.data).catch(() => {});
            }
          }

          await createInboundMessage({
            phoneNumber: phone,
            contactName,
            whatsappMessageId: msg.id,
            messageType: getMessageType(msg.type),
            content: getMessageContent(msg),
            rawPayload: msg as unknown as Record<string, unknown>,
            prospectId,
            customerId,
          });

          messagesProcessed++;
        } catch (e) {
          errors.push(`Message ${msg.id}: ${e instanceof Error ? e.message : "unknown error"}`);
        }
      }
    }
  }

  return { messagesProcessed, errors };
}
