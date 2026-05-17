"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X, Truck, Loader2, Save, MessageCircle, FileDown,
  CheckCircle2, AlertCircle, Clock, MapPin,
} from "lucide-react";
import type { OrderEnriched, DeliveryStatus, AdminRole } from "@/lib/types/domain";
import { updateDeliveryAction } from "@/lib/actions/delivery";
import { canPerform } from "@/lib/auth/permissions";
import { formatDateShort } from "@/lib/utils/format";
import { siteConfig } from "@/lib/config/site";

// ─── Config ───────────────────────────────────────────────────────────────────

const DELIVERY_METHOD_OPTIONS = [
  { value: "livraison_dakar",    label: "Livraison Dakar" },
  { value: "livraison_region",   label: "Livraison région" },
  { value: "livraison_coursier", label: "Livraison par coursier" },
  { value: "autre",              label: "Autre" },
] as const;

export const DELIVERY_STATUS_CONFIG: Record<DeliveryStatus, {
  label: string;
  color: string;
  icon: React.ElementType;
}> = {
  non_planifiee: { label: "Non planifiée",  color: "bg-slate-100 text-slate-500",    icon: Clock },
  planifiee:     { label: "Planifiée",      color: "bg-blue-100 text-blue-700",      icon: Clock },
  en_cours:      { label: "En cours",       color: "bg-amber-100 text-amber-700",    icon: Truck },
  livree:        { label: "Livrée",         color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  echec:         { label: "Échec",          color: "bg-red-100 text-red-600",        icon: AlertCircle },
  reportee:      { label: "Reportée",       color: "bg-violet-100 text-violet-700",  icon: Clock },
};

// ─── Messages WhatsApp ────────────────────────────────────────────────────────

const DELIVERY_METHOD_LABELS_WA: Record<string, string> = {
  livraison_dakar:    "Livraison Dakar",
  livraison_region:   "Livraison région",
  livraison_coursier: "Livraison par coursier",
  autre:              "Livraison",
};

function buildWaDelivery(
  order: OrderEnriched,
  type: "planifiee" | "en_cours" | "livree" | "echec" | "reportee",
  opts?: { estimatedDelivery?: string; deliveryMethod?: string; deliveryFee?: number }
): string | null {
  const phone = order.customer?.whatsapp?.replace(/\D/g, "");
  if (!phone) return null;
  const client = order.customer?.contactName ?? "client";
  const ref    = order.reference;
  const dateStr = opts?.estimatedDelivery ? formatDateShort(opts.estimatedDelivery) : "date à confirmer";
  const fee  = opts?.deliveryFee ?? 0;
  const fmtFee = fee > 0 ? fee.toLocaleString("fr-SN") + " FCFA" : null;
  const methodLabel = DELIVERY_METHOD_LABELS_WA[opts?.deliveryMethod ?? ""] ?? null;

  // Lignes mode + frais (insérées si pertinentes)
  const deliveryInfoLines: string[] = [];
  if (methodLabel) deliveryInfoLines.push(`Mode : *${methodLabel}*`);
  if (fmtFee)      deliveryInfoLines.push(`Frais de livraison : *${fmtFee}*`);
  const hasInfo = deliveryInfoLines.length > 0;

  const msgs: Record<string, string[]> = {
    planifiee: [
      `Bonjour *${client}*,`,
      ``,
      `Votre commande *${ref}* est programmée pour livraison.`,
      ``,
      ...(hasInfo ? [...deliveryInfoLines, ``] : []),
      `Notre livreur vous contactera pour confirmer les détails.`,
      ``,
      `*GLOBAL TIC*`,
    ],
    en_cours: [
      `Bonjour *${client}*,`,
      ``,
      `Votre commande *${ref}* est actuellement en cours de livraison.`,
      ``,
      ...(hasInfo ? [...deliveryInfoLines, ``] : []),
      `Notre livreur vous contactera pour la remise.`,
      ``,
      `*GLOBAL TIC*`,
    ],
    livree: [
      `Bonjour *${client}*,`,
      ``,
      `Votre commande *${ref}* a bien été livrée ✅`,
      ``,
      ...(hasInfo ? [...deliveryInfoLines, ``] : []),
      `Merci pour votre confiance.`,
      ``,
      `*GLOBAL TIC*`,
    ],
    echec: [
      `Bonjour *${client}*,`,
      ``,
      `Notre livreur n'a pas pu finaliser la livraison de votre commande *${ref}*.`,
      ``,
      `Merci de nous confirmer votre disponibilité afin de reprogrammer la livraison.`,
      ``,
      `*GLOBAL TIC*`,
    ],
    reportee: [
      `Bonjour *${client}*,`,
      ``,
      `La livraison de votre commande *${ref}* a été reportée.`,
      ``,
      `Nous vous confirmerons prochainement la nouvelle date de livraison.`,
      ``,
      `*GLOBAL TIC*`,
    ],
  };

  const lines = msgs[type];
  if (!lines) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function buildWaDefault(order: OrderEnriched): string {
  const phone = (order.customer?.whatsapp ?? siteConfig.whatsapp).replace(/\D/g, "");
  const client = order.customer?.contactName ?? "client";
  return `https://wa.me/${phone}?text=${encodeURIComponent(`Bonjour *${client}*, concernant votre commande *${order.reference}* — *GLOBAL TIC*`)}`;
}

const inputClass =
  "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const labelClass =
  "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

// ─── Props ────────────────────────────────────────────────────────────────────

interface DeliveryModalProps {
  order: OrderEnriched;
  role:  AdminRole;
  onClose: () => void;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function DeliveryModal({ order, role, onClose }: DeliveryModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canEdit = canPerform(role, "commande:edit_status");

  const [deliveryMethod, setDeliveryMethod]     = useState<"livraison_dakar" | "livraison_region" | "livraison_coursier" | "autre">(() => {
    if (["livraison_dakar","livraison_region","livraison_coursier","autre"].includes(order.deliveryMethod)) {
      return order.deliveryMethod as "livraison_dakar" | "livraison_region" | "livraison_coursier" | "autre";
    }
    // retrait avec livreur/frais → coursier ; sinon défaut dakar
    if (order.deliveryMethod === "retrait" && (order.deliveryDriver || order.deliveryFee > 0)) {
      return "livraison_coursier";
    }
    return "livraison_dakar";
  });
  const [deliveryStatus, setDeliveryStatus]     = useState<DeliveryStatus>(order.deliveryStatus ?? "non_planifiee");
  const [deliveryAddress, setDeliveryAddress]   = useState(order.deliveryAddress ?? "");
  const [recipientName, setRecipientName]       = useState(order.deliveryRecipientName ?? order.customer?.contactName ?? "");
  const [recipientPhone, setRecipientPhone]     = useState(order.deliveryRecipientPhone ?? order.customer?.whatsapp ?? "");
  const [driver, setDriver]                     = useState(order.deliveryDriver ?? "");
  const [fee, setFee]                           = useState(String(order.deliveryFee ?? 0));
  const [estimatedDelivery, setEstimatedDelivery] = useState(order.estimatedDelivery ?? "");
  const [actualDelivery, setActualDelivery]     = useState(order.actualDelivery ?? "");
  const [deliveryNotes, setDeliveryNotes]       = useState(order.deliveryNotes ?? "");
  const [error, setError]   = useState<string | null>(null);
  const [saved, setSaved]   = useState(false);

  const currentCfg = DELIVERY_STATUS_CONFIG[deliveryStatus];
  const StatusIcon = currentCfg.icon;

  // Messages WhatsApp contextuels selon le statut livraison
  const waTypeMap: Record<DeliveryStatus, "planifiee" | "en_cours" | "livree" | "echec" | "reportee" | null> = {
    non_planifiee: null,
    planifiee:     "planifiee",
    en_cours:      "en_cours",
    livree:        "livree",
    echec:         "echec",
    reportee:      "reportee",
  };
  const waType = waTypeMap[deliveryStatus];
  const waLink = waType
    ? buildWaDelivery(order, waType, {
        estimatedDelivery,
        deliveryMethod,
        deliveryFee: parseInt(fee, 10) || 0,
      })
    : buildWaDefault(order);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateDeliveryAction(order.id, order.reference, {
        delivery_method:          deliveryMethod,
        delivery_status:          deliveryStatus,
        delivery_address:         deliveryAddress.trim() || null,
        delivery_recipient_name:  recipientName.trim() || null,
        delivery_recipient_phone: recipientPhone.trim() || null,
        delivery_driver:          driver.trim() || null,
        delivery_fee:             parseInt(fee, 10) || 0,
        estimated_delivery:       estimatedDelivery || null,
        actual_delivery:          actualDelivery || null,
        delivery_notes:           deliveryNotes.trim() || null,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center">
              <Truck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 leading-tight">Gestion livraison</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{order.reference}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Statut actuel */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 shrink-0 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statut livraison</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${currentCfg.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {currentCfg.label}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

          {/* Statut + mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Statut de livraison</label>
              <select
                className={inputClass}
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
                disabled={!canEdit}
              >
                {Object.entries(DELIVERY_STATUS_CONFIG).map(([v, cfg]) => (
                  <option key={v} value={v}>{cfg.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Mode de livraison</label>
              <select
                className={inputClass}
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value as typeof deliveryMethod)}
                disabled={!canEdit}
              >
                {DELIVERY_METHOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Destinataire */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Destinataire</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom du destinataire</label>
                <input className={inputClass} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder={order.customer?.contactName ?? ""} disabled={!canEdit} />
              </div>
              <div>
                <label className={labelClass}>Téléphone destinataire</label>
                <input className={inputClass} value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="+221 77 …" disabled={!canEdit} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />Adresse de livraison</span>
                </label>
                <input className={inputClass} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Rue, quartier, ville…" disabled={!canEdit} />
              </div>
            </div>
          </div>

          {/* Planification */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Planification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date prévue</label>
                <input className={inputClass} type="date" value={estimatedDelivery} onChange={(e) => setEstimatedDelivery(e.target.value)} disabled={!canEdit} />
              </div>
              <div>
                <label className={labelClass}>Date effective</label>
                <input className={inputClass} type="date" value={actualDelivery} onChange={(e) => setActualDelivery(e.target.value)} disabled={!canEdit} />
              </div>
              <div>
                <label className={labelClass}>Livreur assigné</label>
                <input className={inputClass} value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Nom du livreur" disabled={!canEdit} />
              </div>
              <div>
                <label className={labelClass}>Frais de livraison (FCFA)</label>
                <input className={inputClass} type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} disabled={!canEdit} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Notes livraison</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Instructions particulières…"
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>

          {/* Avertissement frais de livraison */}
          {(parseInt(fee, 10) || 0) > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 space-y-1">
              <p className="text-xs font-bold text-amber-700">
                Frais de livraison : {(parseInt(fee, 10) || 0).toLocaleString("fr-SN")} FCFA
              </p>
              <p className="text-[11px] text-amber-600">
                Ce montant sera visible sur la facture et les messages client. Assurez-vous que le client en a été informé avant validation.
              </p>
            </div>
          )}

          {/* WhatsApp contextuel */}
          {order.customer && waLink && (
            <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-xs text-green-700 font-semibold">
                {deliveryStatus === "non_planifiee"
                  ? "Contacter le client par WhatsApp"
                  : `Message "${currentCfg.label}" prêt à envoyer`}
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </div>
          )}

          {/* Bon de livraison */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-xs text-teal-700 font-semibold">Bon de livraison PDF</p>
            <a
              href={`/api/admin/commandes/${order.id}/bon-livraison`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 text-white text-xs font-bold hover:bg-teal-600 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" /> Générer
            </a>
          </div>

          {/* Feedback */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" /> Livraison enregistrée
            </div>
          )}
        </form>

        {/* Footer actions */}
        {canEdit && (
          <div className="px-6 py-4 border-t border-slate-100 bg-white rounded-b-3xl shrink-0 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
              Fermer
            </button>
            <button
              type="submit"
              form="delivery-form"
              disabled={isPending}
              onClick={handleSubmit as unknown as React.MouseEventHandler<HTMLButtonElement>}
              className="flex-1 h-11 rounded-xl bg-teal-600 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-60"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Badge compact ────────────────────────────────────────────────────────────

export function DeliveryBadge({ status }: { status: DeliveryStatus }) {
  const cfg  = DELIVERY_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}
