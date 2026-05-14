"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  ChevronRight,
} from "lucide-react";
import type { OrderEnriched, QualityCheck, QCStatus, QCChecklistKey, AdminRole } from "@/lib/types/domain";
import { saveQualityCheckAction } from "@/lib/actions/quality-checks";
import { canPerform } from "@/lib/auth/permissions";

// ─── Définition de la checklist ───────────────────────────────────────────────

const CHECKLIST_ITEMS: { key: QCChecklistKey; label: string; requiresFinance?: boolean }[] = [
  { key: "produit_conforme",       label: "Produit conforme à la commande" },
  { key: "quantite_verifiee",      label: "Quantité vérifiée" },
  { key: "couleurs_impression",    label: "Couleurs / impression vérifiées" },
  { key: "finitions_verifiees",    label: "Finitions vérifiées" },
  { key: "bat_respecte",           label: "BAT respecté" },
  { key: "emballage_verifie",      label: "Emballage vérifié" },
  { key: "bon_livraison_prepare",  label: "Bon de livraison préparé" },
  { key: "paiement_verifie",       label: "Paiement / solde vérifié", requiresFinance: true },
];

const QC_STATUS_CONFIG: Record<QCStatus, { label: string; color: string; icon: React.ElementType }> = {
  non_verifie: { label: "Non vérifié",  color: "bg-slate-100 text-slate-500",    icon: Clock },
  en_cours:    { label: "En contrôle",  color: "bg-amber-100 text-amber-700",    icon: Clock },
  valide:      { label: "Validé",       color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  a_corriger:  { label: "À corriger",   color: "bg-red-100 text-red-600",        icon: AlertTriangle },
};

interface QualityCheckModalProps {
  order: OrderEnriched;
  qc:    QualityCheck | null;
  role:  AdminRole;
  canSeeFinance: boolean;
  onClose: () => void;
}

export function QualityCheckModal({ order, qc, role, canSeeFinance, onClose }: QualityCheckModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canEdit = canPerform(role, "commande:edit_status");

  const [checklist, setChecklist] = useState<Partial<Record<QCChecklistKey, boolean>>>(
    qc?.checklist ?? {}
  );
  const [notes, setNotes]   = useState(qc?.notes ?? "");
  const [error, setError]   = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const visibleItems = CHECKLIST_ITEMS.filter(
    (item) => !item.requiresFinance || canSeeFinance
  );
  const checkedCount  = visibleItems.filter((i) => checklist[i.key]).length;
  const allChecked    = checkedCount === visibleItems.length;

  function toggleItem(key: QCChecklistKey) {
    if (!canEdit) return;
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccess(null);
  }

  async function handleSave(status: QCStatus) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await saveQualityCheckAction(order.id, order.reference, {
        status,
        checklist,
        notes: notes.trim() || null,
        canSeePayment: canSeeFinance,
      });
      if (result.error) {
        setError(result.error);
      } else {
        const labels: Record<QCStatus, string> = {
          non_verifie: "Contrôle réinitialisé",
          en_cours:    "Contrôle démarré",
          valide:      "Contrôle qualité validé",
          a_corriger:  "Correction demandée",
        };
        setSuccess(labels[status]);
        router.refresh();
      }
    });
  }

  const currentStatus: QCStatus = qc?.status ?? "non_verifie";
  const statusCfg = QC_STATUS_CONFIG[currentStatus];
  const StatusIcon = statusCfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 leading-tight">Contrôle qualité</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{order.reference}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Statut actuel */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${statusCfg.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {statusCfg.label}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: visibleItems.length > 0 ? `${(checkedCount / visibleItems.length) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-500 tabular-nums shrink-0">
              {checkedCount}/{visibleItems.length}
            </span>
          </div>
        </div>

        {/* Checklist */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {visibleItems.map((item) => {
            const checked = !!checklist[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleItem(item.key)}
                disabled={!canEdit || isPending}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                  checked
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                } disabled:opacity-60 disabled:cursor-default`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                  checked ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                }`}>
                  {checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-sm font-semibold flex-1">{item.label}</span>
                {item.requiresFinance && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                    Finance
                  </span>
                )}
              </button>
            );
          })}

          {/* Notes */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Notes / observations
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!canEdit || isPending}
              placeholder="Observations, problèmes détectés..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-700 placeholder-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-300 disabled:opacity-60 disabled:bg-slate-50"
            />
          </div>

          {/* Alerte si passage en "Prête" sans QC validé */}
          {currentStatus !== "valide" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium">
                Le contrôle qualité n&apos;est pas encore validé. Il est recommandé de compléter la checklist avant de marquer la commande comme prête.
              </p>
            </div>
          )}

          {/* Feedback */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              {success}
            </div>
          )}
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="px-6 py-4 border-t border-slate-100 bg-white rounded-b-3xl shrink-0">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                onClick={() => handleSave("en_cours")}
                disabled={isPending || currentStatus === "en_cours"}
                className="h-10 rounded-xl bg-amber-100 text-amber-700 text-xs font-bold hover:bg-amber-200 transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                En contrôle
              </button>
              <button
                onClick={() => handleSave("a_corriger")}
                disabled={isPending}
                className="h-10 rounded-xl bg-red-100 text-red-700 text-xs font-bold hover:bg-red-200 transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
              >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                À corriger
              </button>
              <button
                onClick={() => handleSave("valide")}
                disabled={isPending || !allChecked}
                title={!allChecked ? "Cocher tous les points avant de valider" : undefined}
                className="col-span-2 sm:col-span-1 h-10 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5 bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-200 disabled:text-emerald-600"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                Valider le contrôle
              </button>
            </div>
            {!allChecked && (
              <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
                {visibleItems.length - checkedCount} point{visibleItems.length - checkedCount > 1 ? "s" : ""} restant{visibleItems.length - checkedCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Badge compact pour les listes ────────────────────────────────────────────

export function QCBadge({ status }: { status: QCStatus }) {
  const cfg = QC_STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

export { QC_STATUS_CONFIG };
