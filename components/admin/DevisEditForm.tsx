"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateCustomerAction } from "@/lib/actions/customers";
import { updateQuoteAction } from "@/lib/actions/quotes";
import { resolveProductPrice, getProductMinQty } from "@/lib/utils/product-price-resolver";
import type { QuoteEnriched } from "@/lib/types/domain";

interface DevisEditFormProps {
  quote: QuoteEnriched;
  onClose: () => void;
}

const inputClass =
  "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

const STATUS_OPTIONS = [
  { value: "brouillon", label: "Brouillon" },
  { value: "envoye",    label: "Envoyé" },
  { value: "accepte",   label: "Accepté" },
  { value: "refuse",    label: "Refusé" },
  { value: "expire",    label: "Expiré" },
] as const;

export function DevisEditForm({ quote, onClose }: DevisEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const snap = quote.firstItem?.configSnapshot as Record<string, string> | undefined;

  // Champs client
  const [contactName, setContactName] = useState(quote.customer?.contactName ?? "");
  const [whatsapp, setWhatsapp]       = useState(quote.customer?.whatsapp ?? "");
  const [companyName, setCompanyName] = useState(quote.customer?.companyName ?? "");

  // Champs produit
  const [productName, setProductName] = useState(quote.firstItem?.productName ?? "");
  const [quantity, setQuantity]       = useState(String(quote.firstItem?.quantity ?? 1));
  const [unitPrice, setUnitPrice]     = useState(String(quote.firstItem?.unitPrice ?? ""));
  const [priceSource, setPriceSource] = useState<"auto" | "manual">("manual");
  const [options, setOptions]         = useState(snap?.options ?? "");
  const [delai, setDelai]             = useState(snap?.delai ?? "");

  // Champs devis
  const [status, setStatus]                 = useState(quote.status);
  const [notes, setNotes]                   = useState(quote.notes ?? "");
  const [internalNotes, setInternalNotes]   = useState(quote.internalNotes ?? "");
  const [isUrgent, setIsUrgent]             = useState(quote.isUrgent);
  const [discountPercent, setDiscountPercent] = useState(String(quote.discountPercent));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const qty  = parseInt(quantity, 10);
    const unit = parseInt(unitPrice, 10);

    if (!contactName.trim()) return setError("Le nom du client est requis.");
    if (!whatsapp.trim())    return setError("Le numéro WhatsApp est requis.");
    if (!productName.trim()) return setError("Le produit est requis.");
    if (isNaN(qty) || qty < 1)    return setError("La quantité doit être ≥ 1.");
    const minQty = getProductMinQty(productName);
    if (minQty !== null && qty < minQty) {
      return setError(`La quantité minimale pour "${productName}" est de ${minQty.toLocaleString("fr-SN")} exemplaires.`);
    }
    if (isNaN(unit) || unit < 0)  return setError("Le prix unitaire est invalide.");

    const totalPrice = qty * unit;
    const discount   = parseFloat(discountPercent) || 0;

    startTransition(async () => {
      // 1. Mettre à jour le client si on en a un
      if (quote.customerId) {
        const customerResult = await updateCustomerAction(quote.customerId, {
          contact_name:  contactName.trim(),
          whatsapp:      whatsapp.trim(),
          company_name:  companyName.trim() || null,
        });
        if (!customerResult.data) {
          setError(customerResult.error ?? "Erreur lors de la mise à jour du client.");
          return;
        }
      }

      // 2. Mettre à jour le devis et sa ligne produit
      const configSnapshot: Record<string, unknown> = {};
      if (options.trim()) configSnapshot.options = options.trim();
      if (delai.trim())   configSnapshot.delai   = delai.trim();

      const quoteResult = await updateQuoteAction(quote.id, {
        status,
        items: [
          {
            product_name:    productName.trim(),
            quantity:        qty,
            unit_price:      unit,
            total_price:     totalPrice,
            config_snapshot: configSnapshot,
          },
        ],
        is_urgent:      isUrgent,
        discount_percent: discount,
        notes:          notes.trim() || null,
        internal_notes: internalNotes.trim() || null,
      });

      if (!quoteResult.data) {
        setError(quoteResult.error ?? "Erreur lors de la mise à jour du devis.");
        return;
      }

      router.refresh();
      onClose();
    });
  }

  const qty   = parseInt(quantity, 10) || 0;
  const unit  = parseInt(unitPrice, 10) || 0;
  const totalEstime       = qty * unit;
  const minQtyDisplay = getProductMinQty(productName);
  const qtyInvalid    = qty > 0 && minQtyDisplay !== null && qty < minQtyDisplay;
  const discount          = parseFloat(discountPercent) || 0;
  const totalApresRemise  = Math.round(totalEstime * (1 - discount / 100));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-800">Modifier le devis</h2>
            <p className="text-xs text-slate-400 mt-0.5">{quote.reference}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Client */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Client</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom du contact *</label>
                <input className={inputClass} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Mamadou Diallo" required />
              </div>
              <div>
                <label className={labelClass}>Numéro WhatsApp *</label>
                <input className={inputClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="221771234567" required />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Entreprise (optionnel)</label>
                <input className={inputClass} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nom de l'entreprise" />
              </div>
            </div>
          </div>

          {/* Produit */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Produit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Nom du produit *</label>
                <input
                  className={inputClass}
                  value={productName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setProductName(name);
                    if (priceSource === "auto") {
                      const resolved = resolveProductPrice(name, parseInt(quantity, 10) || 1);
                      if (resolved) setUnitPrice(String(resolved.unitPrice));
                    }
                  }}
                  placeholder="Flyers A5 recto-verso"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Quantité *</label>
                <input
                  className={`${inputClass} ${qtyInvalid ? "border-red-400 bg-red-50" : ""}`}
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (priceSource === "auto") {
                      const resolved = resolveProductPrice(productName, parseInt(e.target.value, 10) || 1);
                      if (resolved) setUnitPrice(String(resolved.unitPrice));
                    }
                  }}
                  required
                />
                {minQtyDisplay !== null && (
                  <p className={`text-[11px] mt-1 font-semibold ${qtyInvalid ? "text-red-500" : "text-slate-400"}`}>
                    {qtyInvalid
                      ? `✕ Minimum : ${minQtyDisplay.toLocaleString("fr-SN")} exemplaires`
                      : `Min : ${minQtyDisplay.toLocaleString("fr-SN")} exemplaires`}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Prix unitaire (FCFA) *</label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => {
                    setUnitPrice(e.target.value);
                    setPriceSource("manual");
                  }}
                  placeholder="1500"
                  required
                />
                {priceSource === "auto" && (
                  <p className="text-[11px] mt-1 font-semibold text-emerald-600">✓ Prix recalculé depuis le catalogue</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Options / détails (format, papier, finitions…)</label>
                <input className={inputClass} value={options} onChange={(e) => setOptions(e.target.value)} placeholder="A5 / Couché mat 135g / Pelliculage mat" />
              </div>
              <div>
                <label className={labelClass}>Délai estimé</label>
                <input className={inputClass} value={delai} onChange={(e) => setDelai(e.target.value)} placeholder="~3 jours ouvrés" />
              </div>
              <div>
                <label className={labelClass}>Remise (%)</label>
                <input className={inputClass} type="number" min="0" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
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

          {/* Statut & options */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Statut</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Statut du devis</label>
                <select
                  className={inputClass}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="w-4 h-4 accent-red-500" />
                  <span className="text-sm font-semibold text-slate-700">Commande urgente</span>
                </label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Notes</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Notes client (visibles sur le devis)</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Livraison souhaitée avant vendredi…" />
              </div>
              <div>
                <label className={labelClass}>Notes internes (non visibles)</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Client régulier, accorder priorité…" />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isPending} className="flex-1 h-11 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-primary-dark transition-colors disabled:opacity-60">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
