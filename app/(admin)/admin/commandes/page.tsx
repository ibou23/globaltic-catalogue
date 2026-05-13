import { getOrders } from "@/lib/db/orders";
import { formatPrice, formatDateShort } from "@/lib/utils/format";
import { ShoppingCart, Search } from "lucide-react";

export default async function AdminCommandesPage() {
  const result = await getOrders();
  const orders = result.data ?? [];

  const statusLabels: Record<string, { label: string; color: string }> = {
    en_attente: { label: "En attente", color: "bg-slate-100 text-slate-600" },
    confirmee: { label: "Confirmée", color: "bg-blue-100 text-blue-600" },
    bat_en_cours: { label: "BAT en cours", color: "bg-purple-100 text-purple-600" },
    bat_valide: { label: "BAT validé", color: "bg-indigo-100 text-indigo-600" },
    en_production: { label: "En production", color: "bg-amber-100 text-amber-600" },
    controle_qualite: { label: "Contrôle qualité", color: "bg-cyan-100 text-cyan-600" },
    pret: { label: "Prêt", color: "bg-emerald-100 text-emerald-600" },
    en_livraison: { label: "En livraison", color: "bg-teal-100 text-teal-600" },
    livre: { label: "Livré", color: "bg-green-100 text-green-600" },
    annulee: { label: "Annulée", color: "bg-red-100 text-red-600" },
  };

  const paymentLabels: Record<string, { label: string; color: string }> = {
    non_paye: { label: "Non payé", color: "bg-red-100 text-red-600" },
    acompte: { label: "Acompte", color: "bg-amber-100 text-amber-600" },
    paye: { label: "Payé", color: "bg-green-100 text-green-600" },
    rembourse: { label: "Remboursé", color: "bg-slate-100 text-slate-600" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">
          Gestion des commandes
        </h2>
        <p className="text-sm text-slate-400 font-medium mt-1">
          {orders.length} commande{orders.length > 1 ? "s" : ""} au total
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          type="text"
          placeholder="Rechercher par référence..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paiement</th>
                <th className="text-right px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <ShoppingCart className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-300">Aucune commande</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const status = statusLabels[order.status] ?? { label: order.status, color: "bg-slate-100 text-slate-600" };
                  const payment = paymentLabels[order.paymentStatus] ?? { label: order.paymentStatus, color: "bg-slate-100 text-slate-600" };
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{order.reference}</td>
                      <td className="px-6 py-4 text-slate-500">{formatDateShort(order.createdAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${payment.color}`}>
                          {payment.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-700 tabular-nums">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
