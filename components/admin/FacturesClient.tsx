"use client";

import { FileText } from "lucide-react";
import type { InvoiceEnriched, AdminRole, InvoiceStatus } from "@/lib/types/domain";
import { formatDateShort } from "@/lib/utils/format";

const STATUS_LABELS: Record<InvoiceStatus, { label: string; color: string }> = {
  brouillon:           { label: "Brouillon",        color: "bg-slate-100 text-slate-500" },
  emise:               { label: "Émise",             color: "bg-violet-100 text-violet-700" },
  payee:               { label: "Payée",             color: "bg-green-100 text-green-700" },
  partiellement_payee: { label: "Part. payée",       color: "bg-amber-100 text-amber-700" },
  annulee:             { label: "Annulée",           color: "bg-red-100 text-red-500" },
};

function formatAmount(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}

interface FacturesClientProps {
  invoices: InvoiceEnriched[];
  role: AdminRole;
}

export function FacturesClient({ invoices }: FacturesClientProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">Factures</h2>
        <p className="text-sm text-slate-400 font-medium mt-1">
          {invoices.length} facture{invoices.length > 1 ? "s" : ""} enregistrée{invoices.length > 1 ? "s" : ""}
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 px-6 py-12 text-center">
          <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-300">Aucune facture</p>
          <p className="text-xs text-slate-300 mt-1">
            Les factures apparaissent ici après génération depuis une commande
          </p>
        </div>
      ) : (
        <>
          {/* Mobile */}
          <div className="sm:hidden space-y-3">
            {invoices.map((inv) => {
              const st = STATUS_LABELS[inv.status] ?? STATUS_LABELS.emise;
              const balance = inv.total - inv.paidAmount;
              return (
                <div key={inv.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-slate-800 text-sm">{inv.reference}</p>
                      {inv.order && <p className="text-[10px] text-slate-400">Cmd : {inv.order.reference}</p>}
                      {inv.customer && <p className="text-xs text-slate-500 truncate">{inv.customer.contactName}</p>}
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <p className="text-xs font-black text-slate-700">{formatAmount(inv.total)}</p>
                    <p className="text-[10px] text-slate-400">{formatDateShort(inv.issuedAt)}</p>
                  </div>
                  {balance > 0 && inv.status !== "annulee" && (
                    <p className="text-[10px] text-amber-600 font-semibold">Solde : {formatAmount(balance)}</p>
                  )}
                  <a
                    href={`/api/admin/commandes/${inv.orderId}/facture`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 text-xs font-bold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Télécharger
                  </a>
                </div>
              );
            })}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Commande</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                    <th className="text-right px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</th>
                    <th className="text-right px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payé</th>
                    <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map((inv) => {
                    const st = STATUS_LABELS[inv.status] ?? STATUS_LABELS.emise;
                    const balance = inv.total - inv.paidAmount;
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{inv.reference}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{inv.order?.reference ?? "—"}</td>
                        <td className="px-6 py-4">
                          {inv.customer ? (
                            <div>
                              <p className="font-semibold text-slate-700">{inv.customer.contactName}</p>
                              {inv.customer.companyName && <p className="text-xs text-slate-400">{inv.customer.companyName}</p>}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(inv.issuedAt)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-700 tabular-nums">
                          {formatAmount(inv.total)}
                          {balance > 0 && inv.status !== "annulee" && (
                            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Solde : {formatAmount(balance)}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums text-slate-600">
                          {inv.paidAmount > 0 ? formatAmount(inv.paidAmount) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <a
                            href={`/api/admin/commandes/${inv.orderId}/facture`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Télécharger la facture PDF"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
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
  );
}
