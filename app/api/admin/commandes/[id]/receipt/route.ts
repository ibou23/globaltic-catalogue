import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type JSXElementConstructor, type ReactElement } from "react";
import { NextResponse } from "next/server";
import { getOrderEnrichedById } from "@/lib/db/orders";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canPerform } from "@/lib/auth/permissions";
import { getBusinessConfig } from "@/lib/db/business-config";
import { PaymentReceiptPDF } from "@/components/pdf/PaymentReceiptPDF";
import { checkRateLimitOpen } from "@/lib/security/rate-limit";
import path from "path";
import fs from "fs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin.data) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }
  if (!canPerform(admin.data.role, "receipt:generate")) {
    return NextResponse.json({ error: "Vous n'avez pas les droits nécessaires" }, { status: 403 });
  }

  const rateLimitError = await checkRateLimitOpen("pdf", admin.data.userId);
  if (rateLimitError) {
    return NextResponse.json({ error: rateLimitError }, { status: 429 });
  }

  const { id } = await params;

  const [orderResult, config] = await Promise.all([
    getOrderEnrichedById(id),
    getBusinessConfig(),
  ]);

  if (!orderResult.data) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  const order = orderResult.data;

  if (order.paidAmount <= 0) {
    return NextResponse.json({ error: "Aucun paiement enregistré pour cette commande" }, { status: 400 });
  }

  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const logoUrl = fs.existsSync(logoPath) ? logoPath : undefined;

  const element = createElement(PaymentReceiptPDF, {
    order,
    logoUrl,
    company: {
      name:    String(config.company_name),
      tagline: String(config.company_tagline),
      address: String(config.company_address),
      phone:   String(config.company_phone),
      email:   String(config.company_email),
    },
    pdfFooterText: String(config.pdf_footer_text),
  }) as unknown as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>;

  const buffer = await renderToBuffer(element);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="recu-${order.reference}.pdf"`,
    },
  });
}
