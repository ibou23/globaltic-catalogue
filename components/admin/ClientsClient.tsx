"use client";

import { useState } from "react";
import { Users, Plus, Search } from "lucide-react";
import type { Customer } from "@/lib/types/domain";
import { formatDateShort } from "@/lib/utils/format";
import { ActiveFilterBadge } from "@/components/admin/ActiveFilterBadge";

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  nouveau:  { label: "Nouveau",  color: "bg-slate-100 text-slate-600" },
  regulier: { label: "Régulier", color: "bg-blue-100 text-blue-600" },
  vip:      { label: "VIP",      color: "bg-amber-100 text-amber-600" },
  premium:  { label: "Premium",  color: "bg-purple-100 text-purple-600" },
};

interface ActiveFilter {
  label: string;
  count: number;
  resetHref: string;
}

interface ClientsClientProps {
  customers: Customer[];
  totalCount?: number;
  activeFilter?: ActiveFilter;
}

export function ClientsClient({ customers, totalCount, activeFilter }: ClientsClientProps) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? customers.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.contactName.toLowerCase().includes(q) ||
          (c.companyName?.toLowerCase().includes(q) ?? false) ||
          c.whatsapp.includes(q)
        );
      })
    : customers;

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">
            Gestion des clients
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {activeFilter
              ? `${customers.length} résultat${customers.length > 1 ? "s" : ""} sur ${totalCount ?? customers.length} clients`
              : `${customers.length} client${customers.length > 1 ? "s" : ""} enregistrés`}
          </p>
        </div>
        <button className="h-10 px-4 sm:px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-all shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>

      {/* Badge filtre actif */}
      {activeFilter && (
        <ActiveFilterBadge
          label={activeFilter.label}
          count={activeFilter.count}
          resetHref={activeFilter.resetHref}
        />
      )}

      {/* Recherche locale */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
        <input
          type="text"
          placeholder="Rechercher par nom, société, WhatsApp…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 px-6 py-12 text-center">
          <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-300">
            {search ? "Aucun client ne correspond à cette recherche" : "Aucun client"}
          </p>
        </div>
      ) : (
        <>
          {/* ── Vue mobile : cards ── */}
          <div className="sm:hidden space-y-3">
            {filtered.map((c) => {
              const tier = TIER_LABELS[c.loyaltyTier] ?? TIER_LABELS.nouveau;
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-black text-slate-800 text-sm">{c.contactName}</p>
                      {c.companyName && (
                        <p className="text-xs text-slate-500 truncate">{c.companyName}</p>
                      )}
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${tier.color}`}>
                      {tier.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                    <span>{c.whatsapp}</span>
                    <span>{formatDateShort(c.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Vue desktop : tableau ── */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fidélité</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => {
                  const tier = TIER_LABELS[c.loyaltyTier] ?? TIER_LABELS.nouveau;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700">{c.contactName}</p>
                        {c.companyName && <p className="text-[11px] text-slate-400">{c.companyName}</p>}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{c.whatsapp}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${tier.color}`}>
                          {tier.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(c.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
