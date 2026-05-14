"use client";

import { useEffect, useState } from "react";
import { Loader2, Activity } from "lucide-react";
import { getOrderActivityLogAction } from "@/lib/actions/activity-log";
import type { ActivityLogEntry } from "@/lib/db/activity-log";

// Libellés et icônes par action
const ACTION_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  commande_creee:       { label: "Commande créée",               color: "text-blue-700",    dot: "bg-blue-400" },
  statut_change:        { label: "Statut modifié",               color: "text-slate-700",   dot: "bg-slate-400" },
  paiement_mis_a_jour:  { label: "Paiement mis à jour",          color: "text-emerald-700", dot: "bg-emerald-400" },
  fichier_ajoute:       { label: "Fichier ajouté",               color: "text-violet-700",  dot: "bg-violet-400" },
  fichier_supprime:     { label: "Fichier supprimé",             color: "text-red-700",     dot: "bg-red-400" },
  note_interne_modifiee:{ label: "Note interne modifiée",        color: "text-amber-700",   dot: "bg-amber-400" },
};

const STATUS_LABELS: Record<string, string> = {
  en_attente:       "En attente",
  confirmee:        "Confirmée",
  bat_en_cours:     "BAT en cours",
  bat_valide:       "BAT validé",
  en_production:    "En production",
  controle_qualite: "Contrôle qualité",
  pret:             "Prête",
  en_livraison:     "En livraison",
  livre:            "Livrée",
  annulee:          "Annulée",
};

const FILE_TYPE_LABELS: Record<string, string> = {
  fichier_client: "Fichier client",
  maquette:       "Maquette",
  bat_client:     "BAT client",
  bat_valide:     "BAT validé",
  bon_livraison:  "Bon de livraison",
  facture:        "Facture",
  recu:           "Reçu de paiement",
  autre:          "Autre",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  non_paye:  "Non payé",
  acompte:   "Acompte",
  paye:      "Payé",
  rembourse: "Remboursé",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  wave:         "Wave",
  orange_money: "Orange Money",
  especes:      "Espèces",
  virement:     "Virement",
  cheque:       "Chèque",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-SN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildDescription(entry: ActivityLogEntry): string {
  const m = entry.metadata ?? {};

  switch (entry.action) {
    case "commande_creee":
      return `Commande ${m.reference ?? ""} créée depuis le devis ${m.devis ?? ""}`;

    case "statut_change": {
      const de = STATUS_LABELS[m.de as string] ?? (m.de as string);
      const vers = STATUS_LABELS[m.vers as string] ?? (m.vers as string);
      return `${de} → ${vers}`;
    }

    case "paiement_mis_a_jour": {
      const montant = typeof m.montant_nouveau === "number"
        ? m.montant_nouveau.toLocaleString("fr-SN") + " FCFA"
        : "—";
      const statut = PAYMENT_STATUS_LABELS[m.statut_paiement as string] ?? "";
      const mode = m.mode ? ` via ${PAYMENT_METHOD_LABELS[m.mode as string] ?? m.mode}` : "";
      return `${montant} enregistré — ${statut}${mode}`;
    }

    case "fichier_ajoute": {
      const type = FILE_TYPE_LABELS[m.type as string] ?? (m.type as string);
      return `${type} : ${m.nom ?? "fichier"}`;
    }

    case "fichier_supprime":
      return "Fichier retiré de la commande";

    case "note_interne_modifiee":
      return "Note interne mise à jour";

    default:
      return entry.action;
  }
}

interface OrderActivityLogProps {
  orderId: string;
}

export function OrderActivityLog({ orderId }: OrderActivityLogProps) {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderActivityLogAction(orderId).then((r) => {
      if (r.data) setEntries(r.data);
      setLoading(false);
    });
  }, [orderId]);

  return (
    <div>
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
        Journal d&apos;activité
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
          <Activity className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-300">Aucun événement enregistré</p>
        </div>
      ) : (
        <ol className="relative border-l border-slate-200 ml-2 space-y-0">
          {entries.map((entry) => {
            const config = ACTION_CONFIG[entry.action] ?? {
              label: entry.action,
              color: "text-slate-600",
              dot: "bg-slate-400",
            };
            return (
              <li key={entry.id} className="ml-4 pb-5">
                {/* Point de timeline */}
                <span className={`absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${config.dot}`} />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-xs font-bold ${config.color}`}>
                      {config.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {buildDescription(entry)}
                    </p>
                  </div>
                  <time className="shrink-0 text-[10px] text-slate-400 tabular-nums pt-0.5">
                    {formatDateTime(entry.createdAt)}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
