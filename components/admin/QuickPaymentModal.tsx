"use client";

import { useState, useTransition } from "react";
import { X, Loader2 } from "lucide-react";
import type { OrderEnriched, PaymentMethod } from "@/lib/types/domain";
import { updateOrderAction } from "@/lib/actions/orders";

interface QuickPaymentModalProps {
  order: OrderEnriched;
  onClose: () => void;
}

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "wave",         label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "especes",      label: "Espèces" },
  { value: "virement",     label: "Virement" },
  { value: "cheque",       label: "Chèque" },
];

const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1";

export function QuickPaymentModal({ order, onClose }: QuickPaymentModalProps) {
  const balance = order.total - order.paidAmount;
  const [amount, setAmount] = useState(balance > 0 ? String(balance) : "0");
  const [method, setMethod] = useState<PaymentMethod>(order.paymentMethod ?? "especes");
  const [ref, setRef] = useState(order.paymentReference ?? "");
  const [note, setNote] = useState(order.paymentNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseInt(amount, 10);
    if (isNaN(parsed) || parsed < 0) { setError("Montant invalide"); return; }
    const newPaid = order.paidAmount + parsed;
    const paymentStatus =
      newPaid >= order.total ? "paye" :
      newPaid > 0 ? "acompte" : "non_paye";

    setError(null);
    startTransition(async () => {
      const result = await updateOrderAction(order.id, {
        status: order.status,
        payment_status: paymentStatus,
        paid_amount: newPaid,
        payment_method: method,
        payment_reference: ref || null,
        payment_note: note || null,
        delivery_method: order.deliveryMethod,
        delivery_address: order.deliveryAddress,
        estimated_delivery: order.estimatedDelivery,
        actual_delivery: order.actualDelivery,
        notes: order.notes,
        internal_notes: order.internalNotes,
      });
      if (result.error) { setError(result.error); return; }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="font-black text-slate-800 text-sm">Ajouter un paiement</p>
            <p className="text-xs text-slate-400 mt-0.5">{order.reference} · Solde : {balance.toLocaleString("fr-SN")} FCFA</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Montant encaissé (FCFA)</label>
            <input
              type="number"
              min="0"
              max={balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Mode de paiement</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className={inputClass}>
              {METHOD_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Référence (optionnel)</label>
            <input type="text" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="N° transaction, chèque…" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Note (optionnel)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
          </div>
          {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-11 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-brand-primary-dark transition-all disabled:opacity-60"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer le paiement"}
          </button>
        </form>
      </div>
    </div>
  );
}
