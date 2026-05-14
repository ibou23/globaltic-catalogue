"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  MessageCircle,
  ExternalLink,
  Download,
  X,
  Search,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
} from "lucide-react";
import type { InvoiceEnriched, AdminRole, InvoiceStatus } from "@/lib/types/domain";
import { formatDateShort } from "@/lib/utils/format";
import { updateInvoiceStatusAction } from "@/lib/actions/invoices";

// ─── Constantes ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  brouillon:           { label: "Brouillon",       color: "bg-slate-100 text-slate-500",   icon: FileText },
  emise:               { label: "Émise",            color: "bg-violet-100 text-violet-700", icon: Clock },
  payee:               { label: "Payée",            color: "bg-green-100 text-green-700",   icon: CheckCircle2 },
  partiellement_payee: { label: "Part. payée",      color: "bg-amber-100 text-amber-700",   icon: AlertCircle },
  annulee:             { label: "Annulée",          color: "bg-red-100 text-red-500",       icon: Ban },
};

type FilterKey =
  | "toutes"
  | InvoiceStatus
  | "solde_restant"
  | "aujourd_hui"
  | "7_jours"
  | "30_jours";

function formatAmount(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}

function buildWhatsAppLink(inv: InvoiceEnriched): string {
  if (!inv.customer?.whatsapp) return "#";
  const phone = inv.customer.whatsapp.replace(/\D/g, "");
  const balance = inv.total - inv.paidAmount;
  const lines = [
    `Bonjour *${inv.customer.contactName}*,`,
    ``,
    `Votre facture *${inv.reference}* liée à la commande *${inv.order?.reference ?? "—"}* est disponible.`,
    ``,
    `Montant total : *${formatAmount(inv.total)}*`,
    `Montant payé : *${formatAmount(inv.paidAmount)}*`,
    ...(balance > 0 ? [`Solde restant : *${formatAmount(balance)}*`] : []),
    ``,
    `Merci pour votre confiance.`,
    ``,
    `*GLOBAL TIC*`,
  ];
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface FacturesClientProps {
  invoices: InvoiceEnriched[];
  role: AdminRole;
  canEdit: boolean;
}

// ─── Composant principal ─────────────────────────────────────────────────────

export function FacturesClient({ invoices, canEdit }: FacturesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState<FilterKey>("toutes");
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId]   = useState<string | null>(null);

  // ── Stats (calculées sur toutes les factures hors annulées) ────────────────
  const stats = useMemo(() => {
    const actives = invoices.filter((i) => i.status !== "annulee");
    const totalFacture = actives.reduce((s, i) => s + i.total, 0);
    const totalPaye    = actives.reduce((s, i) => s + i.paidAmount, 0);
    const totalSolde   = totalFacture - totalPaye;
    const nbEmises     = invoices.filter((i) => i.status === "emise").length;
    const nbImpayees   = invoices.filter(
      (i) => i.status === "emise" || i.status === "partiellement_payee"
    ).length;
    return { totalFacture, totalPaye, totalSolde, nbEmises, nbImpayees };
  }, [invoices]);

  // ── Filtrage + recherche ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let list = invoices;

    // Filtre par statut / période
    if (filter === "solde_restant") {
      list = list.filter((i) => i.total - i.paidAmount > 0 && i.status !== "annulee");
    } else if (filter === "aujourd_hui") {
      list = list.filter((i) => new Date(i.issuedAt) >= today);
    } else if (filter === "7_jours") {
      const d = new Date(today); d.setDate(d.getDate() - 7);
      list = list.filter((i) => new Date(i.issuedAt) >= d);
    } else if (filter === "30_jours") {
      const d = new Date(today); d.setDate(d.getDate() - 30);
      list = list.filter((i) => new Date(i.issuedAt) >= d);
    } else if (filter !== "toutes") {
      list = list.filter((i) => i.status === filter);
    }

    // Recherche textuelle
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((i) =>
        i.reference.toLowerCase().includes(q) ||
        (i.order?.reference ?? "").toLowerCase().includes(q) ||
        (i.customer?.contactName ?? "").toLowerCase().includes(q) ||
        (i.customer?.companyName ?? "").toLowerCase().includes(q) ||
        (i.customer?.whatsapp ?? "").replace(/\D/g, "").includes(q.replace(/\D/g, ""))
      );
    }

    return list;
  }, [invoices, filter, search]);

  // ── Changement de statut ──────────────────────────────────────────────────
  function handleStatusChange(id: string, status: InvoiceStatus) {
    setUpdatingId(id);
    startTransition(async () => {
      await updateInvoiceStatusAction(id, status);
      setUpdatingId(null);
      router.refresh();
    });
  }

  function handleCancelConfirm(id: string) {
    setCancelingId(null);
    handleStatusChange(id, "annulee");
  }

  // ── Filtres tab config ────────────────────────────────────────────────────
  const filterTabs: { key: FilterKey; label: string; count?: number }[] = [
    { key: "toutes",             label: "Toutes",           count: invoices.length },
    { key: "emise",              label: "Émises",           count: invoices.filter((i) => i.status === "emise").length },
    { key: "partiellement_payee",label: "Part. payées",     count: invoices.filter((i) => i.status === "partiellement_payee").length },
    { key: "payee",              label: "Payées",           count: invoices.filter((i) => i.status === "payee").length },
    { key: "brouillon",          label: "Brouillons",       count: invoices.filter((i) => i.status === "brouillon").length },
    { key: "annulee",            label: "Annulées",         count: invoices.filter((i) => i.status === "annulee").length },
    { key: "solde_restant",      label: "Solde restant" },
    { key: "aujourd_hui",        label: "Aujourd'hui" },
    { key: "7_jours",            label: "7 jours" },
    { key: "30_jours",           label: "30 jours" },
  ];

  return (
    <>
      {/* ── Modale confirmation annulation ────────────────────────────── */}
      {cancelingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCancelingId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-base">Annuler la facture</h3>
                <p className="text-xs text-slate-500">Cette action est difficilement réversible.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Le statut passera à <span className="font-bold text-red-500">Annulée</span>. La commande liée ne sera pas affectée.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setCancelingId(null)}
                className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold transition-colors"
              >
                Retour
              </button>
              <button
                onClick={() => handleCancelConfirm(cancelingId)}
                disabled={isPending}
                className="flex-1 h-10 rounded-xl bg-red-500 text-white hover:bg-red-600 text-sm font-bold transition-colors disabled:opacity-50"
              >
                Confirmer l&apos;annulation
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">

        {/* ── En-tête ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">Factures</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            {filter !== "toutes" || search ? ` sur ${invoices.length} factures` : " au total"}
          </p>
        </div>

        {/* ── Cartes stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-brand-primary" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total facturé</span>
            </div>
            <p className="text-base font-black text-slate-800 tabular-nums">{formatAmount(stats.totalFacture)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total payé</span>
            </div>
            <p className="text-base font-black text-green-700 tabular-nums">{formatAmount(stats.totalPaye)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solde restant</span>
            </div>
            <p className="text-base font-black text-amber-700 tabular-nums">{formatAmount(stats.totalSolde)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-violet-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Impayées</span>
            </div>
            <p className="text-base font-black text-violet-700">{stats.nbImpayees}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{stats.nbEmises} émise{stats.nbEmises > 1 ? "s" : ""} sans acompte</p>
          </div>
        </div>

        {/* ── Barre recherche ──────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par référence, client, entreprise, WhatsApp…"
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Filtres tabs ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === tab.key
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[10px] font-black ${filter === tab.key ? "opacity-80" : "text-slate-400"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Contenu ─────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 px-6 py-12 text-center">
            <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-300">
              {invoices.length === 0 ? "Aucune facture" : "Aucun résultat"}
            </p>
            <p className="text-xs text-slate-300 mt-1">
              {invoices.length === 0
                ? "Les factures apparaissent ici après génération depuis une commande"
                : "Essayez un autre filtre ou terme de recherche"}
            </p>
          </div>
        ) : (
          <>
            {/* ── Mobile : cards ──────────────────────────────────────── */}
            <div className="sm:hidden space-y-3">
              {filtered.map((inv) => {
                const st      = STATUS_CONFIG[inv.status];
                const balance = inv.total - inv.paidAmount;
                const waLink  = buildWhatsAppLink(inv);
                const StatusIcon = st.icon;

                return (
                  <div key={inv.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-sm">{inv.reference}</p>
                        {inv.order && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Cmd : {inv.order.reference}</p>
                        )}
                        {inv.customer && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">{inv.customer.contactName}</p>
                        )}
                        {inv.customer?.companyName && (
                          <p className="text-[10px] text-slate-400 truncate">{inv.customer.companyName}</p>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${st.color}`}>
                          <StatusIcon className="w-3 h-3" /> {st.label}
                        </span>
                        <p className="text-[10px] text-slate-400">{formatDateShort(inv.issuedAt)}</p>
                      </div>
                    </div>

                    {/* Montants */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-50">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Total</p>
                        <p className="text-xs font-black text-slate-700 tabular-nums">{formatAmount(inv.total)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Payé</p>
                        <p className="text-xs font-black text-green-700 tabular-nums">
                          {inv.paidAmount > 0 ? formatAmount(inv.paidAmount) : <span className="text-slate-300">—</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Solde</p>
                        <p className={`text-xs font-black tabular-nums ${balance > 0 ? "text-amber-600" : "text-slate-300"}`}>
                          {balance > 0 ? formatAmount(balance) : "—"}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`/api/admin/commandes/${inv.orderId}/facture`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Télécharger PDF"
                        className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 flex items-center justify-center transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {inv.order && (
                        <Link
                          href={`/admin/commandes`}
                          title="Voir la commande"
                          className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      {inv.customer && (
                        <Link
                          href={`/admin/clients/${inv.customer.id}`}
                          title="Fiche client"
                          className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      {inv.customer?.whatsapp && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Envoyer WhatsApp"
                          className="w-9 h-9 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      {canEdit && inv.status !== "annulee" && inv.status !== "payee" && (
                        <button
                          onClick={() => setCancelingId(inv.id)}
                          title="Annuler la facture"
                          disabled={updatingId === inv.id}
                          className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors disabled:opacity-40"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Changement statut rapide */}
                    {canEdit && inv.status !== "annulee" && (
                      <div className="pt-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Statut
                        </label>
                        <select
                          value={inv.status}
                          disabled={updatingId === inv.id || isPending}
                          onChange={(e) => handleStatusChange(inv.id, e.target.value as InvoiceStatus)}
                          className="w-full h-9 px-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-brand-primary/50 transition-all disabled:opacity-50"
                        >
                          <option value="brouillon">Brouillon</option>
                          <option value="emise">Émise</option>
                          <option value="partiellement_payee">Partiellement payée</option>
                          <option value="payee">Payée</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Desktop : tableau ────────────────────────────────────── */}
            <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                      <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                      <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="text-center px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                      <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</th>
                      <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payé</th>
                      <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Solde</th>
                      <th className="text-center px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((inv) => {
                      const st      = STATUS_CONFIG[inv.status];
                      const balance = inv.total - inv.paidAmount;
                      const waLink  = buildWhatsAppLink(inv);
                      const StatusIcon = st.icon;

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-800">{inv.reference}</p>
                            {inv.order && (
                              <p className="text-[10px] text-slate-400 mt-0.5">Cmd : {inv.order.reference}</p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {inv.customer ? (
                              <div>
                                <p className="font-semibold text-slate-700">{inv.customer.contactName}</p>
                                {inv.customer.companyName && (
                                  <p className="text-[11px] text-slate-400">{inv.customer.companyName}</p>
                                )}
                                <p className="text-[11px] text-slate-400">{inv.customer.whatsapp}</p>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                            {formatDateShort(inv.issuedAt)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            {canEdit && inv.status !== "annulee" ? (
                              <select
                                value={inv.status}
                                disabled={updatingId === inv.id || isPending}
                                onChange={(e) => handleStatusChange(inv.id, e.target.value as InvoiceStatus)}
                                className={`h-7 px-2 rounded-lg border-0 text-[10px] font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-primary/30 disabled:opacity-50 ${st.color}`}
                              >
                                <option value="brouillon">Brouillon</option>
                                <option value="emise">Émise</option>
                                <option value="partiellement_payee">Part. payée</option>
                                <option value="payee">Payée</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${st.color}`}>
                                <StatusIcon className="w-3 h-3" /> {st.label}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right font-black text-slate-700 tabular-nums whitespace-nowrap">
                            {formatAmount(inv.total)}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums whitespace-nowrap">
                            {inv.paidAmount > 0 ? (
                              <span className="font-semibold text-green-700">{formatAmount(inv.paidAmount)}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums whitespace-nowrap">
                            {balance > 0 && inv.status !== "annulee" ? (
                              <span className="font-semibold text-amber-600">{formatAmount(balance)}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <a
                                href={`/api/admin/commandes/${inv.orderId}/facture`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Télécharger PDF"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                              {inv.order && (
                                <Link
                                  href="/admin/commandes"
                                  title="Voir la commande"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              )}
                              {inv.customer && (
                                <Link
                                  href={`/admin/clients/${inv.customer.id}`}
                                  title="Fiche client"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              )}
                              {inv.customer?.whatsapp && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Envoyer WhatsApp"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              )}
                              {canEdit && inv.status !== "annulee" && inv.status !== "payee" && (
                                <button
                                  onClick={() => setCancelingId(inv.id)}
                                  title="Annuler la facture"
                                  disabled={updatingId === inv.id}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-40"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
