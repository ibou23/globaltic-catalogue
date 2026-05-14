"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Trash2, Bell, AlertTriangle, Loader2, CheckCircle2, ChevronRight,
  FileText, ShoppingCart, Users,
} from "lucide-react";
import { ConfirmWithWord } from "@/components/admin/ConfirmWithWord";
import { purgeReadNotificationsAction } from "@/lib/actions/maintenance";
import type { Customer, QuoteEnriched, OrderEnriched } from "@/lib/types/domain";
import { formatDateShort, formatPrice } from "@/lib/utils/format";
import { deleteQuoteAction, deleteOrderAction, deleteCustomerAction } from "@/lib/actions/maintenance";

interface MaintenanceStats {
  readNotifications: number;
  totalQuotes: number;
  totalOrders: number;
  totalCustomers: number;
}

interface MaintenanceClientProps {
  stats: MaintenanceStats;
  quotes: QuoteEnriched[];
  orders: OrderEnriched[];
  customers: Customer[];
}

const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon", envoye: "Envoyé", accepte: "Accepté", refuse: "Refusé", expire: "Expiré",
  en_attente: "En attente", confirmee: "Confirmée", bat_en_cours: "BAT en cours",
  bat_valide: "BAT validé", en_production: "En production", controle_qualite: "Contrôle qualité",
  pret: "Prête", en_livraison: "En livraison", livre: "Livrée", annulee: "Annulée",
};

export function MaintenanceClient({ stats, quotes, orders, customers }: MaintenanceClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);
  const [purgeError, setPurgeError] = useState<string | null>(null);

  const [deletingQuote, setDeletingQuote] = useState<QuoteEnriched | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OrderEnriched | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  function handlePurgeNotifications() {
    setPurgeSuccess(null);
    setPurgeError(null);
    startTransition(async () => {
      const result = await purgeReadNotificationsAction();
      if (result.error) {
        setPurgeError(result.error);
      } else {
        setPurgeSuccess(`${result.data} notification${(result.data ?? 0) > 1 ? "s" : ""} supprimée${(result.data ?? 0) > 1 ? "s" : ""}`);
        router.refresh();
      }
    });
  }

  async function handleDeleteQuote(confirmation: string) {
    if (!deletingQuote) return { error: "Aucun devis sélectionné" };
    const result = await deleteQuoteAction({ quoteId: deletingQuote.id, confirmation });
    if (!result.error) router.refresh();
    return { error: result.error };
  }

  async function handleDeleteOrder(confirmation: string) {
    if (!deletingOrder) return { error: "Aucune commande sélectionnée" };
    const result = await deleteOrderAction({ orderId: deletingOrder.id, confirmation });
    if (!result.error) router.refresh();
    return { error: result.error };
  }

  async function handleDeleteCustomer(confirmation: string) {
    if (!deletingCustomer) return { error: "Aucun client sélectionné" };
    const result = await deleteCustomerAction({ customerId: deletingCustomer.id, confirmation });
    if (!result.error) router.refresh();
    return { error: result.error };
  }

  return (
    <>
      {deletingQuote && (
        <ConfirmWithWord
          title="Supprimer le devis"
          description={`Supprimer définitivement le devis ${deletingQuote.reference} et toutes ses lignes.`}
          warning="Si ce devis a une commande associée, la suppression sera bloquée. Supprimez la commande d'abord."
          onConfirm={handleDeleteQuote}
          onClose={() => setDeletingQuote(null)}
        />
      )}
      {deletingOrder && (
        <ConfirmWithWord
          title="Supprimer la commande"
          description={`Supprimer définitivement la commande ${deletingOrder.reference}, ses fichiers et son historique.`}
          warning="Tous les fichiers Storage liés seront supprimés. Cette action est irréversible."
          onConfirm={handleDeleteOrder}
          onClose={() => setDeletingOrder(null)}
        />
      )}
      {deletingCustomer && (
        <ConfirmWithWord
          title="Supprimer le client"
          description={`Supprimer définitivement le client « ${deletingCustomer.contactName} » (${deletingCustomer.whatsapp}).`}
          warning="Le client doit n'avoir aucun devis ni commande actifs. Supprimez-les d'abord si nécessaire."
          onConfirm={handleDeleteCustomer}
          onClose={() => setDeletingCustomer(null)}
        />
      )}

      <div className="space-y-6">

        {/* En-tête */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">
              Maintenance & Nettoyage
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-0.5">Réservé au patron — toute suppression est irréversible</p>
          </div>
        </div>

        {/* Avertissement global */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Zone réservée au patron</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Ces actions suppriment définitivement des données. Elles sont journalisées dans le journal d&apos;activité.
              Chaque suppression requiert de taper <span className="font-mono font-black">SUPPRIMER</span> pour confirmation.
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Devis", value: stats.totalQuotes, icon: FileText, color: "text-blue-600 bg-blue-50" },
            { label: "Commandes", value: stats.totalOrders, icon: ShoppingCart, color: "text-purple-600 bg-purple-50" },
            { label: "Clients", value: stats.totalCustomers, icon: Users, color: "text-slate-600 bg-slate-100" },
            { label: "Notifs lues", value: stats.readNotifications, icon: Bell, color: "text-amber-600 bg-amber-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-800">{value}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Section : Notifications */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-400" />
              <h3 className="font-black text-slate-700 text-sm">Notifications lues</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{stats.readNotifications} entrée{stats.readNotifications > 1 ? "s" : ""}</span>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-slate-500 mb-4">
              Supprimer toutes les notifications déjà lues de votre compte. Les notifications non lues sont conservées.
            </p>
            {purgeSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl text-sm font-bold mb-3">
                <CheckCircle2 className="w-4 h-4" /> {purgeSuccess}
              </div>
            )}
            {purgeError && (
              <div className="text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl text-sm font-bold mb-3">
                {purgeError}
              </div>
            )}
            <button
              onClick={handlePurgeNotifications}
              disabled={isPending || stats.readNotifications === 0}
              className="h-10 px-5 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Purger les notifications lues
            </button>
          </div>
        </div>

        {/* Section : Supprimer un devis */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <h3 className="font-black text-slate-700 text-sm">Supprimer un devis</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{quotes.length} devis</span>
          </div>
          {quotes.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-xs font-bold text-slate-300">Aucun devis</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {quotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700">{q.reference}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {q.customer?.contactName ?? "—"} · {STATUS_LABELS[q.status] ?? q.status} · {formatPrice(q.total)}
                    </p>
                    <p className="text-[10px] text-slate-300">{formatDateShort(q.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => setDeletingQuote(q)}
                    className="ml-3 shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                    title="Supprimer ce devis"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50">
            <a href="/admin/devis" className="text-xs text-brand-primary font-bold flex items-center gap-1 hover:underline">
              Voir tous les devis <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Section : Supprimer une commande */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-slate-400" />
              <h3 className="font-black text-slate-700 text-sm">Supprimer une commande</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{orders.length} commandes</span>
          </div>
          {orders.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-xs font-bold text-slate-300">Aucune commande</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700">{o.reference}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {o.customer?.contactName ?? "—"} · {STATUS_LABELS[o.status] ?? o.status} · {formatPrice(o.total)}
                    </p>
                    <p className="text-[10px] text-slate-300">{formatDateShort(o.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => setDeletingOrder(o)}
                    className="ml-3 shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                    title="Supprimer cette commande"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50">
            <a href="/admin/commandes" className="text-xs text-brand-primary font-bold flex items-center gap-1 hover:underline">
              Voir toutes les commandes <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Section : Supprimer un client */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <h3 className="font-black text-slate-700 text-sm">Supprimer un client</h3>
            </div>
            <span className="text-xs font-bold text-slate-400">{customers.length} clients</span>
          </div>
          <div className="px-6 py-3 bg-amber-50/50 border-b border-amber-100">
            <p className="text-[11px] text-amber-700 font-semibold">
              Seuls les clients sans devis ni commande peuvent être supprimés.
            </p>
          </div>
          {customers.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-xs font-bold text-slate-300">Aucun client</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {customers.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700">{c.contactName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {c.whatsapp}
                      {c.companyName ? ` · ${c.companyName}` : ""}
                    </p>
                    <p className="text-[10px] text-slate-300">{formatDateShort(c.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => setDeletingCustomer(c)}
                    className="ml-3 shrink-0 w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                    title="Supprimer ce client"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/50">
            <a href="/admin/clients" className="text-xs text-brand-primary font-bold flex items-center gap-1 hover:underline">
              Voir tous les clients <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </>
  );
}
