"use client";

import { useState } from "react";
import { ShoppingCart, MessageCircle, Pencil, FileDown } from "lucide-react";
import type { OrderEnriched, AdminRole } from "@/lib/types/domain";
import { formatPrice, formatDateShort } from "@/lib/utils/format";
import { siteConfig } from "@/lib/config/site";
import { canPerform } from "@/lib/auth/permissions";
import { CommandeEditForm } from "@/components/admin/CommandeEditForm";
import { ActiveFilterBadge } from "@/components/admin/ActiveFilterBadge";

interface ActiveFilter {
  label: string;
  count: number;
  resetHref: string;
}

interface CommandesClientProps {
  orders: OrderEnriched[];
  role: AdminRole;
  totalCount?: number;
  activeFilter?: ActiveFilter;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  en_attente:       { label: "En attente",       color: "bg-slate-100 text-slate-600" },
  confirmee:        { label: "Confirmée",         color: "bg-blue-100 text-blue-600" },
  bat_en_cours:     { label: "BAT en cours",      color: "bg-purple-100 text-purple-600" },
  bat_valide:       { label: "BAT validé",        color: "bg-indigo-100 text-indigo-600" },
  en_production:    { label: "En production",     color: "bg-amber-100 text-amber-600" },
  controle_qualite: { label: "Contrôle qualité",  color: "bg-cyan-100 text-cyan-600" },
  pret:             { label: "Prête",             color: "bg-emerald-100 text-emerald-600" },
  en_livraison:     { label: "En livraison",      color: "bg-teal-100 text-teal-600" },
  livre:            { label: "Livrée",            color: "bg-green-100 text-green-600" },
  annulee:          { label: "Annulée",           color: "bg-red-100 text-red-600" },
};

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  non_paye:  { label: "Non payé",   color: "bg-red-100 text-red-600" },
  acompte:   { label: "Acompte",    color: "bg-amber-100 text-amber-600" },
  paye:      { label: "Payé",       color: "bg-green-100 text-green-600" },
  rembourse: { label: "Remboursé",  color: "bg-slate-100 text-slate-600" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  wave:         "Wave",
  orange_money: "Orange Money",
  especes:      "Espèces",
  virement:     "Virement",
  cheque:       "Chèque",
};

function buildWhatsAppConfirmation(order: OrderEnriched): string {
  const client = order.customer?.contactName ?? "client";
  const lines = [
    `Bonjour *${client}*,`,
    ``,
    `Nous avons bien enregistré votre commande.`,
    ``,
    `*Référence commande* : ${order.reference}`,
    `*Montant total* : ${order.total.toLocaleString("fr-SN")} FCFA`,
    order.notes ? `*Notes* : ${order.notes}` : null,
    ``,
    `Notre équipe vous contactera prochainement pour les prochaines étapes (BAT, délais de production).`,
    ``,
    `Merci pour votre confiance — *GLOBAL TIC*`,
  ].filter((l): l is string => l !== null);

  const whatsapp =
    order.customer?.whatsapp?.replace(/[^0-9]/g, "") ?? siteConfig.whatsapp;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function CommandesClient({ orders, role, totalCount, activeFilter }: CommandesClientProps) {
  const [editingOrder, setEditingOrder] = useState<OrderEnriched | null>(null);
  const canEdit = canPerform(role, "commande:edit_status");
  const canReceipt = canPerform(role, "receipt:generate");

  return (
    <>
      {editingOrder && (
        <CommandeEditForm order={editingOrder} role={role} onClose={() => setEditingOrder(null)} />
      )}
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">
            Gestion des commandes
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {activeFilter
              ? `${orders.length} résultat${orders.length > 1 ? "s" : ""} sur ${totalCount ?? orders.length} commandes`
              : `${orders.length} commande${orders.length > 1 ? "s" : ""} au total`}
          </p>
        </div>

        {activeFilter && (
          <ActiveFilterBadge
            label={activeFilter.label}
            count={activeFilter.count}
            resetHref={activeFilter.resetHref}
          />
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 px-6 py-12 text-center">
            <ShoppingCart className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-300">Aucune commande</p>
            <p className="text-xs text-slate-300 mt-1">
              Les commandes apparaissent ici après conversion d&apos;un devis accepté
            </p>
          </div>
        ) : (
          <>
            {/* ── Vue mobile : cards ── */}
            <div className="sm:hidden space-y-3">
              {orders.map((order) => {
                const status = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-slate-100 text-slate-600" };
                const payment = PAYMENT_LABELS[order.paymentStatus] ?? { label: order.paymentStatus, color: "bg-slate-100 text-slate-600" };
                const balance = order.total - order.paidAmount;
                const waLink = buildWhatsAppConfirmation(order);
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                    {/* Header card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-sm">{order.reference}</p>
                        {order.customer && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{order.customer.contactName}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDateShort(order.createdAt)}</p>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Finance */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div>
                        <p className="text-xs font-black text-slate-700 tabular-nums">{formatPrice(order.total)}</p>
                        {balance > 0 && order.paymentStatus !== "rembourse" && (
                          <p className="text-[10px] text-amber-600 font-semibold tabular-nums">
                            Solde : {balance.toLocaleString("fr-SN")} FCFA
                          </p>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${payment.color}`}>
                        {payment.label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {canEdit && (
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Modifier
                        </button>
                      )}
                      {canReceipt && order.paidAmount > 0 && (
                        <a
                          href={`/api/admin/commandes/${order.id}/receipt`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center transition-colors shrink-0"
                          title="Reçu PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </a>
                      )}
                      {order.customer && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors shrink-0"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Vue desktop : tableau ── */}
            <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                      <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                      <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                      <th className="text-right px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Montant</th>
                      <th className="text-right px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paiement</th>
                      <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orders.map((order) => {
                      const status = STATUS_LABELS[order.status] ?? { label: order.status, color: "bg-slate-100 text-slate-600" };
                      const payment = PAYMENT_LABELS[order.paymentStatus] ?? { label: order.paymentStatus, color: "bg-slate-100 text-slate-600" };
                      const balance = order.total - order.paidAmount;
                      const waLink = buildWhatsAppConfirmation(order);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-700">{order.reference}</span>
                            {order.quoteId && (
                              <p className="text-[10px] text-slate-400 mt-0.5">via devis</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {order.customer ? (
                              <div>
                                <p className="font-semibold text-slate-700">{order.customer.contactName}</p>
                                {order.customer.companyName && (
                                  <p className="text-xs text-slate-400">{order.customer.companyName}</p>
                                )}
                                <p className="text-xs text-slate-400">{order.customer.whatsapp}</p>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            {formatDateShort(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-black text-slate-700 tabular-nums">{formatPrice(order.total)}</p>
                            {balance > 0 && order.paymentStatus !== "rembourse" && (
                              <p className="text-[10px] text-amber-600 font-semibold mt-0.5 tabular-nums">
                                Solde : {balance.toLocaleString("fr-SN")} FCFA
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${payment.color}`}>
                              {payment.label}
                            </span>
                            {order.paymentMethod && (
                              <p className="text-[10px] text-slate-400 mt-1">
                                {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                              </p>
                            )}
                            {order.lastPaymentAt && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {formatDateShort(order.lastPaymentAt)}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {canEdit && (
                                <button
                                  onClick={() => setEditingOrder(order)}
                                  title="Modifier la commande"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}
                              {canReceipt && order.paidAmount > 0 && (
                                <a
                                  href={`/api/admin/commandes/${order.id}/receipt`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Télécharger le reçu PDF"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                >
                                  <FileDown className="w-4 h-4" />
                                </a>
                              )}
                              {order.customer && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Envoyer un message WhatsApp"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
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
