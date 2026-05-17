"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { createQuoteFromClientAction } from "@/lib/actions/quotes";
import type { Customer } from "@/lib/types/domain";

const inputClass =
  "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

interface DevisClientFormProps {
  customer: Customer;
  onClose: () => void;
}

export function DevisClientForm({ customer, onClose }: DevisClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [options, setOptions] = useState("");
  const [delai, setDelai] = useState("");
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("0");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const qty = parseInt(quantity, 10);
    const unit = parseInt(unitPrice, 10);

    if (!productName.trim()) return setError("Le produit est requis.");
    if (isNaN(qty) || qty < 1) return setError("La quantité doit être ≥ 1.");
    if (isNaN(unit) || unit < 0) return setError("Le prix unitaire est invalide.");

    startTransition(async () => {
      const result = await createQuoteFromClientAction({
        customer_id: customer.id,
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

      router.push("/admin/devis");
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
              Pour <span className="font-semibold text-slate-600">{customer.contactName}</span>
              {customer.companyName && <span className="text-slate-400"> · {customer.companyName}</span>}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Infos client (lecture seule) */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Client</p>
            <p className="font-bold text-slate-700">{customer.contactName}</p>
            {customer.companyName && <p className="text-slate-500">{customer.companyName}</p>}
            <p className="text-slate-500 font-mono text-xs">{customer.whatsapp}</p>
            {customer.email && <p className="text-slate-500 text-xs">{customer.email}</p>}
            {customer.city && <p className="text-slate-400 text-xs">{customer.city}</p>}
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
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Flyers A5 recto-verso"
                  required
                />
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
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Client régulier, accorder priorité…"
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
  );
}
