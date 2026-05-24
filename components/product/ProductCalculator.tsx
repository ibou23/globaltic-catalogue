"use client";

import React from "react";
import type { ProductWithOptions } from "@/lib/types/domain";
import { useCalculator } from "@/hooks/use-calculator";
import { formatPrice } from "@/lib/utils";
import { generateWhatsAppLink } from "@/lib/whatsapp/generator";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import { trackViewContent, trackContact, trackCustomEvent } from "@/lib/tracking/meta-pixel";
import { PriceAnimation } from "@/components/calculator/PriceAnimation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Info, MessageCircle, Zap, Clock, FileDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCalculatorProps {
  product: ProductWithOptions;
}

export function ProductCalculator({ product }: ProductCalculatorProps) {
  const { state, result, actions } = useCalculator(product);
  const [pdfLoading, setPdfLoading] = React.useState(false);
  const [pdfError, setPdfError] = React.useState<string | null>(null);
  const productUrl = typeof window !== "undefined" ? window.location.href : `/produit/${product.slug}`;
  const whatsappLink = generateWhatsAppLink(product, state, result, productUrl);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch("/api/public/estimate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: product.slug,
          quantity: state.quantity,
          formatId: state.format?.id ?? null,
          paperId: state.paper?.id ?? null,
          finishIds: state.selectedFinishes.map((f) => f.id),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setPdfError(data?.error ?? "Erreur lors du telechargement");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ?? "devis-estimatif.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      trackCustomEvent("DownloadEstimate", {
        content_name: product.name,
        content_category: product.category?.name ?? "",
        currency: "XOF",
        value: result.totalPrice,
      });
    } catch {
      setPdfError("Erreur reseau");
    } finally {
      setPdfLoading(false);
    }
  };

  const isM2 = product.unitType === "m2";
  const unitLabel = isM2 ? "mètre carré (m²)" : "exemplaires";
  const unitLabelSingular = isM2 ? "mètre carré (m²)" : "unité";

  React.useEffect(() => {
    trackEvent(AnalyticsEvents.PRODUCT_VIEW, {
      product_name: product.name,
      category_id: product.categoryId,
    });
    trackViewContent({
      content_name: product.name,
      content_category: product.category?.name ?? "",
      content_ids: [product.slug],
      currency: "XOF",
      value: product.quantityTiers[0]?.baseUnitPrice,
    });
  }, [product.id, product.name, product.categoryId, product.slug, product.category?.name, product.quantityTiers]);

  // Progrès de configuration
  const steps = [
    { id: "format", active: !!state.format || product.formats.length === 0 },
    { id: "paper", active: !!state.paper || product.papers.length === 0 },
    {
      id: "finishes",
      active: state.selectedFinishes.length > 0 || product.finishes.length === 0,
    },
  ];
  const completedSteps = steps.filter((s) => s.active).length;
  const progressPercent = (completedSteps / steps.length) * 100;

  // Économies par rapport au premier palier
  const basePrice = product.quantityTiers[0]?.baseUnitPrice ?? 0;
  const currentTierPrice = result.unitPrice;
  const savingsPercent =
    basePrice > 0
      ? Math.round(((basePrice - currentTierPrice) / basePrice) * 100)
      : 0;

  // Bornes du slider
  const tierMinQty = product.quantityTiers[0]?.minQty || 1;
  const minQty = Math.max(product.minOrderQuantity, tierMinQty);
  const lastTier = product.quantityTiers[product.quantityTiers.length - 1];
  const maxSlider =
    lastTier?.maxQty && lastTier.maxQty <= 10000 ? lastTier.maxQty : 10000;
  const step = minQty < 50 ? 10 : 50;

  const isQtyInvalid = state.quantity > 0 && state.quantity < minQty;
  const isQtyEmpty   = state.quantity === 0;
  const qtyBlocked   = isQtyInvalid || isQtyEmpty;
  const unitLabelMin = isM2 ? "m²" : "exemplaires";

  return (
    <Card className="border-0 shadow-xl ring-1 ring-gray-100 lg:sticky lg:top-24">
      <CardContent className="p-0">
        {/* Barre de progression */}
        <div className="h-1.5 w-full bg-slate-100 overflow-hidden rounded-t-xl">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            className="h-full bg-brand-primary"
          />
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <h2 className="text-xl font-bold text-brand-secondary">
              Configurez votre produit
            </h2>
            {savingsPercent > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-100 text-green-700 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm"
              >
                <Zap className="h-3 w-3 fill-current" />
                ÉCONOMIE {savingsPercent}%
              </motion.div>
            )}
          </div>

          {/* 1. Format */}
          {product.formats.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-brand-secondary uppercase tracking-wider">
                1. Format d&apos;impression
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => actions.setFormat(format.id)}
                    className={`p-3 text-left rounded-xl border-2 transition-all ${
                      state.format?.id === format.id
                        ? "border-brand-primary bg-brand-primary/5"
                        : "border-gray-100 hover:border-brand-primary/30"
                    }`}
                  >
                    <div className="font-semibold text-brand-secondary text-sm">
                      {format.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Papier */}
          {product.papers.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-brand-secondary uppercase tracking-wider">
                2. Type de support
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.papers.map((paper) => (
                  <button
                    key={paper.id}
                    onClick={() => actions.setPaper(paper.id)}
                    className={`p-3 text-left rounded-xl border-2 transition-all flex items-center justify-between ${
                      state.paper?.id === paper.id
                        ? "border-brand-primary bg-brand-primary/5"
                        : "border-gray-100 hover:border-brand-primary/30"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-brand-secondary text-sm">
                        {paper.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {paper.paperType}
                      </div>
                    </div>
                    {state.paper?.id === paper.id && (
                      <CheckCircle2 className="h-5 w-5 text-brand-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Finitions */}
          {product.finishes.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-brand-secondary uppercase tracking-wider">
                3. Finitions & Sublimation
              </label>
              <div className="space-y-2">
                {product.finishes.map((finish) => {
                  const isSelected = state.selectedFinishes.some(
                    (f) => f.id === finish.id
                  );
                  const isIncompatible = finish.incompatibleWith.some((id) =>
                    state.selectedFinishes.some((f) => f.id === id)
                  );

                  return (
                    <button
                      key={finish.id}
                      onClick={() => actions.toggleFinish(finish.id)}
                      disabled={isIncompatible && !isSelected}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-brand-primary bg-brand-primary/5"
                          : isIncompatible
                            ? "border-gray-100 opacity-50 cursor-not-allowed bg-gray-50"
                            : "border-gray-100 hover:border-brand-primary/30"
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-brand-secondary flex items-center gap-2">
                          {finish.name}
                          {isIncompatible && (
                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Incompatible
                            </span>
                          )}
                        </div>
                        {finish.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {finish.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-brand-primary">
                          +{formatPrice(finish.unitPrice)} /u
                        </div>
                        {finish.fixedPrice > 0 && (
                          <div className="text-xs text-muted-foreground">
                            + {formatPrice(finish.fixedPrice)} calage
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantité */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-brand-secondary uppercase tracking-wider">
                {product.finishes.length > 0 ? "4" : "3"}. Quantité
              </label>
              <div className="flex items-center gap-2">
                {minQty > 1 && (
                  <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">
                    Minimum : {minQty.toLocaleString("fr-SN")} {unitLabelMin}
                  </span>
                )}
                <span className="text-xs font-medium text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                  Prix dégressif
                </span>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-medium bg-slate-50/80 px-3 py-1.5 rounded-lg border border-slate-100 w-fit"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              Glissez le curseur ou saisissez votre quantité manuellement
            </motion.div>

            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-grow py-4 flex items-center">
                  <input
                    type="range"
                    min={minQty}
                    max={maxSlider}
                    step={step}
                    value={Math.max(state.quantity, minQty)}
                    onChange={(e) => actions.setQuantity(Number(e.target.value))}
                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={state.quantity === 0 ? "" : state.quantity.toString()}
                  onChange={(e) => {
                    const val = e.target.value
                      .replace(/[^0-9]/g, "")
                      .replace(/^0+/, "");
                    actions.setQuantity(val === "" ? 0 : parseInt(val, 10));
                  }}
                  className={`w-full sm:w-32 text-center font-bold text-2xl border-2 rounded-2xl py-4 focus:ring-2 focus:outline-none transition-all shadow-inner ${
                    qtyBlocked
                      ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-300"
                      : "border-slate-200 focus:ring-brand-primary"
                  }`}
                />
              </div>

              {/* Message d'erreur quantité */}
              {qtyBlocked && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {isQtyEmpty
                    ? "Veuillez saisir une quantité."
                    : `La quantité minimale pour ${product.name.toLowerCase()} est de ${minQty.toLocaleString("fr-SN")} ${unitLabelMin}.`}
                </motion.div>
              )}

              <div className="mt-4 flex justify-between items-center">
                <div className={`text-4xl font-black font-heading ${qtyBlocked ? "text-red-400" : "text-brand-secondary"}`}>
                  {state.quantity > 0 ? state.quantity.toLocaleString("fr-SN") : "—"}{" "}
                  <span className="text-base font-medium text-slate-400 font-sans ml-2">
                    {unitLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Récapitulatif & CTA */}
        <div className="bg-[#132034] text-white p-5 sm:p-8 rounded-b-xl border-t border-white/10">
          <div className="mb-6 pb-6 border-b border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-1">
              Résumé de votre configuration
            </h3>
            <p className="text-base font-semibold text-sky-300 mb-4">
              {product.name}
            </p>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Quantité</span>
              <span className="font-medium text-white">
                {state.quantity.toLocaleString("fr-SN")} {unitLabel}
              </span>
            </div>

            {state.format && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Format</span>
                <span className="font-medium text-white">
                  {state.format.name}
                </span>
              </div>
            )}

            {state.paper && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Support</span>
                <span className="font-medium text-white">
                  {state.paper.name}
                </span>
              </div>
            )}

            {state.selectedFinishes.length > 0 && (
              <div className="flex justify-between items-start text-sm">
                <span className="text-slate-400">Options incluses</span>
                <div className="flex flex-col items-end gap-1">
                  {state.selectedFinishes.map((f) => (
                    <span key={f.id} className="font-medium text-white text-right">
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="w-full md:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs sm:text-sm text-brand-primary-light font-bold uppercase tracking-widest">
                  Budget Total
                </span>
                <span className="text-[10px] bg-brand-primary/20 text-brand-primary-light px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                  Estimatif
                </span>
              </div>
              {qtyBlocked ? (
                <div className="flex items-center gap-2 text-red-400 text-sm font-semibold py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Quantité invalide — aucun prix calculé
                </div>
              ) : (
                <>
                  <PriceAnimation
                    value={result.totalPrice}
                    className="text-3xl sm:text-4xl md:text-5xl font-black text-white"
                  />
                  <div className="flex text-[11px] sm:text-sm text-slate-400 mt-2 items-center gap-1 font-medium bg-white/5 px-3 py-1 rounded-full w-fit border border-white/5">
                    <Info className="h-3 w-3 sm:h-4 sm:w-4 text-brand-primary" />
                    Prix unitaire : {formatPrice(result.unitPrice)} /{" "}
                    {unitLabelSingular}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 mt-2 sm:mt-3 font-medium flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                      Production estimée : ~{result.estimatedTurnaroundDays} jours
                      ouvrés
                    </div>
                    <div className="flex items-center gap-2 text-brand-primary-light">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      Livraison Dakar disponible (48h)
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
              {qtyBlocked ? (
                <button
                  disabled
                  className="w-full h-14 sm:h-12 font-bold rounded-xl bg-slate-600 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <AlertCircle className="h-5 w-5" />
                  Quantité minimale requise
                </button>
              ) : (
                <Button
                  variant="whatsapp"
                  size="lg"
                  className="w-full h-14 sm:h-12 font-bold shadow-xl hover:scale-105 active:scale-95 transition-transform rounded-xl"
                  asChild
                >
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackEvent(AnalyticsEvents.WHATSAPP_CLICK, {
                        product_name: product.name,
                        total_price: result.totalPrice,
                        quantity: state.quantity,
                      });
                      trackContact({
                        content_name: product.name,
                        content_category: product.category?.name ?? "",
                        source: "whatsapp",
                      });
                    }}
                  >
                    <MessageCircle className="mr-2 h-6 w-6" />
                    Valider sur WhatsApp
                  </a>
                </Button>
              )}
              {!qtyBlocked && (
                <button
                  onClick={handleDownloadPdf}
                  disabled={pdfLoading}
                  className="w-full mt-3 h-10 rounded-xl border border-white/20 text-white/80 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {pdfLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileDown className="h-3.5 w-3.5" />
                  )}
                  Telecharger le devis PDF
                </button>
              )}
              {pdfError && (
                <p className="text-[10px] text-red-400 text-center mt-2 font-medium">{pdfError}</p>
              )}
              <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-wider max-w-[250px] leading-tight">
                Telechargez votre devis estimatif ou envoyez votre configuration sur WhatsApp pour validation finale.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
