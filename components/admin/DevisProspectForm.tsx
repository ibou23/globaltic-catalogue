"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, FileText, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createQuoteFromProspectAction,
  getProspectLinkedQuotesAction,
  type QuoteLineInput,
} from "@/lib/actions/quotes";
import type { Prospect, QuoteEnriched } from "@/lib/types/domain";

const inputClass =
  "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";
const lineInputClass =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/20 transition-all bg-white";
const lineLabelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1";

interface LineState {
  productName: string;
  quantity: string;
  unitPrice: string;
  options: string;
  discountPercent: string;
}

function emptyLine(productName = ""): LineState {
  return { productName, quantity: "1", unitPrice: "", options: "", discountPercent: "0" };
}

interface DevisProspectFormProps {
  prospect: Prospect;
  onClose: () => void;
}

export function DevisProspectForm({ prospect, onClose }: DevisProspectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [existingQuotes, setExistingQuotes] = useState<QuoteEnriched[] | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [showExistingWarning, setShowExistingWarning] = useState(false);

  // Build initial lines from productDetails or fallback to legacy fields
  function buildInitialLines(): LineState[] {
    if (prospect.productDetails && prospect.productDetails.length > 0) {
      return prospect.productDetails.map((d) => {
        const options = [d.format, d.dimensions, d.finish, d.colors, d.sizes, d.markingPosition]
          .filter(Boolean)
          .join(" / ");
        return {
          productName: d.product,
          quantity: d.quantity ?? "1",
          unitPrice: "",
          options,
          discountPercent: "0",
        };
      });
    }
    // Legacy fallback
    const defaultProduct = prospect.requestedProducts[0] ?? prospect.otherProduct ?? "";
    const options = [prospect.formatDimensions, prospect.finish].filter(Boolean).join(" / ");
    return [{ productName: defaultProduct, quantity: prospect.quantity ?? "1", unitPrice: "", options, discountPercent: "0" }];
  }

  const [lines, setLines] = useState<LineState[]>(buildInitialLines);
  const [delai, setDelai] = useState(prospect.desiredDeadline ?? "");
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState(prospect.internalNotes ?? "");
  const [isUrgent, setIsUrgent] = useState(prospect.priority === "urgent");

  // Check existing quotes on mount
  useState(() => {
    if (!prospect.convertedCustomerId) return;
    setCheckingExisting(true);
    getProspectLinkedQuotesAction(prospect.id).then((result) => {
      setCheckingExisting(false);
      if (result.data && result.data.length > 0) {
        setExistingQuotes(result.data);
        setShowExistingWarning(true);
      }
    });
  });

  function updateLine(index: number, field: keyof LineState, value: string) {
    setLines((prev) => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) return setError("Ajoutez au moins une ligne produit.");

    const firstLine = lines[0];
    const qty = parseInt(firstLine.quantity, 10);
    const unit = parseInt(firstLine.unitPrice, 10);

    if (!firstLine.productName.trim()) return setError("Le produit de la ligne 1 est requis.");
    if (isNaN(qty) || qty < 1) return setError("La quantité de la ligne 1 doit être ≥ 1.");
    if (isNaN(unit) || unit < 0) return setError("Le prix unitaire de la ligne 1 est invalide.");

    // Validate extra lines
    for (let i = 1; i < lines.length; i++) {
      const l = lines[i];
      if (!l.productName.trim()) return setError(`Le produit de la ligne ${i + 1} est requis.`);
      const lQty = parseInt(l.quantity, 10);
      const lUnit = parseInt(l.unitPrice, 10);
      if (isNaN(lQty) || lQty < 1) return setError(`La quantité de la ligne ${i + 1} doit être ≥ 1.`);
      if (isNaN(lUnit) || lUnit < 0) return setError(`Le prix de la ligne ${i + 1} est invalide.`);
    }

    startTransition(async () => {
      const extraLines: QuoteLineInput[] = lines.slice(1).map((l) => ({
        product_name: l.productName.trim(),
        quantity: parseInt(l.quantity, 10),
        unit_price: parseInt(l.unitPrice, 10),
        options: l.options.trim() || undefined,
        discount_percent: parseFloat(l.discountPercent) || 0,
      }));

      const result = await createQuoteFromProspectAction({
        prospect_id: prospect.id,
        product_name: firstLine.productName.trim(),
        quantity: qty,
        unit_price: unit,
        options: firstLine.options.trim() || undefined,
        delai: delai.trim() || undefined,
        notes: notes.trim() || undefined,
        internal_notes: internalNotes.trim() || undefined,
        is_urgent: isUrgent,
        discount_percent: parseFloat(firstLine.discountPercent) || 0,
        extra_lines: extraLines.length > 0 ? extraLines : undefined,
      });

      if (!result.data) {
        setError(result.error ?? "Erreur lors de la création du devis.");
        return;
      }

      router.push(`/admin/devis`);
      router.refresh();
      onClose();
    });
  }

  // Compute totals per line
  function lineTotal(l: LineState) {
    const qty = parseInt(l.quantity, 10) || 0;
    const unit = parseInt(l.unitPrice, 10) || 0;
    const disc = parseFloat(l.discountPercent) || 0;
    return Math.round(qty * unit * (1 - disc / 100));
  }

  const grandTotal = lines.reduce((sum, l) => sum + lineTotal(l), 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-800">Créer un devis</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Depuis le prospect <span className="font-semibold text-slate-600">{prospect.fullName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Avertissement devis existants */}
          {showExistingWarning && existingQuotes && existingQuotes.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-700 mb-1">
                  Ce prospect a déjà {existingQuotes.length} devis lié(s)
                </p>
                <div className="space-y-1">
                  {existingQuotes.slice(0, 3).map((q) => (
                    <a
                      key={q.id}
                      href={`/admin/devis`}
                      className="flex items-center gap-2 text-xs text-amber-600 hover:text-amber-800 hover:underline"
                    >
                      <FileText className="w-3 h-3 shrink-0" />
                      {q.reference} — {q.firstItem?.productName ?? "—"} — {q.status}
                    </a>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <a
                    href="/admin/devis"
                    className="h-8 px-3 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold hover:bg-amber-200 transition-colors"
                  >
                    Voir devis existants
                  </a>
                  <button
                    onClick={() => setShowExistingWarning(false)}
                    className="h-8 px-3 rounded-lg bg-white border border-amber-200 text-amber-700 text-xs font-bold hover:bg-amber-50 transition-colors"
                  >
                    Créer quand même
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Infos client préremplies */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client identifié</p>
            <p className="font-bold text-slate-700">{prospect.fullName}</p>
            {prospect.companyName && <p className="text-slate-500">{prospect.companyName}</p>}
            <p className="text-slate-500 font-mono text-xs">{prospect.whatsapp}</p>
            {prospect.email && <p className="text-slate-500 text-xs">{prospect.email}</p>}
            {!prospect.convertedCustomerId && (
              <p className="text-xs text-amber-600 font-semibold mt-2">
                Un client sera créé automatiquement à partir de ce prospect.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lignes produits */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Lignes produits ({lines.length})
                </h3>
                <button
                  type="button"
                  onClick={addLine}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-dark transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                </button>
              </div>

              <div className="space-y-4">
                {lines.map((line, idx) => {
                  const total = lineTotal(line);
                  const qty = parseInt(line.quantity, 10) || 0;
                  const unit = parseInt(line.unitPrice, 10) || 0;
                  const disc = parseFloat(line.discountPercent) || 0;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                          Ligne {idx + 1}
                        </span>
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className={lineLabelClass}>Produit *</label>
                          <input
                            className={lineInputClass}
                            value={line.productName}
                            onChange={(e) => updateLine(idx, "productName", e.target.value)}
                            placeholder="Flyers A5 recto-verso"
                            required
                          />
                          {idx === 0 && prospect.requestedProducts.length > 1 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {prospect.requestedProducts.map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => updateLine(idx, "productName", p)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                                    line.productName === p
                                      ? "bg-brand-primary text-white border-brand-primary"
                                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-primary/40"
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className={lineLabelClass}>Quantité *</label>
                          <input
                            className={lineInputClass}
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className={lineLabelClass}>Prix unitaire (FCFA) *</label>
                          <input
                            className={lineInputClass}
                            type="number"
                            min="0"
                            value={line.unitPrice}
                            onChange={(e) => updateLine(idx, "unitPrice", e.target.value)}
                            placeholder="1500"
                            required
                          />
                        </div>
                        <div>
                          <label className={lineLabelClass}>Options / format / finitions</label>
                          <input
                            className={lineInputClass}
                            value={line.options}
                            onChange={(e) => updateLine(idx, "options", e.target.value)}
                            placeholder="A5 / Couché mat 135g"
                          />
                        </div>
                        <div>
                          <label className={lineLabelClass}>Remise (%)</label>
                          <input
                            className={lineInputClass}
                            type="number"
                            min="0"
                            max="100"
                            value={line.discountPercent}
                            onChange={(e) => updateLine(idx, "discountPercent", e.target.value)}
                          />
                        </div>
                      </div>
                      {total > 0 && (
                        <div className="flex justify-between items-center text-xs bg-white rounded-lg px-3 py-2 border border-slate-100">
                          <span className="text-slate-400">
                            {qty.toLocaleString("fr-SN")} × {unit.toLocaleString("fr-SN")} FCFA
                            {disc > 0 && <span className="text-green-600 ml-1.5">− {disc}%</span>}
                          </span>
                          <span className="font-black text-slate-700">
                            {total.toLocaleString("fr-SN")} FCFA
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Grand total */}
              {grandTotal > 0 && lines.length > 1 && (
                <div className="mt-3 bg-brand-primary/5 border border-brand-primary/20 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600">Total estimé ({lines.length} lignes)</span>
                  <span className="text-lg font-black text-brand-primary">{grandTotal.toLocaleString("fr-SN")} FCFA</span>
                </div>
              )}
            </div>

            {/* Délai & Notes */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Délai & Notes</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Délai estimé</label>
                  <input
                    className={inputClass}
                    value={delai}
                    onChange={(e) => setDelai(e.target.value)}
                    placeholder="~3 jours ouvrés"
                  />
                </div>
                <div>
                  <label className={labelClass}>Notes client (visibles sur le devis)</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Livraison souhaitée avant vendredi…"
                  />
                </div>
                <div>
                  <label className={labelClass}>Notes internes (non visibles)</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={3}
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Informations du prospect, budget estimé…"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 accent-red-500"
                  />
                  <span className="text-sm font-semibold text-slate-700">Commande urgente</span>
                </label>
              </div>
            </div>

            {error && (
              <p className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 h-11 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-primary-dark transition-colors disabled:opacity-60"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isPending ? "Création…" : `Créer le devis${lines.length > 1 ? ` (${lines.length} lignes)` : ""}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
