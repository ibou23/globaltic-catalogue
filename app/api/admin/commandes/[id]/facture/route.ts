import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type JSXElementConstructor, type ReactElement } from "react";
import { NextResponse } from "next/server";
import { getOrderEnrichedById } from "@/lib/db/orders";
import { getQuoteById } from "@/lib/db/quotes";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canPerform } from "@/lib/auth/permissions";
import { getBusinessConfig } from "@/lib/db/business-config";
import { getInvoiceByOrderId, createInvoice } from "@/lib/db/invoices";
import { generateReference } from "@/lib/services/reference";
import { logOrderEvent } from "@/lib/db/activity-log";
import { FacturePDF } from "@/components/pdf/FacturePDF";
import path from "path";
import fs from "fs";
import type { InvoiceStatus } from "@/lib/types/domain";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin.data) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }
  if (!canPerform(admin.data.role, "facture:generate")) {
    return NextResponse.json({ error: "Vous n'avez pas les droits nécessaires" }, { status: 403 });
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

  // Charger le devis lié pour les lignes de détail
  let quote = null;
  if (order.quoteId) {
    const quoteResult = await getQuoteById(order.quoteId);
    quote = quoteResult.data ?? null;
  }

  // Récupérer ou créer la fiche facture en base
  const existingResult = await getInvoiceByOrderId(id);
  let invoice = existingResult.data;
  let isNew = false;

  if (!invoice) {
    const reference = await generateReference("FAC");
    const invoiceStatus: InvoiceStatus =
      order.paidAmount >= order.total ? "payee"
      : order.paidAmount > 0          ? "partiellement_payee"
      : "emise";

    const createResult = await createInvoice({
      reference,
      orderId:     order.id,
      customerId:  order.customerId,
      status:      invoiceStatus,
      total:       order.total,
      paidAmount:  order.paidAmount,
      generatedBy: admin.data.userId,
      notes:       null,
    });
    if (createResult.error) {
      return NextResponse.json({ error: "Impossible de créer la facture" }, { status: 500 });
    }
    invoice = createResult.data!;
    isNew = true;
  }

  // Journaliser seulement à la première génération
  if (isNew) {
    logOrderEvent(admin.data.userId, order.id, "facture_generee", {
      factureRef: invoice.reference,
      total: order.total,
      paidAmount: order.paidAmount,
    });
  }

  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const logoUrl = fs.existsSync(logoPath) ? logoPath : undefined;

  const element = createElement(FacturePDF, {
    order,
    quote,
    logoUrl,
    invoice,
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
  const uint8  = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    status: 200,
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="facture-${invoice.reference}.pdf"`,
    },
  });
}
