"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Eye,
  MessageCircle,
  Paperclip,
  ArrowLeft,
  Flame,
  Zap,
  Snowflake,
  HelpCircle,
  XCircle,
} from "lucide-react";
import type { ProspectStatus, ProspectPriority } from "@/lib/types/domain";
import type { ProspectWithFileFlag } from "@/lib/db/prospects";

// ─── Config ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProspectStatus, { label: string; color: string }> = {
  nouveau:              { label: "Nouveau",             color: "bg-blue-100 text-blue-700" },
  devis_envoye:         { label: "Devis envoyé",       color: "bg-indigo-100 text-indigo-700" },
  en_negociation:       { label: "En négociation",     color: "bg-amber-100 text-amber-700" },
  validation_conception:{ label: "Valid. conception",   color: "bg-purple-100 text-purple-700" },
  commande_confirmee:   { label: "Commande confirmée", color: "bg-emerald-100 text-emerald-700" },
  en_production:        { label: "En production",      color: "bg-orange-100 text-orange-700" },
  livre:                { label: "Livré",              color: "bg-green-100 text-green-700" },
  annule:               { label: "Annulé",             color: "bg-red-100 text-red-700" },
};

const PRIORITY_CONFIG: Record<ProspectPriority, { label: string; color: string; icon: typeof Flame }> = {
  urgent:      { label: "Urgent",      color: "bg-red-100 text-red-700",     icon: Zap },
  chaud:       { label: "Chaud",       color: "bg-orange-100 text-orange-700", icon: Flame },
  a_qualifier: { label: "À qualifier", color: "bg-slate-100 text-slate-600",  icon: HelpCircle },
  froid:       { label: "Froid",       color: "bg-blue-50 text-blue-500",    icon: Snowflake },
  perdu:       { label: "Perdu",       color: "bg-gray-100 text-gray-500",   icon: XCircle },
};

const SOURCE_LABELS: Record<string, string> = {
  formulaire: "Formulaire",
  whatsapp:   "WhatsApp",
  manuel:     "Manuel",
  autre:      "Autre",
};

type PeriodFilter = "all" | "7j" | "30j" | "90j";

const PERIOD_OPTIONS: { key: PeriodFilter; label: string }[] = [
  { key: "all",  label: "Tout" },
  { key: "7j",   label: "7 jours" },
  { key: "30j",  label: "30 jours" },
  { key: "90j",  label: "90 jours" },
];

function periodCutoff(period: PeriodFilter): Date | null {
  if (period === "all") return null;
  const days = period === "7j" ? 7 : period === "30j" ? 30 : 90;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-SN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function cell(value: string | null | undefined): string {
  return value?.trim() || "—";
}

// ─── Brief text builder ──────────────────────────────────────────────────────

function buildBriefText(p: ProspectWithFileFlag): string {
  const lines = [
    `Brief prospect — ${p.fullName}`,
    ``,
    `Référence : ${p.reference}`,
    `WhatsApp : ${p.whatsapp}`,
  ];
  if (p.companyName) lines.push(`Entreprise : ${p.companyName}`);
  if (p.sector) lines.push(`Secteur : ${p.sector}`);
  lines.push(``);
  lines.push(`Produit demandé : ${p.requestedProducts.join(", ") || "—"}`);
  if (p.otherProduct) lines.push(`Autre produit : ${p.otherProduct}`);
  if (p.quantity) lines.push(`Quantité : ${p.quantity}`);
  if (p.formatDimensions) lines.push(`Format / Dimensions : ${p.formatDimensions}`);
  if (p.finish) lines.push(`Finition : ${p.finish}`);
  if (p.preferredColors) lines.push(`Couleurs : ${p.preferredColors}`);
  if (p.supportText) lines.push(`Texte support : ${p.supportText}`);
  if (p.productsServices) lines.push(`Activité entreprise : ${p.productsServices}`);
  if (p.desiredDeadline) lines.push(`Délai souhaité : ${p.desiredDeadline}`);
  if (p.deliveryZone) lines.push(`Zone de livraison : ${p.deliveryZone}`);
  if (p.message) lines.push(``, `Message : ${p.message}`);
  if (p.internalNotes) lines.push(``, `Notes commerciales : ${p.internalNotes}`);
  lines.push(``, `GLOBAL TIC`);
  return lines.join("\n");
}

// ─── CSV builder ─────────────────────────────────────────────────────────────

function buildCsvRow(p: ProspectWithFileFlag): string[] {
  return [
    p.createdAt ? formatDate(p.createdAt) : "",
    p.reference,
    p.fullName,
    p.whatsapp,
    p.companyName ?? "",
    p.sector ?? "",
    p.requestedProducts.join(" | "),
    p.otherProduct ?? "",
    p.quantity ?? "",
    p.formatDimensions ?? "",
    p.finish ?? "",
    p.preferredColors ?? "",
    p.supportText ?? "",
    p.productsServices ?? "",
    p.desiredDeadline ?? "",
    p.deliveryZone ?? "",
    p.message ?? "",
    p.internalNotes ?? "",
    p.status,
    p.priority,
    SOURCE_LABELS[p.source] ?? p.source,
    p.hasFiles ? "Oui" : "Non",
  ];
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const CSV_HEADERS = [
  "Date de demande", "Référence", "Nom", "WhatsApp", "Entreprise", "Secteur",
  "Produits demandés", "Autre produit", "Quantité", "Format/Dimensions",
  "Finition", "Couleurs", "Texte support", "Activité entreprise",
  "Délai souhaité", "Zone de livraison", "Message", "Notes commerciales",
  "Statut", "Priorité", "Source", "Fichier joint",
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProspectBriefClientProps {
  prospects: ProspectWithFileFlag[];
  canEdit: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProspectBriefClient({ prospects, canEdit }: ProspectBriefClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<ProspectPriority | "">("");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const cutoff = periodCutoff(periodFilter);

  const filtered = prospects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.fullName.toLowerCase().includes(q) ||
      p.whatsapp.includes(q) ||
      (p.companyName?.toLowerCase().includes(q) ?? false) ||
      p.requestedProducts.some((r) => r.toLowerCase().includes(q)) ||
      (p.reference?.toLowerCase().includes(q) ?? false);
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchPriority = !priorityFilter || p.priority === priorityFilter;
    const matchPeriod = !cutoff || new Date(p.createdAt) >= cutoff;
    return matchSearch && matchStatus && matchPriority && matchPeriod;
  });

  function handleCopy(id: string, text: string) {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleExportCsv() {
    const rows = filtered.map((p) => buildCsvRow(p).map(escapeCsv).join(","));
    const csvContent = "﻿" + [CSV_HEADERS.map(escapeCsv).join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prospects-global-tic-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/prospects"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Tableau Briefs</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {filtered.length} prospect{filtered.length !== 1 ? "s" : ""}
              {filtered.length !== prospects.length && ` sur ${prospects.length}`}
            </p>
          </div>
        </div>
        <button
          onClick={handleExportCsv}
          className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, WhatsApp, entreprise, produit, ref..."
            className="w-full pl-10 pr-4 h-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProspectStatus | "")}
            className="h-10 pl-10 pr-8 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary appearance-none bg-white"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([k, { label }]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as ProspectPriority | "")}
          className="h-10 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary appearance-none bg-white"
        >
          <option value="">Toutes priorités</option>
          {Object.entries(PRIORITY_CONFIG).map(([k, { label }]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1.5 h-10">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriodFilter(opt.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                periodFilter === opt.key
                  ? "bg-brand-primary text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className="text-left px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Prospect</th>
                <th className="text-left px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Produits</th>
                <th className="text-left px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Qté</th>
                <th className="text-left px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Format</th>
                <th className="text-left px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Finition</th>
                <th className="text-left px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Couleurs</th>
                <th className="text-left px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Texte</th>
                <th className="text-left px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Délai</th>
                <th className="text-center px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Fichier</th>
                <th className="text-center px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="text-center px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Priorité</th>
                <th className="text-center px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => {
                const status = STATUS_CONFIG[p.status];
                const prio = PRIORITY_CONFIG[p.priority];
                const PrioIcon = prio.icon;
                const copyBriefId = `brief-${p.id}`;
                const copyWaId = `wa-${p.id}`;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800 max-w-[140px] truncate">{p.fullName}</p>
                      {p.companyName && (
                        <p className="text-slate-400 max-w-[140px] truncate">{p.companyName}</p>
                      )}
                      <p className="text-slate-400 font-mono">{p.whatsapp}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[180px] text-slate-700 truncate">
                        {p.requestedProducts.length > 0
                          ? p.requestedProducts.join(", ")
                          : cell(p.otherProduct)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{cell(p.quantity)}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[100px] truncate">{cell(p.formatDimensions)}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[100px] truncate">{cell(p.finish)}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[120px] truncate">{cell(p.preferredColors)}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate">{cell(p.supportText)}</td>
                    <td className="px-4 py-3 text-slate-600">{cell(p.desiredDeadline)}</td>
                    <td className="px-4 py-3 text-center">
                      {p.hasFiles ? (
                        <span className="inline-flex items-center gap-1 text-brand-primary font-bold">
                          <Paperclip className="w-3 h-3" /> Oui
                        </span>
                      ) : (
                        <span className="text-slate-300">Non</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${prio.color}`}>
                        <PrioIcon className="w-3 h-3" />
                        {prio.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {/* Voir fiche */}
                        <Link
                          href={`/admin/prospects/${p.id}`}
                          title="Voir la fiche"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                        </Link>
                        {/* Copier WhatsApp */}
                        <button
                          onClick={() => handleCopy(copyWaId, p.whatsapp)}
                          title="Copier WhatsApp"
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                            copiedId === copyWaId
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-green-100 text-green-600 hover:bg-green-200"
                          }`}
                        >
                          {copiedId === copyWaId ? <Check className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                        </button>
                        {/* Copier brief */}
                        <button
                          onClick={() => handleCopy(copyBriefId, buildBriefText(p))}
                          title="Copier le brief"
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                            copiedId === copyBriefId
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {copiedId === copyBriefId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Aucun prospect trouvé</p>
            {(search || statusFilter || priorityFilter || periodFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setPriorityFilter("");
                  setPeriodFilter("all");
                }}
                className="mt-3 text-xs text-brand-primary hover:underline font-bold"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* Vue mobile — cards simplifiées */}
      <div className="sm:hidden space-y-3 mt-2">
        <p className="text-xs text-slate-400 font-semibold px-1">Version mobile — vue simplifiée</p>
        {filtered.map((p) => {
          const copyBriefId = `m-brief-${p.id}`;
          const copyWaId = `m-wa-${p.id}`;
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{p.fullName}</p>
                  {p.companyName && <p className="text-xs text-slate-400">{p.companyName}</p>}
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{p.whatsapp}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${STATUS_CONFIG[p.status].color}`}>
                  {STATUS_CONFIG[p.status].label}
                </span>
              </div>
              {p.requestedProducts.length > 0 && (
                <p className="text-xs text-slate-600 font-semibold">{p.requestedProducts.join(", ")}</p>
              )}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {p.quantity && <span className="text-slate-500">Qté : <span className="font-bold text-slate-700">{p.quantity}</span></span>}
                {p.formatDimensions && <span className="text-slate-500">Format : <span className="font-bold text-slate-700">{p.formatDimensions}</span></span>}
                {p.preferredColors && <span className="text-slate-500 col-span-2">Couleurs : <span className="font-bold text-slate-700">{p.preferredColors}</span></span>}
                {p.desiredDeadline && <span className="text-slate-500">Délai : <span className="font-bold text-slate-700">{p.desiredDeadline}</span></span>}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/admin/prospects/${p.id}`}
                  className="flex-1 h-8 rounded-xl bg-brand-primary/10 text-brand-primary text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-brand-primary hover:text-white transition-colors"
                >
                  <Eye className="w-3 h-3" /> Fiche
                </Link>
                <button
                  onClick={() => handleCopy(copyWaId, p.whatsapp)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${copiedId === copyWaId ? "bg-emerald-100 text-emerald-600" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                  title="Copier WhatsApp"
                >
                  {copiedId === copyWaId ? <Check className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleCopy(copyBriefId, buildBriefText(p))}
                  className={`flex-1 h-8 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors ${copiedId === copyBriefId ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {copiedId === copyBriefId ? <><Check className="w-3 h-3" /> Copié</> : <><Copy className="w-3 h-3" /> Brief</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
