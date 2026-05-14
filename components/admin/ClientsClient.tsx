"use client";

import { useState } from "react";
import { Users, Plus, Search, MessageCircle, Copy, Check, FileText, ShoppingCart, Eye } from "lucide-react";
import type { Customer } from "@/lib/types/domain";
import { formatDateShort } from "@/lib/utils/format";
import { ActiveFilterBadge } from "@/components/admin/ActiveFilterBadge";
import Link from "next/link";
import { siteConfig } from "@/lib/config/site";

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
  canEdit?: boolean;
}

function buildWhatsAppLink(whatsapp: string): string {
  const number = whatsapp.replace(/[^0-9]/g, "") || siteConfig.whatsapp;
  return `https://wa.me/${number}`;
}

export function ClientsClient({ customers, totalCount, activeFilter, canEdit }: ClientsClientProps) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  function handleCopyPhone(customer: Customer) {
    navigator.clipboard.writeText(customer.whatsapp).then(() => {
      setCopiedId(customer.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

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
        {canEdit && (
          <button className="h-10 px-4 sm:px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-all shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        )}
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
              const waLink = buildWhatsAppLink(c.whatsapp);
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/admin/clients/${c.id}`} className="font-black text-slate-800 text-sm hover:text-brand-primary transition-colors">
                        {c.contactName}
                      </Link>
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
                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="flex-1 h-9 rounded-xl bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      title="Voir la fiche client"
                    >
                      <Eye className="w-3.5 h-3.5" /> Fiche
                    </Link>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-9 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      title="Ouvrir WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    <button
                      onClick={() => handleCopyPhone(c)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${copiedId === c.id ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                      title={copiedId === c.id ? "Copié !" : "Copier le numéro"}
                    >
                      {copiedId === c.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <Link
                      href={`/admin/devis?client=${encodeURIComponent(c.whatsapp)}`}
                      className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors shrink-0"
                      title="Voir les devis"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/admin/commandes?client=${encodeURIComponent(c.whatsapp)}`}
                      className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 hover:bg-brand-primary/10 hover:text-brand-primary flex items-center justify-center transition-colors shrink-0"
                      title="Voir les commandes"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </Link>
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
                  <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => {
                  const tier = TIER_LABELS[c.loyaltyTier] ?? TIER_LABELS.nouveau;
                  const waLink = buildWhatsAppLink(c.whatsapp);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/clients/${c.id}`} className="font-bold text-slate-700 hover:text-brand-primary transition-colors">
                          {c.contactName}
                        </Link>
                        {c.companyName && <p className="text-[11px] text-slate-400">{c.companyName}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-600 text-sm">{c.whatsapp}</p>
                        {c.email && <p className="text-[11px] text-slate-400">{c.email}</p>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${tier.color}`}>
                          {tier.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(c.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            href={`/admin/clients/${c.id}`}
                            title="Voir la fiche client"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ouvrir WhatsApp"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleCopyPhone(c)}
                            title={copiedId === c.id ? "Copié !" : "Copier le numéro"}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${copiedId === c.id ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}
                          >
                            {copiedId === c.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <Link
                            href={`/admin/devis?client=${encodeURIComponent(c.whatsapp)}`}
                            title="Voir les devis"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/commandes?client=${encodeURIComponent(c.whatsapp)}`}
                            title="Voir les commandes"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
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
