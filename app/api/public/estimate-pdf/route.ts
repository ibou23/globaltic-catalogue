import { NextResponse } from "next/server";
import { createElement, type JSXElementConstructor, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { mapProductWithOptions } from "@/lib/db/mappers";
import { calculatePrice } from "@/lib/calculator/engine";
import { PublicEstimatePDF, type EstimateData } from "@/components/pdf/PublicEstimatePDF";
import type { ProductWithOptions } from "@/lib/types/domain";
import path from "path";
import fs from "fs";

const PRODUCT_WITH_OPTIONS_SELECT = `
  *,
  categories(*),
  product_formats(*),
  product_papers(*),
  product_finishes(*),
  product_quantity_tiers(*)
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, quantity, formatId, paperId, finishIds } = body as {
      slug?: string;
      quantity?: number;
      formatId?: string | null;
      paperId?: string | null;
      finishIds?: string[];
    };

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Slug produit manquant" }, { status: 400 });
    }

    const qty = typeof quantity === "number" ? Math.floor(quantity) : 0;
    if (qty < 1) {
      return NextResponse.json({ error: "Quantite invalide" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_WITH_OPTIONS_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    const product: ProductWithOptions = mapProductWithOptions(data);

    const tierMinQty = product.quantityTiers[0]?.minQty || 1;
    const effectiveMin = Math.max(product.minOrderQuantity, tierMinQty);

    if (qty < effectiveMin) {
      return NextResponse.json(
        { error: `La quantite minimale pour ce produit est de ${effectiveMin} exemplaires.` },
        { status: 400 }
      );
    }

    const format = formatId ? product.formats.find((f) => f.id === formatId) || null : product.formats[0] || null;
    const paper = paperId ? product.papers.find((p) => p.id === paperId) || null : product.papers[0] || null;
    const selectedFinishes = (finishIds ?? [])
      .map((id) => product.finishes.find((f) => f.id === id))
      .filter(Boolean) as typeof product.finishes;

    const result = calculatePrice(product, { format, paper, quantity: qty, selectedFinishes });

    const options: string[] = [];
    if (format) options.push(format.name);
    if (paper) options.push(paper.name);
    for (const f of selectedFinishes) options.push(f.name);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const reference = `EST-${now.getFullYear()}-${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    const dateStr = now.toLocaleDateString("fr-SN", { day: "numeric", month: "long", year: "numeric" });

    const estimateData: EstimateData = {
      reference,
      date: dateStr,
      productName: product.name,
      quantity: qty,
      unitPrice: Math.round(result.unitPrice),
      totalPrice: result.totalPrice,
      turnaroundDays: result.estimatedTurnaroundDays,
      options,
    };

    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const logoUrl = fs.existsSync(logoPath) ? logoPath : undefined;

    const element = createElement(PublicEstimatePDF, { data: estimateData, logoUrl }) as unknown as ReactElement<DocumentProps, string | JSXElementConstructor<unknown>>;
    const buffer = await renderToBuffer(element);

    const filename = `devis-estimatif-${slug}-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (e) {
    console.error("[estimate-pdf]", e);
    return NextResponse.json({ error: "Erreur lors de la generation du PDF" }, { status: 500 });
  }
}
