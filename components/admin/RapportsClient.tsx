"use client";

import { useState, useTransition } from "react";
import {
  BarChart2,
  FileDown,
  TrendingUp,
  ShoppingCart,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  FileText,
  Users,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  Loader2,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import type { ReportData } from "@/lib/types/reports";
import type { AdminRole } from "@/lib/types/domain";
import { formatPrice, formatDateShort } from "@/lib/utils/format";
import { getReportDataAction } from "@/lib/actions/reports";

const inputClass =
  "px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider";

// Plages prédéfinies
type PresetKey = "today" | "7d" | "month" | "prev_month" | "custom";

interface Preset { label: string; key: PresetKey }

const PRESETS: Preset[] = [
  { label: "Aujourd'hui",     key: "today" },
  { label: "7 derniers jours", key: "7d" },
  { label: "Mois en cours",   key: "month" },
  { label: "Mois précédent",  key: "prev_month" },
  { label: "Personnalisée",   key: "custom" },
];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function monthStart(offset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset, 1);
  return d.toISOString().slice(0, 10);
}

function monthEnd(offset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset + 1, 0);
  return d.toISOString().slice(0, 10);
}

function periodFromPreset(key: PresetKey, customFrom: string, customTo: string): { from: string; to: string } {
  switch (key) {
    case "today":      return { from: todayStr(),     to: todayStr() };
    case "7d":         return { from: daysAgo(6),     to: todayStr() };
    case "month":      return { from: monthStart(0),  to: monthEnd(0) };
    case "prev_month": return { from: monthStart(-1), to: monthEnd(-1) };
    default:           return { from: customFrom,     to: customTo };
  }
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  en_attente: "En attente", confirmee: "Confirmée", bat_en_cours: "BAT en cours",
  bat_valide: "BAT validé", en_production: "En production", controle_qualite: "Ctrl qualité",
  pret: "Prête", en_livraison: "En livraison", livre: "Livrée", annulee: "Annulée",
};

// ── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "blue",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: "blue" | "green" | "amber" | "red" | "purple" | "teal" | "slate";
}) {
  const colorMap: Record<string, string> = {
    blue:   "bg-blue-50 text-blue-500",
    green:  "bg-green-50 text-green-500",
    amber:  "bg-amber-50 text-amber-500",
    red:    "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-500",
    teal:   "bg-teal-50 text-teal-500",
    slate:  "bg-slate-50 text-slate-400",
  };
  const valueColor: Record<string, string> = {
    blue:   "text-slate-800",
    green:  "text-green-600",
    amber:  "text-amber-600",
    red:    "text-red-600",
    purple: "text-purple-600",
    teal:   "text-teal-600",
    slate:  "text-slate-500",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{label}</span>
      </div>
      <p className={`text-2xl font-black tabular-nums ${valueColor[color]}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 font-medium mt-1">{sub}</p>}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

interface RapportsClientProps {
  role: AdminRole;
  showFinance: boolean;
}

export function RapportsClient({ role, showFinance }: RapportsClientProps) {
  const [preset, setPreset]       = useState<PresetKey>("month");
  const [customFrom, setCustomFrom] = useState(monthStart(0));
  const [customTo, setCustomTo]   = useState(monthEnd(0));
  const [report, setReport]       = useState<ReportData | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { from, to } = periodFromPreset(preset, customFrom, customTo);

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await getReportDataAction(from, to);
      if (result.error) {
        setError(result.error);
      } else {
        setReport(result.data ?? null);
      }
    });
  }

  const pdfUrl = `/api/admin/rapports/pdf?from=${from}&to=${to}`;

  const hasSatisfaction = report
    ? report.satisfaitCount + report.neutreCount + report.insatisfaitCount > 0
    : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">Rapports d&apos;activité</h2>
        <p className="text-sm text-slate-400 font-medium mt-1">Bilan commercial, financier et production sur une période</p>
      </div>

      {/* Sélecteur de période */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-4 h-4 text-brand-primary" />
          <span className={labelClass}>Période</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className={`h-9 px-4 rounded-xl text-sm font-bold transition-colors ${
                preset === p.key
                  ? "bg-brand-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div>
              <label className={`${labelClass} block mb-1`}>Du</label>
              <input
                type="date"
                className={inputClass}
                value={customFrom}
                max={customTo}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div>
              <label className={`${labelClass} block mb-1`}>Au</label>
              <input
                type="date"
                className={inputClass}
                value={customTo}
                min={customFrom}
                max={todayStr()}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="h-10 px-6 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
            {isPending ? "Calcul en cours…" : "Générer le rapport"}
          </button>
          {report && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-6 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Télécharger PDF
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Résultats */}
      {report && (
        <>
          {/* Période affichée */}
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-600">
              {new Date(report.period.from).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              {" → "}
              {new Date(report.period.to).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          {/* ── Finance ── */}
          {showFinance && (
            <section>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Finance</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <KpiCard label="CA commandes"    value={formatPrice(report.ordersCA)}        icon={TrendingUp}  color="green" />
                <KpiCard label="Encaissé"         value={formatPrice(report.ordersEncaisse)}  icon={Wallet}      color="blue" />
                <KpiCard label="Solde restant"    value={formatPrice(report.ordersSolde)}     icon={Clock}       color={report.ordersSolde > 0 ? "amber" : "slate"} />
                <KpiCard label="CA devis acceptés" value={formatPrice(report.quotesCA)}       icon={FileText}    color="purple" />
              </div>
            </section>
          )}

          {/* ── Commercial ── */}
          <section>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Commercial</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard label="Devis créés"    value={report.quotesCreated}  icon={FileText}     color="amber" />
              <KpiCard label="Devis acceptés" value={report.quotesAccepted} icon={CheckCircle2} color="green" />
              <KpiCard label="Taux acceptation" value={`${report.tauxAcceptation}%`} icon={TrendingUp}
                color={report.tauxAcceptation >= 50 ? "green" : "amber"}
                sub={report.quotesCreated === 0 ? "Aucun devis" : undefined}
              />
              <KpiCard label="Devis refusés"  value={report.quotesRefused}  icon={XCircle}      color="red" />
            </div>
          </section>

          {/* ── Production ── */}
          <section>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Production</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard label="Commandes créées" value={report.ordersCreated}  icon={ShoppingCart} color="blue" />
              <KpiCard label="Livrées"           value={report.ordersLivrees}  icon={Truck}        color="green" />
              <KpiCard label="En cours"          value={report.ordersEnCours}  icon={Clock}        color="teal" />
              <KpiCard label="Annulées"          value={report.ordersAnnulees} icon={XCircle}      color="red" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <KpiCard label="Factures émises" value={report.facturesEmises} icon={FileText}     color="purple" />
              <KpiCard label="Factures payées" value={report.facturesPayees} icon={CheckCircle2} color="green" />
              <KpiCard label="Réclamations"    value={report.ordersReclamations} icon={AlertTriangle}
                color={report.ordersReclamations > 0 ? "red" : "slate"} />
            </div>
          </section>

          {/* ── Satisfaction ── */}
          {hasSatisfaction && (
            <section>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Satisfaction client</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                  <Smile className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-black text-green-600">{report.satisfaitCount}</p>
                  <p className="text-xs font-bold text-green-600 mt-1">Satisfaits</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                  <Meh className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-2xl font-black text-slate-500">{report.neutreCount}</p>
                  <p className="text-xs font-bold text-slate-400 mt-1">Neutres</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                  <Frown className="w-6 h-6 text-red-500 mx-auto mb-1" />
                  <p className="text-2xl font-black text-red-600">{report.insatisfaitCount}</p>
                  <p className="text-xs font-bold text-red-600 mt-1">Insatisfaits</p>
                </div>
              </div>
            </section>
          )}

          {/* ── Points d'attention ── */}
          {(() => {
            const alerts: string[] = [];
            if (report.ordersSolde > 0)
              alerts.push(`Solde à encaisser : ${formatPrice(report.ordersSolde)} sur ${report.impayesOrders.length} commande(s)`);
            if (report.ordersReclamations > 0)
              alerts.push(`${report.ordersReclamations} réclamation(s) enregistrée(s)`);
            if (report.insatisfaitCount > 0)
              alerts.push(`${report.insatisfaitCount} client(s) insatisfait(s)`);
            if (report.tauxAcceptation < 50 && report.quotesCreated >= 5)
              alerts.push(`Taux d'acceptation faible : ${report.tauxAcceptation}% (objectif > 50%)`);
            if (alerts.length === 0) return null;
            return (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs font-black text-amber-700 uppercase tracking-wider">Points d&apos;attention</p>
                </div>
                {alerts.map((a, i) => (
                  <p key={i} className="text-sm text-amber-700 font-medium">• {a}</p>
                ))}
              </div>
            );
          })()}

          {/* ── Top clients ── */}
          {showFinance && report.topClients.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-primary" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Top clients</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                      <th className="text-center px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Commandes</th>
                      {showFinance && <th className="text-right px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">CA FCFA</th>}
                      {showFinance && <th className="text-right px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Encaissé</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {report.topClients.map((c) => (
                      <tr key={c.customerId} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3">
                          <p className="font-bold text-slate-700">{c.name}</p>
                          {c.company && <p className="text-xs text-slate-400">{c.company}</p>}
                        </td>
                        <td className="px-5 py-3 text-center font-semibold text-slate-600">{c.ordersCount}</td>
                        {showFinance && <td className="px-5 py-3 text-right font-black text-slate-700 tabular-nums">{formatPrice(c.totalCA)}</td>}
                        {showFinance && <td className="px-5 py-3 text-right text-slate-600 tabular-nums">{formatPrice(c.totalPaid)}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Commandes de la période ── */}
          {report.topOrders.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-brand-primary" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Commandes de la période ({report.ordersCreated})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                      <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                      {showFinance && <th className="text-right px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</th>}
                      {showFinance && <th className="text-right px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payé</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {report.topOrders.map((o) => {
                      const balance = o.total - o.paidAmount;
                      return (
                        <tr key={o.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-3 font-bold text-slate-700">{o.reference}</td>
                          <td className="px-5 py-3 text-slate-600">{o.customer ?? "—"}</td>
                          <td className="px-5 py-3 text-xs text-slate-500">{ORDER_STATUS_LABELS[o.status] ?? o.status}</td>
                          {showFinance && <td className="px-5 py-3 text-right font-black text-slate-700 tabular-nums">{formatPrice(o.total)}</td>}
                          {showFinance && (
                            <td className={`px-5 py-3 text-right tabular-nums font-semibold ${balance > 0 ? "text-amber-600" : "text-green-600"}`}>
                              {formatPrice(o.paidAmount)}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Impayés ── */}
          {showFinance && report.impayesOrders.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Soldes restants</h3>
              </div>
              <div className="divide-y divide-slate-50">
                {report.impayesOrders.map((o) => (
                  <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-700">{o.reference}</p>
                      <p className="text-xs text-slate-400">{o.customer ?? "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-amber-600 tabular-nums">{formatPrice(o.total - o.paidAmount)}</p>
                      <p className="text-[10px] text-slate-400">sur {formatPrice(o.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Réclamations ── */}
          {report.reclamations.length > 0 && (
            <section className="bg-white rounded-2xl border border-red-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-red-50 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-[11px] font-black text-red-400 uppercase tracking-widest">Réclamations</h3>
              </div>
              <div className="divide-y divide-red-50">
                {report.reclamations.map((o) => (
                  <div key={o.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-bold text-slate-700">{o.reference}</p>
                      <span className="text-xs font-semibold text-slate-500">{o.customer ?? "—"}</span>
                    </div>
                    {o.complaint && <p className="text-xs text-slate-600 italic">{o.complaint}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Aucun résultat */}
          {report.ordersCreated === 0 && report.quotesCreated === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 px-6 py-12 text-center">
              <BarChart2 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">Aucune activité sur cette période</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
