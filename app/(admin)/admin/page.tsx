import Link from "next/link";
import { getDashboardStats } from "@/lib/db/stats";
import { getCurrentAdmin } from "@/lib/db/admin";
import { getTasksDueToday, getOverdueTasks } from "@/lib/db/tasks";
import { StatCard } from "@/components/admin/StatCard";
import { formatPrice, formatDateShort } from "@/lib/utils/format";
import {
  Package,
  FileText,
  ShoppingCart,
  Users,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle2,
  Printer,
  Truck,
  AlertCircle,
  Activity,
  Zap,
  Image,
  FolderOpen,
  ArrowRight,
  CheckSquare,
} from "lucide-react";
import type { AdminRole } from "@/lib/types/domain";
import { canAccessModule } from "@/lib/auth/permissions";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  brouillon:        { label: "Brouillon",         color: "bg-slate-100 text-slate-600" },
  envoye:           { label: "Envoyé",            color: "bg-blue-100 text-blue-600" },
  accepte:          { label: "Accepté",           color: "bg-green-100 text-green-600" },
  refuse:           { label: "Refusé",            color: "bg-red-100 text-red-600" },
  expire:           { label: "Expiré",            color: "bg-amber-100 text-amber-600" },
  en_attente:       { label: "En attente",        color: "bg-slate-100 text-slate-600" },
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

const ACTION_LABELS: Record<string, string> = {
  commande_creee:        "Commande créée",
  statut_change:         "Statut mis à jour",
  paiement_mis_a_jour:   "Paiement enregistré",
  note_interne_modifiee: "Note interne modifiée",
  fichier_ajoute:        "Fichier ajouté",
  fichier_supprime:      "Fichier supprimé",
  admin_user_cree:       "Utilisateur créé",
  admin_user_modifie:    "Utilisateur modifié",
  admin_user_desactive:  "Accès désactivé",
  admin_user_reactive:   "Accès réactivé",
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABELS[status] ?? { label: status, color: "bg-slate-100 text-slate-600" };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${s.color}`}>
      {s.label}
    </span>
  );
}

interface SectionHeaderProps {
  title: string;
  href?: string;
}

function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</h3>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-[10px] font-bold text-brand-primary/70 hover:text-brand-primary transition-colors"
        >
          Voir tout
          <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function EmptyRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="px-6 py-8 text-center">
      <Icon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
      <p className="text-xs font-bold text-slate-300">{label}</p>
    </div>
  );
}

function canSeeFinance(role: AdminRole): boolean {
  return role === "patron" || role === "admin" || role === "commercial";
}

export default async function AdminOverviewPage() {
  const [adminResult, statsResult, todayTasksResult, overdueTasksResult] = await Promise.all([
    getCurrentAdmin(),
    getDashboardStats(),
    getTasksDueToday(),
    getOverdueTasks(),
  ]);

  const admin = adminResult.data;
  const role: AdminRole = admin?.role ?? "commercial";

  if (statsResult.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400">Erreur de chargement</p>
          <p className="text-xs text-slate-300 mt-1">{statsResult.error}</p>
        </div>
      </div>
    );
  }

  const stats = statsResult.data!;
  const showFinance = canSeeFinance(role);
  const todayTasks   = todayTasksResult.data ?? [];
  const overdueTasks = overdueTasksResult.data ?? [];

  // Liens uniquement si le rôle a accès au module cible
  const href = {
    commandes:     canAccessModule(role, "commandes")  ? "/admin/commandes"  : undefined,
    devis:         canAccessModule(role, "devis")       ? "/admin/devis"      : undefined,
    clients:       canAccessModule(role, "clients")     ? "/admin/clients"    : undefined,
    produits:      canAccessModule(role, "produits")    ? "/admin/produits"   : undefined,
    categories:    canAccessModule(role, "categories")  ? "/admin/categories" : undefined,
    realisations:  canAccessModule(role, "realisations")? "/admin/realisations": undefined,
    // Liens avec futurs paramètres de filtre (prêts pour une phase filtres)
    devisAcceptes: canAccessModule(role, "devis")       ? "/admin/devis?status=accepte"           : undefined,
    commandesBat:  canAccessModule(role, "commandes")   ? "/admin/commandes?status=bat_en_cours"   : undefined,
    production:    canAccessModule(role, "commandes")   ? "/admin/commandes?status=en_production"  : undefined,
    pret:          canAccessModule(role, "commandes")   ? "/admin/commandes?status=pret"           : undefined,
    encaisse:      canAccessModule(role, "commandes")   ? "/admin/commandes?payment=paid"          : undefined,
    solde:         canAccessModule(role, "commandes")   ? "/admin/commandes?payment=remaining"     : undefined,
  };

  const greetingByRole: Record<AdminRole, string> = {
    patron:        "Vue complète de l'activité GLOBAL TIC PrintTech",
    admin:         "Vue complète de l'activité GLOBAL TIC PrintTech",
    commercial:    "Vos devis, clients et paiements à suivre",
    production:    "Commandes en cours — production, BAT et livraisons",
    infographiste: "Fichiers, maquettes et BAT en attente",
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 font-heading tracking-tight">
          Tableau de bord
        </h2>
        <p className="text-sm text-slate-400 font-medium mt-1">
          {greetingByRole[role]}
        </p>
      </div>

      {/* ── VUE PATRON / ADMIN ── */}
      {(role === "patron" || role === "admin") && (
        <>
          {/* KPIs financiers */}
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Finance</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="CA devis acceptés"
                value={formatPrice(stats.caDevisAcceptes)}
                icon={TrendingUp}
                color="green"
                href={href.devisAcceptes}
              />
              <StatCard
                label="CA commandes"
                value={formatPrice(stats.caCommandes)}
                icon={ShoppingCart}
                color="blue"
                href={href.commandes}
              />
              <StatCard
                label="Montant encaissé"
                value={formatPrice(stats.montantEncaisse)}
                icon={Wallet}
                color="purple"
                href={href.encaisse}
              />
              <StatCard
                label="Solde à encaisser"
                value={formatPrice(stats.soldeRestant)}
                icon={Clock}
                color="amber"
                href={href.solde}
              />
            </div>
          </div>

          {/* KPIs activité */}
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Activité</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Produits"    value={stats.totalProducts}     icon={Package}      color="blue"   href={href.produits} />
              <StatCard label="Catégories"  value={stats.totalCategories}   icon={FolderOpen}   color="purple" href={href.categories} />
              <StatCard label="Devis"       value={stats.totalQuotes}       icon={FileText}     color="amber"  href={href.devis} />
              <StatCard label="Commandes"   value={stats.totalOrders}       icon={ShoppingCart} color="green"  href={href.commandes} />
              <StatCard label="Clients"     value={stats.totalCustomers}    icon={Users}        color="cyan"   href={href.clients} />
              <StatCard label="Réalisations" value={stats.totalRealisations} icon={Image}       color="rose"   href={href.realisations} />
            </div>
          </div>

          {/* KPIs commandes */}
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Statut des commandes</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="En cours"          value={stats.activeOrders}       icon={Activity} color="blue"   href={href.commandes} />
              <StatCard label="BAT"               value={stats.ordersBat}          icon={Zap}      color="purple" href={href.commandesBat} />
              <StatCard label="En production"     value={stats.ordersInProduction} icon={Printer}  color="amber"  href={href.production} />
              <StatCard label="Prêtes / Livraison" value={stats.ordersPret}        icon={Truck}    color="green"  href={href.pret} />
            </div>
          </div>
        </>
      )}

      {/* ── VUE COMMERCIAL ── */}
      {role === "commercial" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total devis"      value={stats.totalQuotes}    icon={FileText}    color="amber" href={href.devis} />
            <StatCard label="Devis en attente" value={stats.pendingQuotes}  icon={Clock}       color="rose"  href={href.devis} />
            <StatCard label="Devis acceptés"   value={stats.acceptedQuotes} icon={CheckCircle2} color="green" href={href.devisAcceptes} />
            <StatCard label="Clients"          value={stats.totalCustomers} icon={Users}       color="cyan"  href={href.clients} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="CA devis acceptés" value={formatPrice(stats.caDevisAcceptes)} icon={TrendingUp} color="green"  href={href.devisAcceptes} />
            <StatCard label="Montant encaissé"  value={formatPrice(stats.montantEncaisse)} icon={Wallet}     color="blue"   href={href.encaisse} />
            <StatCard label="Solde à encaisser" value={formatPrice(stats.soldeRestant)}    icon={Clock}      color="amber"  href={href.solde} />
          </div>
        </>
      )}

      {/* ── VUE PRODUCTION ── */}
      {role === "production" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Commandes actives"  value={stats.activeOrders}       icon={Activity} color="blue"   href={href.commandes} />
          <StatCard label="BAT en cours"       value={stats.ordersBat}          icon={Zap}      color="purple" href={href.commandesBat} />
          <StatCard label="En production"      value={stats.ordersInProduction} icon={Printer}  color="amber"  href={href.production} />
          <StatCard label="Prêtes / Livraison" value={stats.ordersPret}         icon={Truck}    color="green"  href={href.pret} />
        </div>
      )}

      {/* ── VUE INFOGRAPHISTE ── */}
      {role === "infographiste" && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="BAT en cours / validés" value={stats.ordersBat}    icon={Zap}      color="purple" href={href.commandesBat} />
          <StatCard label="Commandes actives"      value={stats.activeOrders} icon={Activity} color="blue"   href={href.commandes} />
        </div>
      )}

      {/* ── COMMANDES URGENTES ── */}
      {(role === "patron" || role === "admin" || role === "production") && stats.urgentOrders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-[11px] font-black text-amber-700 uppercase tracking-widest">
                Commandes à traiter
              </h3>
            </div>
            {href.commandes && (
              <Link
                href={`${href.commandes}?filter=a_traiter`}
                className="flex items-center gap-1 text-[10px] font-bold text-amber-600/80 hover:text-amber-700 transition-colors"
              >
                Voir tout
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
          <div className="divide-y divide-amber-100">
            {stats.urgentOrders.map((order) => (
              <Link
                key={order.id}
                href="/admin/commandes"
                className="px-6 py-3.5 flex items-center justify-between hover:bg-amber-100/50 transition-colors group"
              >
                <div>
                  <p className="text-sm font-bold text-slate-700 group-hover:text-brand-primary transition-colors">{order.reference}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{formatDateShort(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  {showFinance && (
                    <span className="text-sm font-black text-slate-700 tabular-nums">
                      {formatPrice(order.total)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── TÂCHES DU JOUR / EN RETARD ── */}
      {canAccessModule(role, "taches") && (overdueTasks.length > 0 || todayTasks.length > 0) && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand-primary" />
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Tâches du jour
                {overdueTasks.length > 0 && (
                  <span className="ml-2 text-red-500">· {overdueTasks.length} en retard</span>
                )}
              </h3>
            </div>
            <Link
              href="/admin/taches"
              className="flex items-center gap-1 text-[10px] font-bold text-brand-primary/70 hover:text-brand-primary transition-colors"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {[...overdueTasks.slice(0, 3), ...todayTasks.slice(0, 3)].slice(0, 5).map((task) => {
              const isOverdue = task.dueDate ? task.dueDate < new Date().toISOString().slice(0, 10) : false;
              return (
                <Link
                  key={task.id}
                  href="/admin/taches"
                  className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-bold group-hover:text-brand-primary transition-colors truncate ${isOverdue ? "text-red-600" : "text-slate-700"}`}>
                      {task.title}
                    </p>
                    {task.customer && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{task.customer.contactName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isOverdue && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">En retard</span>
                    )}
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg ${
                      task.priority === "urgente" ? "bg-red-100 text-red-600" :
                      task.priority === "haute"   ? "bg-amber-100 text-amber-600" :
                      "bg-slate-100 text-slate-500"
                    }`}>{task.priority}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LISTES RÉCENTES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Dernières commandes */}
        {role !== "infographiste" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <SectionHeader title="Dernières commandes" href={href.commandes} />
            <div className="divide-y divide-slate-50">
              {stats.recentOrders.length === 0 ? (
                <EmptyRow icon={ShoppingCart} label="Aucune commande" />
              ) : stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/admin/commandes"
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-brand-primary transition-colors">{order.reference}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatDateShort(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    {showFinance && (
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-700 tabular-nums">{formatPrice(order.total)}</p>
                        {order.paidAmount < order.total && order.paidAmount > 0 && (
                          <p className="text-[10px] text-amber-600 font-semibold tabular-nums">
                            Solde {formatPrice(order.total - order.paidAmount)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Derniers devis */}
        {(role === "patron" || role === "admin" || role === "commercial") && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <SectionHeader title="Derniers devis" href={href.devis} />
            <div className="divide-y divide-slate-50">
              {stats.recentQuotes.length === 0 ? (
                <EmptyRow icon={FileText} label="Aucun devis" />
              ) : stats.recentQuotes.map((quote) => (
                <Link
                  key={quote.id}
                  href="/admin/devis"
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-brand-primary transition-colors">{quote.reference}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatDateShort(quote.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={quote.status} />
                    <span className="text-sm font-black text-slate-700 tabular-nums">
                      {formatPrice(quote.total)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Nouveaux clients */}
        {(role === "patron" || role === "admin" || role === "commercial") && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <SectionHeader title="Nouveaux clients" href={href.clients} />
            <div className="divide-y divide-slate-50">
              {stats.recentCustomers.length === 0 ? (
                <EmptyRow icon={Users} label="Aucun client" />
              ) : stats.recentCustomers.map((c) => (
                <Link
                  key={c.id}
                  href="/admin/clients"
                  className="px-6 py-3.5 hover:bg-slate-50 transition-colors group block"
                >
                  <p className="text-sm font-bold text-slate-700 group-hover:text-brand-primary transition-colors">{c.contactName}</p>
                  {c.companyName && (
                    <p className="text-[11px] text-slate-400">{c.companyName}</p>
                  )}
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[11px] text-slate-400">{c.whatsapp}</p>
                    <p className="text-[11px] text-slate-400">{formatDateShort(c.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Activité récente */}
        {(role === "patron" || role === "admin") && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <SectionHeader title="Activité récente" />
            <div className="divide-y divide-slate-50">
              {stats.recentActivity.length === 0 ? (
                <EmptyRow icon={Activity} label="Aucune activité" />
              ) : stats.recentActivity.map((entry) => {
                const label = ACTION_LABELS[entry.action] ?? entry.action;
                return (
                  <div key={entry.id} className="px-6 py-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700">{label}</p>
                      {entry.metadata && typeof entry.metadata === "object" && (
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {entry.metadata.reference
                            ? String(entry.metadata.reference)
                            : entry.metadata.email
                            ? String(entry.metadata.email)
                            : entry.metadata.vers
                            ? `→ ${String(entry.metadata.vers)}`
                            : ""}
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 shrink-0">{formatDateShort(entry.createdAt)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vue infographiste : commandes BAT */}
        {role === "infographiste" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <SectionHeader title="Commandes BAT à traiter" href={href.commandes} />
            <div className="divide-y divide-slate-50">
              {stats.urgentOrders.filter(o => ["bat_en_cours", "bat_valide", "confirmee"].includes(o.status)).length === 0 ? (
                <EmptyRow icon={Zap} label="Aucun BAT en attente" />
              ) : stats.urgentOrders
                  .filter(o => ["bat_en_cours", "bat_valide", "confirmee"].includes(o.status))
                  .map((order) => (
                <Link
                  key={order.id}
                  href="/admin/commandes"
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-700 group-hover:text-brand-primary transition-colors">{order.reference}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatDateShort(order.createdAt)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
