"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, FileText, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createQuoteFromProspectAction,
  getProspectLinkedQuotesAction,
} from "@/lib/actions/quotes";
import type { Prospect, QuoteEnriched } from "@/lib/types/domain";

const inputClass =
  "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

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

  // Préremplissage depuis le prospect
  const defaultProduct = prospect.requestedProducts[0]
    ?? prospect.otherProduct
    ?? "";

  const [productName, setProductName] = useState(defaultProduct);
  const [quantity, setQuantity] = useState(prospect.quantity ?? "1");
  const [unitPrice, setUnitPrice] = useState("");
  const [options, setOptions] = useState(
    [
      prospect.formatDimensions,
      prospect.finish,
    ]
      .filter(Boolean)
      .join(" / ") ?? ""
  );
  const [delai, setDelai] = useState(prospect.desiredDeadline ?? "");
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState(
    prospect.internalNotes ?? ""
  );
  const [isUrgent, setIsUrgent] = useState(prospect.priority === "urgent");
  const [discountPercent, setDiscountPercent] = useState("0");

  // Vérifier les devis existants au montage
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const qty = parseInt(quantity, 10);
    const unit = parseInt(unitPrice, 10);

    if (!productName.trim()) return setError("Le produit est requis.");
    if (isNaN(qty) || qty < 1) return setError("La quantité doit être ≥ 1.");
    if (isNaN(unit) || unit < 0) return setError("Le prix unitaire est invalide.");

    startTransition(async () => {
      const result = await createQuoteFromProspectAction({
        prospect_id: prospect.id,
        product_name: productName.trim(),
        quantity: qty,
        unit_price: unit,
        options: options.trim() || undefined,
        delai: delai.trim() || undefined,
        notes: notes.trim() || undefined,
        internal_notes: internalNotes.trim() || undefined,
        is_urgent: isUrgent,
        discount_percent: parseFloat(discountPercent) || 0,
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

  const qty = parseInt(quantity, 10) || 0;
  const unit = parseInt(unitPrice, 10) || 0;
  const totalEstime = qty * unit;
  const discount = parseFloat(discountPercent) || 0;
  const totalApresRemise = Math.round(totalEstime * (1 - discount / 100));

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
            {prospect.companyName && (
              <p className="text-slate-500">{prospect.companyName}</p>
            )}
            <p className="text-slate-500 font-mono text-xs">{prospect.whatsapp}</p>
            {prospect.email && <p className="text-slate-500 text-xs">{prospect.email}</p>}
            {!prospect.convertedCustomerId && (
              <p className="text-xs text-amber-600 font-semibold mt-2">
                Un client sera créé automatiquement à partir de ce prospect.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Produit */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Produit</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nom du produit *</label>
                  <input
                    className={inputClass}
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Flyers A5 recto-verso"
                    required
                  />
                  {prospect.requestedProducts.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {prospect.requestedProducts.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setProductName(p)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                            productName === p
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
                  <label className={labelClass}>Quantité *</label>
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Prix unitaire (FCFA) *</label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="1500"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Options / format / finitions</label>
                  <input
                    className={inputClass}
                    value={options}
                    onChange={(e) => setOptions(e.target.value)}
                    placeholder="A5 / Couché mat 135g / Pelliculage mat"
                  />
                </div>
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
                  <label className={labelClass}>Remise (%)</label>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                  />
                </div>
              </div>

              {totalEstime > 0 && (
                <div className="mt-4 bg-slate-50 rounded-xl p-4 flex justify-between items-center">
                  <div className="text-sm text-slate-500">
                    {qty.toLocaleString("fr-SN")} × {unit.toLocaleString("fr-SN")} FCFA
                    {discount > 0 && <span className="text-green-600 ml-2">− {discount}%</span>}
                  </div>
                  <div className="text-lg font-black text-slate-800">
                    {totalApresRemise.toLocaleString("fr-SN")} FCFA
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Notes</h3>
              <div className="space-y-4">
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
                {isPending ? "Création…" : "Créer le devis"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
