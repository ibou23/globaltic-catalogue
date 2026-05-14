"use client";

import { useState, useTransition } from "react";
import { X, CheckCircle2, Star, AlertTriangle, RotateCcw, MessageCircle, ExternalLink } from "lucide-react";
import type { OrderEnriched, AdminRole, ClosureStatus, SatisfactionLevel } from "@/lib/types/domain";
import { saveClosureAction } from "@/lib/actions/closure";
import { canPerform } from "@/lib/auth/permissions";

const inputClass =
  "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const textareaClass =
  "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white resize-none";
const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";

// ── Badge ─────────────────────────────────────────────────────────────────────

const CLOSURE_CONFIG: Record<ClosureStatus, { label: string; color: string; icon: React.ElementType }> = {
  non_cloturee: { label: "Active",      color: "bg-blue-100 text-blue-600",     icon: RotateCcw },
  cloturee:     { label: "Clôturée",    color: "bg-slate-100 text-slate-600",   icon: CheckCircle2 },
  satisfait:    { label: "Satisfait",   color: "bg-green-100 text-green-700",   icon: Star },
  reclamation:  { label: "Réclamation", color: "bg-red-100 text-red-600",       icon: AlertTriangle },
};

const SATISFACTION_CONFIG: Record<SatisfactionLevel, { label: string; color: string; emoji: string }> = {
  satisfait:   { label: "Satisfait",   color: "border-green-300 bg-green-50 text-green-700",  emoji: "😊" },
  neutre:      { label: "Neutre",      color: "border-slate-200 bg-slate-50 text-slate-600",  emoji: "😐" },
  insatisfait: { label: "Insatisfait", color: "border-red-200 bg-red-50 text-red-600",        emoji: "😞" },
};

export function ClosureBadge({ status }: { status: ClosureStatus }) {
  if (status === "non_cloturee") return null;
  const cfg = CLOSURE_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ClosureModalProps {
  order: OrderEnriched;
  role: AdminRole;
  googleReviewUrl?: string;
  onClose: () => void;
}

// ── WhatsApp builders ─────────────────────────────────────────────────────────

function buildWaSatisfaction(order: OrderEnriched, googleReviewUrl: string): string {
  const client = order.customer?.contactName ?? "client";
  const whatsapp = (order.customer?.whatsapp ?? "").replace(/[^0-9]/g, "");
  const lines = [
    `Bonjour *${client}* 😊`,
    ``,
    `Votre commande *${order.reference}* a bien été livrée !`,
    ``,
    `Nous espérons que vous êtes satisfait de nos services.`,
    googleReviewUrl
      ? `Si vous souhaitez partager votre avis, voici le lien :\n${googleReviewUrl}`
      : `N'hésitez pas à nous faire part de vos retours.`,
    ``,
    `Merci de votre confiance — *GLOBAL TIC*`,
  ];
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function buildWaAvis(order: OrderEnriched, googleReviewUrl: string): string {
  const client = order.customer?.contactName ?? "client";
  const whatsapp = (order.customer?.whatsapp ?? "").replace(/[^0-9]/g, "");
  const lines = [
    `Bonjour *${client}*,`,
    ``,
    `Nous aimerions avoir votre avis sur votre expérience avec GLOBAL TIC suite à votre commande *${order.reference}*.`,
    ``,
    `Cela ne prend que quelques secondes et nous aide à améliorer nos services :`,
    googleReviewUrl ? `👉 ${googleReviewUrl}` : `Merci de nous contacter directement.`,
    ``,
    `Merci d'avance ! — *GLOBAL TIC*`,
  ];
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function buildWaReclamation(order: OrderEnriched): string {
  const client = order.customer?.contactName ?? "client";
  const whatsapp = (order.customer?.whatsapp ?? "").replace(/[^0-9]/g, "");
  const lines = [
    `Bonjour *${client}*,`,
    ``,
    `Nous avons bien pris en compte votre réclamation concernant la commande *${order.reference}*.`,
    ``,
    `Notre équipe va traiter votre demande dans les plus brefs délais et vous recontactera.`,
    ``,
    `Nous nous excusons pour la gêne occasionnée — *GLOBAL TIC*`,
  ];
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ClosureModal({ order, role, googleReviewUrl = "", onClose }: ClosureModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [closureStatus, setClosureStatus] = useState<ClosureStatus>(order.closureStatus);
  const [satisfaction, setSatisfaction] = useState<SatisfactionLevel | "">(order.satisfaction ?? "");
  const [customerComment, setCustomerComment] = useState(order.customerComment ?? "");
  const [complaint, setComplaint] = useState(order.complaint ?? "");
  const [correctiveAction, setCorrectiveAction] = useState(order.correctiveAction ?? "");

  const canEdit = canPerform(role, "commande:edit_status");
  const hasWhatsapp = !!order.customer?.whatsapp;
  const isReclamation = closureStatus === "reclamation";
  const isClosed = closureStatus !== "non_cloturee";

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveClosureAction(order.id, order.reference, {
        closure_status:    closureStatus,
        satisfaction:      satisfaction || null,
        customer_comment:  customerComment.trim() || null,
        complaint:         complaint.trim() || null,
        corrective_action: correctiveAction.trim() || null,
      });
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-black text-slate-800">Clôture commande</h2>
            <p className="text-xs text-slate-400 mt-0.5">{order.reference}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Statut clôture */}
          <div>
            <label className={labelClass}>Statut de clôture</label>
            <div className="grid grid-cols-2 gap-2">
              {(["non_cloturee", "cloturee", "satisfait", "reclamation"] as ClosureStatus[]).map((s) => {
                const cfg = CLOSURE_CONFIG[s];
                const Icon = cfg.icon;
                const selected = closureStatus === s;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => { if (canEdit) setClosureStatus(s); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                      selected
                        ? `${cfg.color} border-current`
                        : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100"
                    } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Satisfaction client — visible si clôturée */}
          {isClosed && (
            <div>
              <label className={labelClass}>Satisfaction client</label>
              <div className="grid grid-cols-3 gap-2">
                {(["satisfait", "neutre", "insatisfait"] as SatisfactionLevel[]).map((s) => {
                  const cfg = SATISFACTION_CONFIG[s];
                  const selected = satisfaction === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => { if (canEdit) setSatisfaction(selected ? "" : s); }}
                      className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                        selected ? cfg.color : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                      } ${!canEdit ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <span className="text-base leading-none">{cfg.emoji}</span>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Commentaire client */}
          {isClosed && (
            <div>
              <label className={labelClass}>Commentaire client</label>
              <textarea
                className={textareaClass}
                rows={3}
                maxLength={2000}
                placeholder="Retour verbal ou écrit du client…"
                value={customerComment}
                onChange={(e) => setCustomerComment(e.target.value)}
                disabled={!canEdit}
              />
            </div>
          )}

          {/* Réclamation */}
          {isReclamation && (
            <>
              <div>
                <label className={labelClass}>Détail de la réclamation</label>
                <textarea
                  className={textareaClass}
                  rows={3}
                  maxLength={2000}
                  placeholder="Décrivez le problème signalé par le client…"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <label className={labelClass}>Action corrective</label>
                <textarea
                  className={textareaClass}
                  rows={3}
                  maxLength={2000}
                  placeholder="Mesures prises ou prévues pour résoudre la réclamation…"
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </>
          )}

          {/* WhatsApp messages */}
          {hasWhatsapp && isClosed && (
            <div>
              <p className={labelClass}>Messages WhatsApp</p>
              <div className="space-y-2">
                <a
                  href={buildWaSatisfaction(order, googleReviewUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50 transition-colors text-xs font-semibold text-slate-600 hover:text-green-700"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0 text-green-500" />
                  Message post-livraison (remerciement)
                </a>
                {googleReviewUrl && (
                  <a
                    href={buildWaAvis(order, googleReviewUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-colors text-xs font-semibold text-slate-600 hover:text-amber-700"
                  >
                    <Star className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    Demande d&apos;avis Google
                  </a>
                )}
                {isReclamation && (
                  <a
                    href={buildWaReclamation(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50 transition-colors text-xs font-semibold text-slate-600 hover:text-red-700"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                    Accusé de réclamation
                  </a>
                )}
                {googleReviewUrl && (
                  <a
                    href={googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors text-xs font-semibold text-slate-400 hover:text-blue-600"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    Voir la page Google Avis
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {canEdit && (
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 h-11 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
              >
                {isPending ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
