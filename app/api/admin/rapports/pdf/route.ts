import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type JSXElementConstructor, type ReactElement } from "react";
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { getBusinessConfig } from "@/lib/db/business-config";
import { getReportData } from "@/lib/db/reports";
import { RapportPDF } from "@/components/pdf/RapportPDF";
import path from "path";
import fs from "fs";

export async function GET(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin.data) {
    return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
  }
  if (!canAccessModule(admin.data.role, "rapports")) {
    return NextResponse.json({ error: "Vous n'avez pas les droits nécessaires" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to   = searchParams.get("to");

  if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: "Paramètres from/to invalides (YYYY-MM-DD)" }, { status: 400 });
  }

  const showFinance = admin.data.role === "patron" || admin.data.role === "admin";

  const [reportResult, config] = await Promise.all([
    getReportData({ from, to }),
    getBusinessConfig(),
  ]);

  if (reportResult.error || !reportResult.data) {
    return NextResponse.json({ error: reportResult.error ?? "Erreur interne" }, { status: 500 });
  }

  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const logoUrl  = fs.existsSync(logoPath) ? logoPath : undefined;

  const element = createElement(RapportPDF, {
    report: reportResult.data!,
    company: {
      name:    String(config.company_name),
      tagline: String(config.company_tagline),
      address: String(config.company_address),
      phone:   String(config.company_phone),
      email:   String(config.company_email),
    },
    logoUrl,
    showFinance,
  }) as unknown as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>;

  const buffer = await renderToBuffer(element);
  const uint8  = new Uint8Array(buffer);

  const filename = `rapport-${from}-${to}.pdf`;

  return new NextResponse(uint8, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
