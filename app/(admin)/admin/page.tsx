import { getDashboardStats } from "@/lib/db/stats";
import { StatCard } from "@/components/admin/StatCard";
import { formatPrice, formatDateShort } from "@/lib/utils/format";
import {
  Package,
  FolderOpen,
  FileText,
  ShoppingCart,
  Users,
  Image,
  Clock,
  AlertCircle,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const result = await getDashboardStats();

  if (result.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400">Erreur de chargement</p>
          <p className="text-xs text-slate-300 mt-1">{result.error}</p>
        </div>
      </div>
    );
  }

  const stats = result.data!;

  const statusLabels: Record<string, { label: string; color: string }> = {
    brouillon: { label: "Brouillon", color: "bg-slate-100 text-slate-600" },
    envoye: { label: "Envoyé", color: "bg-blue-100 text-blue-600" },
    accepte: { label: "Accepté", color: "bg-green-100 text-green-600" },
    refuse: { label: "Refusé", color: "bg-red-100 text-red-600" },
    expire: { label: "Expiré", color: "bg-amber-100 text-amber-600" },
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

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 font-heading tracking-tight">
          Bienvenue sur votre tableau de bord
        </h2>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Vue d&apos;ensemble de votre activité GLOBAL TIC PrintTech
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          label="Produits"
          value={stats.totalProducts}
          icon={Package}
          color="blue"
        />
        <StatCard
          label="Catégories"
          value={stats.totalCategories}
          icon={FolderOpen}
          color="purple"
        />
        <StatCard
          label="Devis"
          value={stats.totalQuotes}
          icon={FileText}
          color="amber"
        />
        <StatCard
          label="Commandes"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="green"
        />
        <StatCard
          label="Clients"
          value={stats.totalCustomers}
          icon={Users}
          color="cyan"
        />
        <StatCard
          label="Réalisations"
          value={stats.totalRealisations}
          icon={Image}
          color="rose"
        />
        <StatCard
          label="Devis en attente"
          value={stats.pendingQuotes}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Commandes actives"
          value={stats.activeOrders}
          icon={ShoppingCart}
          color="green"
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
              Derniers devis
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentQuotes.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Aucun devis pour le moment</p>
              </div>
            ) : (
              stats.recentQuotes.map((quote) => {
                const status = statusLabels[quote.status] ?? { label: quote.status, color: "bg-slate-100 text-slate-600" };
                return (
                  <div key={quote.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{quote.reference}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatDateShort(quote.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-sm font-black text-slate-700 tabular-nums">
                        {formatPrice(quote.total)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
              Dernières commandes
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recentOrders.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <ShoppingCart className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Aucune commande pour le moment</p>
              </div>
            ) : (
              stats.recentOrders.map((order) => {
                const status = statusLabels[order.status] ?? { label: order.status, color: "bg-slate-100 text-slate-600" };
                return (
                  <div key={order.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{order.reference}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatDateShort(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-sm font-black text-slate-700 tabular-nums">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
