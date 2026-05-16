import { NextResponse } from "next/server";
import {
  verifyMetaSignature,
  processWebhookPayload,
  type MetaWebhookPayload,
} from "@/lib/whatsapp/webhook-handler";
import { storeWebhookEvent } from "@/lib/db/whatsapp-messages";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  console.log("[WhatsApp Webhook] Verification request received", {
    mode,
    hasChallenge: !!challenge,
    tokenMatches: token === verifyToken,
    verifyTokenConfigured: !!verifyToken,
  });

  if (!verifyToken) {
    return new Response("Webhook not configured", { status: 503 });
  }

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge ?? "", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const appSecret = process.env.META_APP_SECRET;

  if (!verifyToken) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const rawBody = await req.text();

  if (appSecret) {
    const signature = req.headers.get("x-hub-signature-256");
    if (!verifyMetaSignature(rawBody, signature, appSecret)) {
      await storeWebhookEvent({
        eventType: "invalid_signature",
        rawPayload: { signature, bodyLength: rawBody.length },
        processed: false,
        errorMessage: "Signature verification failed",
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: MetaWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as MetaWebhookPayload;
  } catch {
    await storeWebhookEvent({
      eventType: "parse_error",
      rawPayload: { rawBody: rawBody.slice(0, 500) },
      processed: false,
      errorMessage: "Failed to parse JSON body",
    });
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await processWebhookPayload(payload);

  if (result.errors.length > 0) {
    await storeWebhookEvent({
      eventType: "processing_errors",
      rawPayload: { errors: result.errors, messagesProcessed: result.messagesProcessed },
      processed: true,
      errorMessage: result.errors.join("; "),
    });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
