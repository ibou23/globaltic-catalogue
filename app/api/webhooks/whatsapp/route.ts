import { NextResponse } from "next/server";

/**
 * Meta WhatsApp Cloud API — Webhook verification (GET)
 * Activé lors de la configuration du webhook dans Meta Business Suite.
 * Variables d'environnement requises (à configurer plus tard) :
 * - WHATSAPP_VERIFY_TOKEN
 * - WHATSAPP_ACCESS_TOKEN
 * - WHATSAPP_PHONE_NUMBER_ID
 * - WHATSAPP_BUSINESS_ACCOUNT_ID
 * - META_APP_SECRET
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * Meta WhatsApp Cloud API — Incoming messages (POST)
 * Stub prêt pour l'intégration future.
 */
export async function POST(_req: Request) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  // TODO Phase 4 : valider la signature Meta (META_APP_SECRET)
  // TODO Phase 4 : parser le body et enregistrer dans whatsapp_messages
  // TODO Phase 4 : relier au prospect via numéro WhatsApp

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
