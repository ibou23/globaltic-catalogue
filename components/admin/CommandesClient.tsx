"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, MessageCircle, Pencil, FileDown, CreditCard, Trash2, Receipt, Truck, CheckCircle2, Shield, Archive } from "lucide-react";
import type { OrderEnriched, AdminRole, OrderStatus, Invoice, QualityCheck, DeliveryStatus } from "@/lib/types/domain";
import { formatPrice, formatDateShort } from "@/lib/utils/format";
import { siteConfig } from "@/lib/config/site";
import { canPerform } from "@/lib/auth/permissions";
import { updateOrderAction } from "@/lib/actions/orders";
import { deleteOrderAction } from "@/lib/actions/maintenance";
import { CommandeEditForm } from "@/components/admin/CommandeEditForm";
import { ActiveFilterBadge } from "@/components/admin/ActiveFilterBadge";
import { QuickStatusSelect } from "@/components/admin/QuickStatusSelect";
import { QuickPaymentModal } from "@/components/admin/QuickPaymentModal";
import { ConfirmWithWord } from "@/components/admin/ConfirmWithWord";
import { QualityCheckModal, QCBadge } from "@/components/admin/QualityCheckModal";
import { DeliveryModal, DeliveryBadge } from "@/components/admin/DeliveryModal";
import { ClosureModal, ClosureBadge } from "@/components/admin/ClosureModal";
import { useRouter } from "next/navigation";

interface ActiveFilter {
  label: string;
  count: number;
  resetHref: string;
}

const INVOICE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  brouillon:           { label: "Brouillon",        color: "bg-slate-100 text-slate-500" },
  emise:               { label: "Émise",             color: "bg-violet-100 text-violet-700" },
  payee:               { label: "Payée",             color: "bg-green-100 text-green-700" },
  partiellement_payee: { label: "Partiel.",          color: "bg-amber-100 text-amber-700" },
  annulee:             { label: "Annulée",           color: "bg-red-100 text-red-500" },
};

interface CommandesClientProps {
  orders: OrderEnriched[];
  invoicesMap?: Map<string, Invoice>;
  qcMap?: Map<string, QualityCheck>;
  role: AdminRole;
  totalCount?: number;
  activeFilter?: ActiveFilter;
  canDelete?: boolean;
  canFacture?: boolean;
  canBL?: boolean;
  canSeeFinance?: boolean;
  googleReviewUrl?: string;
}

const STATUS_OPTIONS = [
  { value: "en_attente",       label: "En attente",       color: "bg-slate-100 text-slate-600" },
  { value: "confirmee",        label: "Confirmée",         color: "bg-blue-100 text-blue-600" },
  { value: "bat_en_cours",     label: "BAT en cours",      color: "bg-purple-100 text-purple-600" },
  { value: "bat_valide",       label: "BAT validé",        color: "bg-indigo-100 text-indigo-600" },
  { value: "en_production",    label: "En production",     color: "bg-amber-100 text-amber-600" },
  { value: "controle_qualite", label: "Contrôle qualité",  color: "bg-cyan-100 text-cyan-600" },
  { value: "pret",             label: "Prête",             color: "bg-emerald-100 text-emerald-600" },
  { value: "en_livraison",     label: "En livraison",      color: "bg-teal-100 text-teal-600" },
  { value: "livre",            label: "Livrée",            color: "bg-green-100 text-green-600" },
  { value: "annulee",          label: "Annulée",           color: "bg-red-100 text-red-600" },
];

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  non_paye:  { label: "Non payé",   color: "bg-red-100 text-red-600" },
  acompte:   { label: "Acompte",    color: "bg-amber-100 text-amber-600" },
  paye:      { label: "Payé",       color: "bg-green-100 text-green-600" },
  rembourse: { label: "Remboursé",  color: "bg-slate-100 text-slate-600" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  wave: "Wave", orange_money: "Orange Money", especes: "Espèces", virement: "Virement", cheque: "Chèque",
};


function buildWhatsAppMessage(order: OrderEnriched): string {
  const client = order.customer?.contactName ?? "client";
  const statusLabel = STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status;
  const lines = [
    `Bonjour *${client}*,`,
    ``,
    `Mise à jour de votre commande *${order.reference}* :`,
    `*Statut* : ${statusLabel}`,
    `*Montant total* : ${order.total.toLocaleString("fr-SN")} FCFA`,
    ``,
    `Merci pour votre confiance — *GLOBAL TIC*`,
  ];
  const whatsapp = order.customer?.whatsapp?.replace(/[^0-9]/g, "") ?? siteConfig.whatsapp;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function CommandesClient({ orders, invoicesMap = new Map(), qcMap = new Map(), role, totalCount, activeFilter, canDelete, canFacture, canBL, canSeeFinance = false, googleReviewUrl = "" }: CommandesClientProps) {
  const router = useRouter();
  const [editingOrder, setEditingOrder] = useState<OrderEnriched | null>(null);
  const [payingOrder, setPayingOrder] = useState<OrderEnriched | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderEnriched | null>(null);
  const [qcOrder, setQcOrder]           = useState<OrderEnriched | null>(null);
  const [deliveryOrder, setDeliveryOrder] = useState<OrderEnriched | null>(null);
  const [closureOrder, setClosureOrder] = useState<OrderEnriched | null>(null);
  const [isPending, startTransition]    = useTransition();
  const canEdit = canPerform(role, "commande:edit_status");
  const canPay = canPerform(role, "commande:edit_payment");
  const canReceipt = canPerform(role, "receipt:generate");

  function handleQuickStatus(order: OrderEnriched, status: string) {
    return new Promise<{ error?: string | null }>((resolve) => {
      startTransition(async () => {
        const result = await updateOrderAction(order.id, {
          status: status as OrderStatus,
          payment_status: order.paymentStatus,
          paid_amount: order.paidAmount,
          payment_method: order.paymentMethod,
          payment_reference: order.paymentReference,
          payment_note: order.paymentNote,
          delivery_method: order.deliveryMethod,
          delivery_address: order.deliveryAddress,
          estimated_delivery: order.estimatedDelivery,
          actual_delivery: order.actualDelivery,
          notes: order.notes,
          internal_notes: order.internalNotes,
        });
        if (!result.error) router.refresh();
        resolve({ error: result.error });
      });
    });
  }

  async function handleDeleteOrder(confirmation: string) {
    if (!deletingOrder) return { error: "Aucune commande sélectionnée" };
    const result = await deleteOrderAction({ orderId: deletingOrder.id, confirmation });
    if (!result.error) router.refresh();
    return { error: result.error };
  }

  return (
    <>
      {editingOrder && (
        <CommandeEditForm order={editingOrder} role={role} onClose={() => { setEditingOrder(null); router.refresh(); }} />
      )}
      {payingOrder && (
        <QuickPaymentModal order={payingOrder} onClose={() => { setPayingOrder(null); router.refresh(); }} />
      )}
      {deletingOrder && (
        <ConfirmWithWord
          title="Supprimer la commande"
          description={`Supprimer définitivement la commande ${deletingOrder.reference}, ses fichiers et son historique de paiement.`}
          warning="Tous les fichiers Storage liés seront aussi supprimés. Cette action est irréversible."
          onConfirm={handleDeleteOrder}
          onClose={() => setDeletingOrder(null)}
        />
      )}
      {qcOrder && (
        <QualityCheckModal
          order={qcOrder}
          qc={qcMap.get(qcOrder.id) ?? null}
          role={role}
          canSeeFinance={canSeeFinance}
          onClose={() => { setQcOrder(null); router.refresh(); }}
        />
      )}
      {deliveryOrder && (
        <DeliveryModal
          order={deliveryOrder}
          role={role}
          onClose={() => { setDeliveryOrder(null); router.refresh(); }}
        />
      )}
      {closureOrder && (
        <ClosureModal
          order={closureOrder}
          role={role}
          googleReviewUrl={googleReviewUrl}
          onClose={() => { setClosureOrder(null); router.refresh(); }}
        />
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
                const payment = PAYMENT_LABELS[order.paymentStatus] ?? { label: order.paymentStatus, color: "bg-slate-100 text-slate-600" };
                const balance = order.total - order.paidAmount;
                const waLink = buildWhatsAppMessage(order);
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-slate-800 text-sm">{order.reference}</p>
                          {invoicesMap.has(order.id) && (() => {
                            const inv = invoicesMap.get(order.id)!;
                            const s = INVOICE_STATUS_LABELS[inv.status] ?? INVOICE_STATUS_LABELS.emise;
                            return (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${s.color}`}>
                                <CheckCircle2 className="w-2.5 h-2.5" /> {s.label}
                              </span>
                            );
                          })()}
                          {qcMap.has(order.id) && (
                            <QCBadge status={qcMap.get(order.id)!.status} />
                          )}
                          {order.deliveryStatus && order.deliveryStatus !== "non_planifiee" && (
                            <DeliveryBadge status={order.deliveryStatus as DeliveryStatus} />
                          )}
                          <ClosureBadge status={order.closureStatus} />
                        </div>
                        {order.customer && (
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{order.customer.contactName}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatDateShort(order.createdAt)}</p>
                      </div>
                      {canEdit ? (
                        <QuickStatusSelect
                          current={order.status}
                          options={STATUS_OPTIONS}
                          onSelect={(s) => handleQuickStatus(order, s)}
                          disabled={isPending}
                        />
                      ) : (
                        <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_OPTIONS.find((s) => s.value === order.status)?.color ?? "bg-slate-100 text-slate-600"}`}>
                          {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
                        </span>
                      )}
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
                      <button
                        onClick={() => setQcOrder(order)}
                        title="Contrôle qualité"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                          qcMap.get(order.id)?.status === "valide"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : qcMap.get(order.id)?.status === "a_corriger"
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-cyan-100 text-cyan-600 hover:bg-cyan-200"
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeliveryOrder(order)}
                        title="Gestion livraison"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                          order.deliveryStatus === "livree"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : order.deliveryStatus === "echec"
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : order.deliveryStatus === "en_cours"
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "bg-teal-100 text-teal-600 hover:bg-teal-200"
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setClosureOrder(order)}
                        title="Clôture &amp; satisfaction"
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                          order.closureStatus === "satisfait"
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : order.closureStatus === "reclamation"
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : order.closureStatus === "cloturee"
                            ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            : "bg-violet-100 text-violet-600 hover:bg-violet-200"
                        }`}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      {canPay && order.paymentStatus !== "paye" && order.paymentStatus !== "rembourse" && (
                        <button
                          onClick={() => setPayingOrder(order)}
                          className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex items-center justify-center transition-colors shrink-0"
                          title="Ajouter un paiement"
                        >
                          <CreditCard className="w-4 h-4" />
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
                      {canFacture && (
                        <a
                          href={`/api/admin/commandes/${order.id}/facture`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 hover:bg-violet-200 flex items-center justify-center transition-colors shrink-0"
                          title="Facture PDF"
                        >
                          <Receipt className="w-4 h-4" />
                        </a>
                      )}
                      {canBL && (
                        <a
                          href={`/api/admin/commandes/${order.id}/bon-livraison`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 hover:bg-teal-200 flex items-center justify-center transition-colors shrink-0"
                          title="Bon de livraison PDF"
                        >
                          <Truck className="w-4 h-4" />
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
                      {canDelete && (
                        <button
                          onClick={() => setDeletingOrder(order)}
                          className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors shrink-0"
                          title="Supprimer la commande (patron)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                      const payment = PAYMENT_LABELS[order.paymentStatus] ?? { label: order.paymentStatus, color: "bg-slate-100 text-slate-600" };
                      const balance = order.total - order.paidAmount;
                      const waLink = buildWhatsAppMessage(order);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-700">{order.reference}</span>
                            {order.quoteId && (
                              <p className="text-[10px] text-slate-400 mt-0.5">via devis</p>
                            )}
                            {invoicesMap.has(order.id) && (() => {
                              const inv = invoicesMap.get(order.id)!;
                              const s = INVOICE_STATUS_LABELS[inv.status] ?? INVOICE_STATUS_LABELS.emise;
                              return (
                                <span className={`mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${s.color}`}>
                                  <CheckCircle2 className="w-2.5 h-2.5" /> {inv.reference}
                                </span>
                              );
                            })()}
                            {qcMap.has(order.id) && (
                              <div className="mt-1">
                                <QCBadge status={qcMap.get(order.id)!.status} />
                              </div>
                            )}
                            {order.deliveryStatus && order.deliveryStatus !== "non_planifiee" && (
                              <div className="mt-1">
                                <DeliveryBadge status={order.deliveryStatus as DeliveryStatus} />
                              </div>
                            )}
                            {order.closureStatus !== "non_cloturee" && (
                              <div className="mt-1">
                                <ClosureBadge status={order.closureStatus} />
                              </div>
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
                            {canEdit ? (
                              <QuickStatusSelect
                                current={order.status}
                                options={STATUS_OPTIONS}
                                onSelect={(s) => handleQuickStatus(order, s)}
                                disabled={isPending}
                              />
                            ) : (
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_OPTIONS.find((s) => s.value === order.status)?.color ?? "bg-slate-100 text-slate-600"}`}>
                                {STATUS_OPTIONS.find((s) => s.value === order.status)?.label ?? order.status}
                              </span>
                            )}
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
                            <div className="flex items-center justify-center gap-1.5">
                              {canEdit && (
                                <button
                                  onClick={() => setEditingOrder(order)}
                                  title="Modifier la commande"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => setQcOrder(order)}
                                title="Contrôle qualité"
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                                  qcMap.get(order.id)?.status === "valide"
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : qcMap.get(order.id)?.status === "a_corriger"
                                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                                    : "bg-cyan-100 text-cyan-600 hover:bg-cyan-200"
                                }`}
                              >
                                <Shield className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeliveryOrder(order)}
                                title="Gestion livraison"
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                                  order.deliveryStatus === "livree"
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : order.deliveryStatus === "echec"
                                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                                    : order.deliveryStatus === "en_cours"
                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                    : "bg-teal-100 text-teal-600 hover:bg-teal-200"
                                }`}
                              >
                                <Truck className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setClosureOrder(order)}
                                title="Clôture &amp; satisfaction"
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                                  order.closureStatus === "satisfait"
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : order.closureStatus === "reclamation"
                                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                                    : order.closureStatus === "cloturee"
                                    ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    : "bg-violet-100 text-violet-600 hover:bg-violet-200"
                                }`}
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              {canPay && order.paymentStatus !== "paye" && order.paymentStatus !== "rembourse" && (
                                <button
                                  onClick={() => setPayingOrder(order)}
                                  title="Ajouter un paiement"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                                >
                                  <CreditCard className="w-4 h-4" />
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
                              {canFacture && (
                                <a
                                  href={`/api/admin/commandes/${order.id}/facture`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Télécharger la facture PDF"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors"
                                >
                                  <Receipt className="w-4 h-4" />
                                </a>
                              )}
                              {canBL && (
                                <a
                                  href={`/api/admin/commandes/${order.id}/bon-livraison`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Télécharger le bon de livraison PDF"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
                                >
                                  <Truck className="w-4 h-4" />
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
                              {canDelete && (
                                <button
                                  onClick={() => setDeletingOrder(order)}
                                  title="Supprimer la commande (patron)"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
