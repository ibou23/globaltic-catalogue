"use client";

import { useState, useTransition, useRef } from "react";
import { submitProspectFormAction } from "@/lib/actions/prospect-public";
import { CATALOG_PRODUCTS } from "@/lib/validators/prospect";
import { getProductMinQty, parseQuantityString } from "@/lib/utils/product-price-resolver";
import {
  User,
  Building2,
  Palette,
  Package,
  Send,
  CheckCircle2,
  MessageCircle,
  Upload,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { trackLead } from "@/lib/tracking/meta-pixel";
import type { ProductDetail } from "@/lib/types/domain";

type Step = "contact" | "entreprise" | "conception" | "commande";

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "contact",    label: "Contact",    icon: User },
  { key: "entreprise", label: "Entreprise", icon: Building2 },
  { key: "conception", label: "Conception", icon: Palette },
  { key: "commande",   label: "Commande",   icon: Package },
];

// Products that have textile-specific fields
const TEXTILE_PRODUCTS = ["Tee-shirts", "Polos", "Casquettes", "Tote bags"];
// Products that have banner/large-format-specific fields
const LARGE_FORMAT_PRODUCTS = ["Bâches", "Vinyles", "Stickers"];

function isTextile(product: string) {
  return TEXTILE_PRODUCTS.includes(product);
}
function isLargeFormat(product: string) {
  return LARGE_FORMAT_PRODUCTS.includes(product);
}

function emptyDetail(product: string): ProductDetail {
  return { product };
}

export function DemandeForm() {
  const [step, setStep] = useState<Step>("contact");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ name: string; company: string; product: string; quantity: string; deadline: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    full_name: "",
    whatsapp: "",
    phone_secondary: "",
    email: "",
    company_name: "",
    company_address: "",
    website: "",
    sector: "",
    products_services: "",
    preferred_colors: "",
    support_text: "",
    requested_products: [] as string[],
    other_product: "",
    quantity: "",
    format_dimensions: "",
    finish: "",
    desired_deadline: "",
    delivery_zone: "",
    message: "",
  });

  // Per-product detail map: product name → ProductDetail
  const [productDetails, setProductDetails] = useState<Map<string, ProductDetail>>(new Map());

  function updateField(field: string, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleProduct(product: string) {
    setForm((prev) => {
      const products = prev.requested_products.includes(product)
        ? prev.requested_products.filter((p) => p !== product)
        : [...prev.requested_products, product];

      if (!products.includes(product)) {
        // Remove detail when deselected
        setProductDetails((d) => {
          const next = new Map(d);
          next.delete(product);
          return next;
        });
        setExpandedProducts((s) => {
          const next = new Set(s);
          next.delete(product);
          return next;
        });
      } else {
        // Auto-expand on select
        setExpandedProducts((s) => new Set(s).add(product));
        setProductDetails((d) => {
          if (!d.has(product)) {
            return new Map(d).set(product, emptyDetail(product));
          }
          return d;
        });
      }

      return { ...prev, requested_products: products };
    });
  }

  function updateDetail(product: string, field: keyof ProductDetail, value: string | boolean) {
    setProductDetails((d) => {
      const next = new Map(d);
      const detail = next.get(product) ?? emptyDetail(product);
      next.set(product, { ...detail, [field]: value });
      return next;
    });
  }

  function toggleExpand(product: string) {
    setExpandedProducts((s) => {
      const next = new Set(s);
      if (next.has(product)) next.delete(product);
      else next.add(product);
      return next;
    });
  }

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function nextStep() {
    if (step === "contact" && (!form.full_name.trim() || !form.whatsapp.trim())) {
      setError("Le nom et le numéro WhatsApp sont requis.");
      return;
    }
    setError(null);
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.key);
  }

  function prevStep() {
    setError(null);
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev.key);
  }

  function handleSubmit() {
    if (!form.full_name.trim() || !form.whatsapp.trim()) {
      setError("Le nom et le numéro WhatsApp sont requis.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const detailsArray = Array.from(productDetails.values()).filter((d) => d.product);

      const payload = {
        ...form,
        phone_secondary: form.phone_secondary || null,
        email: form.email || null,
        company_name: form.company_name || null,
        company_address: form.company_address || null,
        website: form.website || null,
        sector: form.sector || null,
        products_services: form.products_services || null,
        preferred_colors: form.preferred_colors || null,
        support_text: form.support_text || null,
        other_product: form.other_product || null,
        quantity: form.quantity || null,
        format_dimensions: form.format_dimensions || null,
        finish: form.finish || null,
        desired_deadline: form.desired_deadline || null,
        delivery_zone: form.delivery_zone || null,
        message: form.message || null,
        product_details: detailsArray,
      };

      let filesFormData: FormData | undefined;
      if (selectedFiles.length > 0) {
        filesFormData = new FormData();
        selectedFiles.forEach((f) => filesFormData!.append("files", f));
      }

      const result = await submitProspectFormAction(payload, filesFormData);

      if (result.error) {
        setError(result.error);
      } else {
        trackLead({
          content_name: "Demande de devis",
          content_category: "formulaire",
          source: "demande_form",
        });
        setSuccess({
          name: form.full_name,
          company: form.company_name || "",
          product: form.requested_products.join(", ") || form.other_product || "Non précisé",
          quantity: form.quantity || "Non précisé",
          deadline: form.desired_deadline || "Non précisé",
        });
      }
    });
  }

  if (success) {
    const waText = encodeURIComponent(
      `Bonjour GLOBAL TIC, je viens de remplir le formulaire de commande.\n\n` +
      `Nom : ${success.name}\n` +
      `${success.company ? `Entreprise : ${success.company}\n` : ""}` +
      `Produit demandé : ${success.product}\n` +
      `Quantité : ${success.quantity}\n` +
      `Délai souhaité : ${success.deadline}\n\n` +
      `Merci de me confirmer la suite.`
    );

    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Demande envoyée !</h2>
          <p className="text-sm text-slate-500 mt-2">
            Votre demande a bien été enregistrée. Notre équipe va la traiter dans les plus brefs délais.
          </p>
        </div>
        <a
          href={`https://wa.me/${siteConfig.whatsapp}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Confirmer sur WhatsApp
        </a>
        <p className="text-xs text-slate-400">
          Ce message prérempli confirme votre demande auprès de notre équipe.
        </p>
      </div>
    );
  }

  const inputClass = "w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary";
  const labelClass = "block text-xs font-bold text-slate-600 mb-1.5";
  const detailInputClass = "w-full h-10 rounded-lg border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white";
  const detailLabelClass = "block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1";

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Stepper */}
      <div className="flex border-b border-slate-100">
        {STEPS.map((s, i) => {
          const active = s.key === step;
          const done = i < stepIndex;
          return (
            <button
              key={s.key}
              onClick={() => { setError(null); setStep(s.key); }}
              className={`flex-1 py-4 text-center text-xs font-bold transition-colors relative ${
                active ? "text-brand-primary bg-brand-primary/5" : done ? "text-green-600" : "text-slate-400"
              }`}
            >
              <s.icon className="w-4 h-4 mx-auto mb-1" />
              <span className="hidden sm:inline">{s.label}</span>
              {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
            </button>
          );
        })}
      </div>

      <div className="p-6 sm:p-8 space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Étape Contact */}
        {step === "contact" && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Nom complet *</label>
              <input type="text" value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} className={inputClass} placeholder="Ibrahima Diop" required />
            </div>
            <div>
              <label className={labelClass}>Numéro WhatsApp *</label>
              <input type="tel" value={form.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)} className={inputClass} placeholder="+221 77 123 45 67" required />
            </div>
            <div>
              <label className={labelClass}>Téléphone secondaire</label>
              <input type="tel" value={form.phone_secondary} onChange={(e) => updateField("phone_secondary", e.target.value)} className={inputClass} placeholder="Optionnel" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass} placeholder="email@exemple.com (optionnel)" />
            </div>
          </div>
        )}

        {/* Étape Entreprise */}
        {step === "entreprise" && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Nom de l'entreprise / activité</label>
              <input type="text" value={form.company_name} onChange={(e) => updateField("company_name", e.target.value)} className={inputClass} placeholder="GLOBAL TIC" />
            </div>
            <div>
              <label className={labelClass}>Adresse physique</label>
              <input type="text" value={form.company_address} onChange={(e) => updateField("company_address", e.target.value)} className={inputClass} placeholder="Dakar, Sénégal" />
            </div>
            <div>
              <label className={labelClass}>Site web</label>
              <input type="url" value={form.website} onChange={(e) => updateField("website", e.target.value)} className={inputClass} placeholder="https://www.exemple.com" />
            </div>
            <div>
              <label className={labelClass}>Secteur d'activité</label>
              <input type="text" value={form.sector} onChange={(e) => updateField("sector", e.target.value)} className={inputClass} placeholder="Communication, Restauration, etc." />
            </div>
          </div>
        )}

        {/* Étape Conception */}
        {step === "conception" && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Produits/services de votre entreprise</label>
              <textarea value={form.products_services} onChange={(e) => updateField("products_services", e.target.value)} className={`${inputClass} h-24 py-3 resize-none`} placeholder="Décrivez brièvement votre activité..." />
            </div>
            <div>
              <label className={labelClass}>Couleurs préférées</label>
              <input type="text" value={form.preferred_colors} onChange={(e) => updateField("preferred_colors", e.target.value)} className={inputClass} placeholder="Bleu, or, blanc..." />
            </div>
            <div>
              <label className={labelClass}>Texte à mettre sur le support</label>
              <textarea value={form.support_text} onChange={(e) => updateField("support_text", e.target.value)} className={`${inputClass} h-24 py-3 resize-none`} placeholder="Nom, slogan, coordonnées..." />
            </div>
            <div>
              <label className={labelClass}>Fichiers (logo, document, image) — max 5</label>
              <div className="space-y-2">
                {selectedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg text-sm">
                    <span className="flex-1 truncate text-slate-600">{f.name}</span>
                    <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {selectedFiles.length < 5 && (
                  <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-colors">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Ajouter un fichier</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.svg"
                      onChange={handleFileAdd}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Étape Commande */}
        {step === "commande" && (
          <div className="space-y-5">
            {/* Product checkboxes + per-product detail accordion */}
            <div>
              <label className={labelClass}>Produits demandés</label>
              <div className="space-y-2">
                {CATALOG_PRODUCTS.map((product) => {
                  const checked = form.requested_products.includes(product);
                  const expanded = expandedProducts.has(product);
                  const detail = productDetails.get(product) ?? emptyDetail(product);

                  return (
                    <div key={product} className={`rounded-xl border transition-colors ${checked ? "border-brand-primary/30 bg-brand-primary/5" : "border-slate-100"}`}>
                      {/* Product row */}
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProduct(product)}
                          className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary/20 shrink-0"
                        />
                        <span className="flex-1 text-sm font-semibold text-slate-700">{product}</span>
                        {checked && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(product)}
                            className="flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:text-brand-primary-dark transition-colors"
                          >
                            {expanded ? (
                              <><ChevronUp className="w-3.5 h-3.5" />Réduire</>
                            ) : (
                              <><ChevronDown className="w-3.5 h-3.5" />Détails</>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Per-product detail fields */}
                      {checked && expanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-brand-primary/10 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={detailLabelClass}>Quantité</label>
                              <input
                                type="text"
                                value={detail.quantity ?? ""}
                                onChange={(e) => updateDetail(product, "quantity", e.target.value)}
                                className={(() => {
                                  const minQty = getProductMinQty(product);
                                  const qty = parseQuantityString(detail.quantity);
                                  return `${detailInputClass} ${minQty !== null && qty > 0 && qty < minQty ? "border-amber-400 bg-amber-50" : ""}`;
                                })()}
                                placeholder="500 pièces"
                              />
                              {(() => {
                                const minQty = getProductMinQty(product);
                                if (!minQty) return null;
                                const qty = parseQuantityString(detail.quantity);
                                const isLow = qty > 0 && qty < minQty;
                                return (
                                  <p className={`text-[10px] mt-0.5 font-semibold ${isLow ? "text-amber-600" : "text-slate-400"}`}>
                                    {isLow
                                      ? `Min. ${minQty.toLocaleString("fr-SN")} exemplaires`
                                      : `Minimum : ${minQty.toLocaleString("fr-SN")} exemplaires`}
                                  </p>
                                );
                              })()}
                            </div>
                            {isLargeFormat(product) ? (
                              <div>
                                <label className={detailLabelClass}>Dimensions</label>
                                <input
                                  type="text"
                                  value={detail.dimensions ?? ""}
                                  onChange={(e) => updateDetail(product, "dimensions", e.target.value)}
                                  className={detailInputClass}
                                  placeholder="3m × 1m"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className={detailLabelClass}>Format</label>
                                <input
                                  type="text"
                                  value={detail.format ?? ""}
                                  onChange={(e) => updateDetail(product, "format", e.target.value)}
                                  className={detailInputClass}
                                  placeholder="A5, 9×5 cm..."
                                />
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={detailLabelClass}>Finition</label>
                              <input
                                type="text"
                                value={detail.finish ?? ""}
                                onChange={(e) => updateDetail(product, "finish", e.target.value)}
                                className={detailInputClass}
                                placeholder="Mat, brillant..."
                              />
                            </div>
                            <div>
                              <label className={detailLabelClass}>Couleurs</label>
                              <input
                                type="text"
                                value={detail.colors ?? ""}
                                onChange={(e) => updateDetail(product, "colors", e.target.value)}
                                className={detailInputClass}
                                placeholder="Bleu, or..."
                              />
                            </div>
                          </div>

                          {isTextile(product) && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className={detailLabelClass}>Tailles</label>
                                <input
                                  type="text"
                                  value={detail.sizes ?? ""}
                                  onChange={(e) => updateDetail(product, "sizes", e.target.value)}
                                  className={detailInputClass}
                                  placeholder="S×5, M×10, L×5"
                                />
                              </div>
                              <div>
                                <label className={detailLabelClass}>Position marquage</label>
                                <input
                                  type="text"
                                  value={detail.markingPosition ?? ""}
                                  onChange={(e) => updateDetail(product, "markingPosition", e.target.value)}
                                  className={detailInputClass}
                                  placeholder="Poitrine, dos..."
                                />
                              </div>
                            </div>
                          )}

                          <div>
                            <label className={detailLabelClass}>Texte / contenu</label>
                            <textarea
                              value={detail.text ?? ""}
                              onChange={(e) => updateDetail(product, "text", e.target.value)}
                              className={`${detailInputClass} h-16 py-2 resize-none`}
                              placeholder="Nom, slogan, coordonnées à imprimer..."
                            />
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={detail.fileProvided ?? false}
                              onChange={(e) => updateDetail(product, "fileProvided", e.target.checked)}
                              className="w-4 h-4 rounded border-slate-300 text-brand-primary"
                            />
                            <span className="text-xs font-semibold text-slate-600">Fichier / logo déjà fourni</span>
                          </label>

                          <div>
                            <label className={detailLabelClass}>Notes spécifiques</label>
                            <input
                              type="text"
                              value={detail.notes ?? ""}
                              onChange={(e) => updateDetail(product, "notes", e.target.value)}
                              className={detailInputClass}
                              placeholder="Toute précision utile pour ce produit..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>Autre produit (précisez)</label>
              <input type="text" value={form.other_product} onChange={(e) => updateField("other_product", e.target.value)} className={inputClass} placeholder="Si non listé ci-dessus" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Quantité globale</label>
                <input type="text" value={form.quantity} onChange={(e) => updateField("quantity", e.target.value)} className={inputClass} placeholder="500 pièces" />
              </div>
              <div>
                <label className={labelClass}>Délai souhaité</label>
                <input type="text" value={form.desired_deadline} onChange={(e) => updateField("desired_deadline", e.target.value)} className={inputClass} placeholder="3 jours, 1 semaine..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Format / Dimensions global</label>
                <input type="text" value={form.format_dimensions} onChange={(e) => updateField("format_dimensions", e.target.value)} className={inputClass} placeholder="9x5 cm, A4..." />
              </div>
              <div>
                <label className={labelClass}>Finition souhaitée</label>
                <input type="text" value={form.finish} onChange={(e) => updateField("finish", e.target.value)} className={inputClass} placeholder="Mat, brillant, pelliculé..." />
              </div>
            </div>
            <div>
              <label className={labelClass}>Zone de livraison</label>
              <input type="text" value={form.delivery_zone} onChange={(e) => updateField("delivery_zone", e.target.value)} className={inputClass} placeholder="Dakar Plateau, Thiès..." />
            </div>
            <div>
              <label className={labelClass}>Message complémentaire</label>
              <textarea value={form.message} onChange={(e) => updateField("message", e.target.value)} className={`${inputClass} h-24 py-3 resize-none`} placeholder="Toute précision utile..." />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {stepIndex > 0 ? (
            <button onClick={prevStep} className="h-10 px-5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">
              Retour
            </button>
          ) : (
            <div />
          )}

          {stepIndex < STEPS.length - 1 ? (
            <button onClick={nextStep} className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary-dark transition-colors">
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="h-10 px-6 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Envoyer ma demande
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
