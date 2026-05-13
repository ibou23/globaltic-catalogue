import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type JSXElementConstructor, type ReactElement } from "react";
import { NextResponse } from "next/server";
import { getQuoteById } from "@/lib/db/quotes";
import { getCustomerById } from "@/lib/db/customers";
import { getCurrentAdmin } from "@/lib/db/admin";
import { DevisPDF } from "@/components/pdf/DevisPDF";
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

  const { id } = await params;

  const quoteResult = await getQuoteById(id);
  if (!quoteResult.data) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  const quote = quoteResult.data;

  let customerName: string | undefined;
  let customerCompany: string | undefined;
  let customerWhatsapp: string | undefined;

  if (quote.customerId) {
    const customerResult = await getCustomerById(quote.customerId);
    if (customerResult.data) {
      const c = customerResult.data;
      customerName = c.contactName;
      customerCompany = c.companyName ?? undefined;
      customerWhatsapp = c.whatsapp;
    }
  }

  // Resolve logo as absolute path for @react-pdf/renderer (server-side file read)
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const logoUrl = fs.existsSync(logoPath) ? logoPath : undefined;

  const element = createElement(DevisPDF, {
    quote,
    customerName,
    customerCompany,
    customerWhatsapp,
    logoUrl,
  }) as unknown as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>;

  const buffer = await renderToBuffer(element);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="devis-${quote.reference}.pdf"`,
    },
  });
}
