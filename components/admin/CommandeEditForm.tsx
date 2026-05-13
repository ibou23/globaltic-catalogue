"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateOrderAction } from "@/lib/actions/orders";
import type { OrderEnriched } from "@/lib/types/domain";

interface CommandeEditFormProps {
  order: OrderEnriched;
  onClose: () => void;
}

const inputClass =
  "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const labelClass =
  "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

const STATUS_OPTIONS = [
  { value: "en_attente",       label: "En attente" },
  { value: "confirmee",        label: "Confirmée" },
  { value: "bat_en_cours",     label: "BAT en cours" },
  { value: "bat_valide",       label: "BAT validé" },
  { value: "en_production",    label: "En production" },
  { value: "controle_qualite", label: "Contrôle qualité" },
  { value: "pret",             label: "Prête" },
  { value: "en_livraison",     label: "En livraison" },
  { value: "livre",            label: "Livrée" },
  { value: "annulee",          label: "Annulée" },
] as const;

const PAYMENT_OPTIONS = [
  { value: "non_paye",  label: "Non payé" },
  { value: "acompte",   label: "Acompte reçu" },
  { value: "paye",      label: "Payé intégralement" },
  { value: "rembourse", label: "Remboursé" },
] as const;

const DELIVERY_OPTIONS = [
  { value: "retrait",            label: "Retrait en boutique" },
  { value: "livraison_dakar",    label: "Livraison Dakar" },
  { value: "livraison_region",   label: "Livraison région" },
] as const;

type OrderStatus = typeof STATUS_OPTIONS[number]["value"];

// Messages WhatsApp préremplis selon le statut
function buildWhatsAppMessage(order: OrderEnriched, status: OrderStatus): string | null {
  const client = order.customer?.contactName ?? "client";
  const ref = order.reference;
  const whatsapp = order.customer?.whatsapp?.replace(/[^0-9]/g, "");
  if (!whatsapp) return null;

  const msgMap: Partial<Record<OrderStatus, string[]>> = {
    confirmee: [
      `Bonjour *${client}*,`,
      ``,
      `Votre acompte pour la commande *${ref}* a bien été reçu.`,
      ``,
      `Votre commande est maintenant confirmée ✅`,
      ``,
      `Nous restons disponibles sur WhatsApp pour toute précision et nous vous tiendrons au courant pour la livraison.`,
      ``,
      `Merci pour votre confiance. — *GLOBAL TIC*`,
    ],
    bat_en_cours: [
      `Bonjour *${client}*,`,
      ``,
      `Votre commande *${ref}* est en cours de préparation du BAT.`,
      `Vous recevrez prochainement un fichier de validation à approuver avant l'impression.`,
      ``,
      `*GLOBAL TIC*`,
    ],
    en_production: [
      `Bonjour *${client}*,`,
      ``,
      `Bonne nouvelle ! Votre commande *${ref}* est maintenant en production.`,
      `Nous vous informerons dès qu'elle sera prête.`,
      ``,
      `*GLOBAL TIC*`,
    ],
    pret: [
      `Bonjour *${client}*,`,
      ``,
      `Votre commande *${ref}* est prête à être livrée ✅`,
      ``,
      `Notre livreur vous contactera pour organiser la livraison.`,
      ``,
      `*GLOBAL TIC*`,
    ],
    en_livraison: [
      `Bonjour *${client}*,`,
      ``,
      `Votre commande *${ref}* est en cours de livraison.`,
      `Notre livreur vous contactera pour convenir de l'heure de remise.`,
      ``,
      `*GLOBAL TIC*`,
    ],
    livre: [
      `Bonjour *${client}*,`,
      ``,
      `Votre commande *${ref}* a bien été livrée.`,
      `Nous espérons que tout est à votre satisfaction. N'hésitez pas à nous contacter pour tout retour.`,
      ``,
      `Merci de votre confiance — *GLOBAL TIC*`,
    ],
  };

  const lines = msgMap[status];
  if (!lines) return null;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function CommandeEditForm({ order, onClose }: CommandeEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<OrderStatus>(order.status as OrderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [paidAmount, setPaidAmount] = useState(String(order.paidAmount));
  const [deliveryMethod, setDeliveryMethod] = useState(order.deliveryMethod);
  const [deliveryAddress, setDeliveryAddress] = useState(order.deliveryAddress ?? "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(order.estimatedDelivery ?? "");
  const [actualDelivery, setActualDelivery] = useState(order.actualDelivery ?? "");
  const [notes, setNotes] = useState(order.notes ?? "");
  const [internalNotes, setInternalNotes] = useState(order.internalNotes ?? "");

  const waLink = buildWhatsAppMessage(order, status);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const paid = parseInt(paidAmount, 10);
    if (isNaN(paid) || paid < 0) return setError("Le montant payé est invalide.");

    startTransition(async () => {
      const result = await updateOrderAction(order.id, {
        status,
        payment_status: paymentStatus,
        paid_amount: paid,
        delivery_method: deliveryMethod,
        delivery_address: deliveryAddress.trim() || null,
        estimated_delivery: estimatedDelivery || null,
        actual_delivery: actualDelivery || null,
        notes: notes.trim() || null,
        internal_notes: internalNotes.trim() || null,
      });

      if (!result.data) {
        setError(result.error ?? "Erreur lors de la mise à jour.");
        return;
      }

      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-800">Modifier la commande</h2>
            <p className="text-xs text-slate-400 mt-0.5">{order.reference}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Statut & paiement */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Statut</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Statut commande</label>
                <select
                  className={inputClass}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Statut paiement</label>
                <select
                  className={inputClass}
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as typeof paymentStatus)}
                >
                  {PAYMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Montant payé (FCFA)</label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <div className="w-full bg-slate-50 rounded-xl px-4 py-2.5 text-sm">
                  <p className="text-xs text-slate-400 mb-0.5">Total commande</p>
                  <p className="font-black text-slate-800">
                    {order.total.toLocaleString("fr-SN")} FCFA
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton WhatsApp contextuel */}
            {waLink && order.customer && (
              <div className="mt-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <p className="text-xs text-green-700 font-medium">
                  Message WhatsApp disponible pour ce statut
                </p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
                >
                  Envoyer
                </a>
              </div>
            )}
          </div>

          {/* Livraison */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Livraison</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Mode de livraison</label>
                <select
                  className={inputClass}
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as typeof deliveryMethod)}
                >
                  {DELIVERY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Date estimée de livraison</label>
                <input
                  className={inputClass}
                  type="date"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Adresse de livraison</label>
                <input
                  className={inputClass}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Rue, quartier, ville…"
                />
              </div>
              <div>
                <label className={labelClass}>Date réelle de livraison</label>
                <input
                  className={inputClass}
                  type="date"
                  value={actualDelivery}
                  onChange={(e) => setActualDelivery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Notes</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Notes client (visibles)</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instructions de livraison, demandes spéciales…"
                />
              </div>
              <div>
                <label className={labelClass}>Notes internes (non visibles)</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Remarques équipe production…"
                />
              </div>
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
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
