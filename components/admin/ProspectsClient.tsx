"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  MessageCircle,
  Filter,
  X,
  UserPlus,
  Calendar,
} from "lucide-react";
import type { Prospect, ProspectStatus, AdminRole } from "@/lib/types/domain";
import { siteConfig } from "@/lib/config/site";

const STATUS_CONFIG: Record<ProspectStatus, { label: string; color: string }> = {
  nouveau:              { label: "Nouveau",              color: "bg-blue-100 text-blue-700" },
  devis_envoye:         { label: "Devis envoyé",        color: "bg-indigo-100 text-indigo-700" },
  en_negociation:       { label: "En négociation",      color: "bg-amber-100 text-amber-700" },
  validation_conception:{ label: "Valid. conception",    color: "bg-purple-100 text-purple-700" },
  commande_confirmee:   { label: "Commande confirmée",  color: "bg-emerald-100 text-emerald-700" },
  en_production:        { label: "En production",       color: "bg-orange-100 text-orange-700" },
  livre:                { label: "Livré",               color: "bg-green-100 text-green-700" },
  annule:               { label: "Annulé",              color: "bg-red-100 text-red-700" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-SN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildWhatsAppLink(whatsapp: string): string {
  const number = whatsapp.replace(/[^0-9]/g, "") || siteConfig.whatsapp;
  return `https://wa.me/${number}`;
}

interface ProspectsClientProps {
  prospects: Prospect[];
  totalCount: number;
  activeFilter?: { label: string; count: number; resetHref: string };
  role: AdminRole;
}

export function ProspectsClient({ prospects, totalCount, activeFilter, role: _role }: ProspectsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | "">("");

  const filtered = prospects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.fullName.toLowerCase().includes(q) ||
      p.whatsapp.includes(q) ||
      (p.companyName?.toLowerCase().includes(q) ?? false) ||
      (p.email?.toLowerCase().includes(q) ?? false);

    const matchesStatus = !statusFilter || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formUrl = typeof window !== "undefined"
    ? `${window.location.origin}/demande`
    : "/demande";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Prospects</h1>
          <p className="text-sm text-slate-400 mt-1">
            {totalCount} prospect{totalCount !== 1 ? "s" : ""} au total
            {activeFilter && (
              <span className="ml-2 inline-flex items-center gap-1 text-brand-primary font-semibold">
                · {activeFilter.label} ({activeFilter.count})
                <Link href={activeFilter.resetHref} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </Link>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(formUrl);
            }}
            className="h-10 px-4 rounded-xl bg-brand-primary text-white text-sm font-bold hover:bg-brand-primary-dark transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Copier lien formulaire
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, entreprise..."
            className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProspectStatus | "")}
            className="h-11 pl-10 pr-8 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary appearance-none bg-white"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Compteur résultats */}
      {(search || statusFilter) && (
        <p className="text-xs text-slate-400">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Liste mobile */}
      <div className="sm:hidden space-y-3">
        {filtered.map((p) => {
          const status = STATUS_CONFIG[p.status];
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-800">{p.fullName}</p>
                  {p.companyName && <p className="text-xs text-slate-400">{p.companyName}</p>}
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                <span>{p.whatsapp}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(p.createdAt)}
                </span>
              </div>
              {p.requestedProducts.length > 0 && (
                <p className="text-xs text-slate-500 truncate">
                  {p.requestedProducts.join(", ")}
                </p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/admin/prospects/${p.id}`}
                  className="flex-1 h-9 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Fiche
                </Link>
                <a
                  href={buildWhatsAppLink(p.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-9 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tableau desktop */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Réf.</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prospect</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Produits demandés</th>
                <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => {
                const status = STATUS_CONFIG[p.status];
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-400">{p.reference}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/prospects/${p.id}`} className="font-bold text-slate-700 hover:text-brand-primary transition-colors">
                        {p.fullName}
                      </Link>
                      {p.companyName && <p className="text-[11px] text-slate-400">{p.companyName}</p>}
                      <p className="text-[11px] text-slate-400">{p.whatsapp}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 truncate max-w-[200px]">
                        {p.requestedProducts.length > 0
                          ? p.requestedProducts.join(", ")
                          : <span className="text-slate-300">—</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/admin/prospects/${p.id}`}
                          title="Voir la fiche"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <a
                          href={buildWhatsAppLink(p.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Contacter sur WhatsApp"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
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
            <UserPlus className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold">Aucun prospect trouvé</p>
            <p className="text-xs mt-1">Partagez le lien du formulaire sur WhatsApp pour recevoir des prospects.</p>
          </div>
        )}
      </div>
    </div>
  );
}
