"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertCircle,
  MessageCircle,
  Truck,
  FileText,
  Plus,
  Search,
  X,
  ExternalLink,
  Wallet,
  Clock,
} from "lucide-react";
import type { ImpayeRow } from "@/lib/db/impayes";
import type { AdminProfile, AdminRole, InvoiceStatus } from "@/lib/types/domain";
import { formatDateShort } from "@/lib/utils/format";
import { TaskForm } from "@/components/admin/TaskForm";

// ─── Constantes ──────────────────────────────────────────────────────────────

const INVOICE_STATUS_LABELS: Partial<Record<InvoiceStatus, { label: string; color: string }>> = {
  brouillon:           { label: "Brouillon",   color: "bg-slate-100 text-slate-500" },
  emise:               { label: "Émise",        color: "bg-violet-100 text-violet-700" },
  partiellement_payee: { label: "Part. payée",  color: "bg-amber-100 text-amber-700" },
};

function formatAmount(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}

function buildWaRelanceDouce(row: ImpayeRow): string {
  if (!row.customerWhatsapp) return "#";
  const phone = row.customerWhatsapp.replace(/\D/g, "");
  const lines = [
    `Bonjour *${row.customerName ?? "client"}*,`,
    ``,
    `Nous vous rappelons que le solde restant de votre commande *${row.orderRef}* est de *${formatAmount(row.balance)}*.`,
    ``,
    `Merci de nous confirmer le règlement afin de finaliser le suivi de votre dossier.`,
    ``,
    `*GLOBAL TIC*`,
  ];
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function buildWaRelanceLivraison(row: ImpayeRow): string {
  if (!row.customerWhatsapp) return "#";
  const phone = row.customerWhatsapp.replace(/\D/g, "");
  const lines = [
    `Bonjour *${row.customerName ?? "client"}*,`,
    ``,
    `Votre commande *${row.orderRef}* a bien été livrée.`,
    ``,
    `Il reste un solde de *${formatAmount(row.balance)}* à régler.`,
    ``,
    `Merci de procéder au paiement du solde restant.`,
    ``,
    `*GLOBAL TIC*`,
  ];
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImpayesClientProps {
  rows:          ImpayeRow[];
  adminProfiles: AdminProfile[];
  role:          AdminRole;
  canCreateTask: boolean;
}

type FilterKey = "tous" | "invoice" | "order_only" | "haute_valeur";

// ─── Composant ───────────────────────────────────────────────────────────────

export function ImpayesClient({ rows, adminProfiles, canCreateTask }: ImpayesClientProps) {
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState<FilterKey>("tous");
  const [taskFor,     setTaskFor]     = useState<ImpayeRow | null>(null);
  const [waMenu,      setWaMenu]      = useState<string | null>(null); // orderId du menu ouvert

  // Stats globales
  const totalBalance      = rows.reduce((s, r) => s + r.balance, 0);
  const nbInvoiceUnpaid   = rows.filter((r) => r.type === "invoice").length;
  const nbDeliveredUnpaid = rows.filter((r) => r.type === "order_only").length;
  const nbTotal           = rows.length;

  // Filtrage + recherche
  const filtered = useMemo(() => {
    let list = rows;

    if (filter === "invoice")    list = list.filter((r) => r.type === "invoice");
    if (filter === "order_only") list = list.filter((r) => r.type === "order_only");
    if (filter === "haute_valeur") list = list.filter((r) => r.balance >= 100_000);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) =>
        (r.invoiceRef ?? "").toLowerCase().includes(q) ||
        r.orderRef.toLowerCase().includes(q) ||
        (r.customerName ?? "").toLowerCase().includes(q) ||
        (r.customerCompany ?? "").toLowerCase().includes(q) ||
        (r.customerWhatsapp ?? "").replace(/\D/g, "").includes(q.replace(/\D/g, ""))
      );
    }
    return list;
  }, [rows, filter, search]);

  const filterTabs: { key: FilterKey; label: string; count?: number }[] = [
    { key: "tous",         label: "Tous",              count: nbTotal },
    { key: "invoice",      label: "Avec facture",      count: nbInvoiceUnpaid },
    { key: "order_only",   label: "Livrés sans facture", count: nbDeliveredUnpaid },
    { key: "haute_valeur", label: "≥ 100 000 FCFA" },
  ];

  return (
    <>
      {/* Modale TaskForm */}
      {taskFor && (
        <TaskForm
          adminProfiles={adminProfiles}
          prefill={{
            customerId: taskFor.customerId ?? undefined,
            orderId:    taskFor.orderId,
            taskType:   "relancer_paiement",
            title:      `Relancer paiement — ${taskFor.orderRef} (${formatAmount(taskFor.balance)})`,
          }}
          onClose={() => setTaskFor(null)}
        />
      )}

      <div className="space-y-4 sm:space-y-6">

        {/* En-tête */}
        <div>
          <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">
            Impayés & Relances
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {filtered.length} dossier{filtered.length > 1 ? "s" : ""}
            {filter !== "tous" || search ? ` sur ${nbTotal}` : " avec solde restant"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total à encaisser</span>
            </div>
            <p className="text-base font-black text-amber-700 tabular-nums">{formatAmount(totalBalance)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-violet-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Factures impayées</span>
            </div>
            <p className="text-base font-black text-violet-700">{nbInvoiceUnpaid}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-teal-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Livrés non soldés</span>
            </div>
            <p className="text-base font-black text-teal-700">{nbDeliveredUnpaid}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total dossiers</span>
            </div>
            <p className="text-base font-black text-slate-800">{nbTotal}</p>
          </div>
        </div>

        {/* Barre recherche */}
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
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtres */}
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

        {/* Liste */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 px-6 py-12 text-center">
            <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-300">
              {rows.length === 0 ? "Aucun impayé" : "Aucun résultat"}
            </p>
            <p className="text-xs text-slate-300 mt-1">
              {rows.length === 0
                ? "Tous les soldes sont réglés"
                : "Essayez un autre filtre ou terme de recherche"}
            </p>
          </div>
        ) : (
          <>
            {/* ── Mobile : cards ──────────────────────────────────────── */}
            <div className="sm:hidden space-y-3">
              {filtered.map((row) => {
                const invSt = row.invoiceStatus ? INVOICE_STATUS_LABELS[row.invoiceStatus] : null;
                const isDelivered = row.orderStatus === "livre";
                return (
                  <div key={row.orderId} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {row.invoiceRef && (
                          <p className="font-black text-slate-800 text-sm">{row.invoiceRef}</p>
                        )}
                        <p className={`text-xs ${row.invoiceRef ? "text-slate-400" : "font-black text-slate-800"}`}>
                          Cmd : {row.orderRef}
                        </p>
                        {row.customerName && (
                          <p className="text-xs text-slate-600 mt-0.5 truncate">{row.customerName}</p>
                        )}
                        {row.customerCompany && (
                          <p className="text-[10px] text-slate-400 truncate">{row.customerCompany}</p>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        {invSt && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${invSt.color}`}>
                            {invSt.label}
                          </span>
                        )}
                        {isDelivered && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700">
                            <Truck className="w-2.5 h-2.5" /> Livré
                          </span>
                        )}
                        {row.invoiceIssuedAt && (
                          <p className="text-[10px] text-slate-400">{formatDateShort(row.invoiceIssuedAt)}</p>
                        )}
                      </div>
                    </div>

                    {/* Montants */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-50">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Total</p>
                        <p className="text-xs font-black text-slate-700 tabular-nums">{formatAmount(row.total)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Payé</p>
                        <p className="text-xs font-black text-green-700 tabular-nums">
                          {row.paidAmount > 0 ? formatAmount(row.paidAmount) : <span className="text-slate-300">—</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Solde</p>
                        <p className="text-xs font-black text-amber-600 tabular-nums">{formatAmount(row.balance)}</p>
                      </div>
                    </div>

                    {/* Dernier paiement */}
                    {row.lastPaymentAt && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Dernier paiement : {formatDateShort(row.lastPaymentAt)}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* WhatsApp avec menu */}
                      {row.customerWhatsapp && (
                        <div className="relative">
                          <button
                            onClick={() => setWaMenu(waMenu === row.orderId ? null : row.orderId)}
                            className="w-9 h-9 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                            title="Envoyer WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          {waMenu === row.orderId && (
                            <div className="absolute bottom-10 left-0 z-20 bg-white rounded-xl shadow-xl border border-slate-100 py-1 w-52">
                              <a
                                href={buildWaRelanceDouce(row)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setWaMenu(null)}
                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                Relance douce
                              </a>
                              <a
                                href={buildWaRelanceLivraison(row)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setWaMenu(null)}
                                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Truck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                                Après livraison
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PDF facture */}
                      {row.invoiceId && (
                        <a
                          href={`/api/admin/commandes/${row.orderId}/facture`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Télécharger PDF facture"
                          className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 hover:bg-violet-200 flex items-center justify-center transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </a>
                      )}

                      {/* Lien commande */}
                      <Link
                        href="/admin/commandes"
                        title="Voir la commande"
                        className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {/* Fiche client */}
                      {row.customerId && (
                        <Link
                          href={`/admin/clients/${row.customerId}`}
                          title="Fiche client"
                          className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {/* Créer tâche de relance */}
                      {canCreateTask && (
                        <button
                          onClick={() => setTaskFor(row)}
                          title="Créer tâche de relance"
                          className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop : tableau ─────────────────────────────────────── */}
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
                    {filtered.map((row) => {
                      const invSt      = row.invoiceStatus ? INVOICE_STATUS_LABELS[row.invoiceStatus] : null;
                      const isDelivered = row.orderStatus === "livre";
                      return (
                        <tr key={row.orderId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4">
                            {row.invoiceRef && (
                              <p className="font-bold text-slate-800">{row.invoiceRef}</p>
                            )}
                            <p className={`text-xs ${row.invoiceRef ? "text-slate-400 mt-0.5" : "font-bold text-slate-800"}`}>
                              Cmd : {row.orderRef}
                            </p>
                            {row.lastPaymentAt && (
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 shrink-0" />
                                {formatDateShort(row.lastPaymentAt)}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {row.customerName ? (
                              <div>
                                <p className="font-semibold text-slate-700">{row.customerName}</p>
                                {row.customerCompany && <p className="text-[11px] text-slate-400">{row.customerCompany}</p>}
                                {row.customerWhatsapp && <p className="text-[11px] text-slate-400">{row.customerWhatsapp}</p>}
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                            {row.invoiceIssuedAt ? formatDateShort(row.invoiceIssuedAt) : "—"}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {invSt && (
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${invSt.color}`}>
                                  {invSt.label}
                                </span>
                              )}
                              {isDelivered && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-100 text-teal-700">
                                  <Truck className="w-3 h-3" /> Livré
                                </span>
                              )}
                              {!invSt && !isDelivered && (
                                <span className="text-slate-300 text-xs">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right font-black text-slate-700 tabular-nums whitespace-nowrap">
                            {formatAmount(row.total)}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums whitespace-nowrap">
                            {row.paidAmount > 0 ? (
                              <span className="font-semibold text-green-700">{formatAmount(row.paidAmount)}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums whitespace-nowrap">
                            <span className="font-black text-amber-600">{formatAmount(row.balance)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* WhatsApp menu */}
                              {row.customerWhatsapp && (
                                <div className="relative">
                                  <button
                                    onClick={() => setWaMenu(waMenu === row.orderId ? null : row.orderId)}
                                    title="Envoyer WhatsApp"
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </button>
                                  {waMenu === row.orderId && (
                                    <div className="absolute right-0 top-9 z-20 bg-white rounded-xl shadow-xl border border-slate-100 py-1 w-48">
                                      <a
                                        href={buildWaRelanceDouce(row)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setWaMenu(null)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                        Relance douce
                                      </a>
                                      <a
                                        href={buildWaRelanceLivraison(row)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setWaMenu(null)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                      >
                                        <Truck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                                        Après livraison
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* PDF facture */}
                              {row.invoiceId && (
                                <a
                                  href={`/api/admin/commandes/${row.orderId}/facture`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Télécharger PDF facture"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors"
                                >
                                  <FileText className="w-4 h-4" />
                                </a>
                              )}

                              {/* Lien commande */}
                              <Link
                                href="/admin/commandes"
                                title="Voir la commande"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              {/* Fiche client */}
                              {row.customerId && (
                                <Link
                                  href={`/admin/clients/${row.customerId}`}
                                  title="Fiche client"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              )}

                              {/* Créer tâche de relance */}
                              {canCreateTask && (
                                <button
                                  onClick={() => setTaskFor(row)}
                                  title="Créer tâche de relance paiement"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
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
