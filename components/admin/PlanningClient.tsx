"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Printer,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  Zap,
  Clock,
  CheckCircle2,
  Truck,
  Play,
  Package,
  ChevronDown,
  ChevronRight,
  Activity,
} from "lucide-react";
import type { OrderEnriched, AdminRole, OrderStatus } from "@/lib/types/domain";
import { formatDateShort } from "@/lib/utils/format";
import { quickUpdateOrderStatusAction } from "@/lib/actions/orders";
import { siteConfig } from "@/lib/config/site";

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  icon: React.ElementType;
  priority: number; // ordre d'affichage dans la vue groupée
}> = {
  confirmee:        { label: "Confirmée",        color: "bg-blue-100 text-blue-700",      icon: CheckCircle2, priority: 1 },
  bat_en_cours:     { label: "BAT en cours",      color: "bg-purple-100 text-purple-700",  icon: Zap,          priority: 2 },
  bat_valide:       { label: "BAT validé",        color: "bg-indigo-100 text-indigo-700",  icon: Zap,          priority: 3 },
  en_production:    { label: "En production",     color: "bg-amber-100 text-amber-700",    icon: Printer,      priority: 4 },
  controle_qualite: { label: "Contrôle qualité",  color: "bg-cyan-100 text-cyan-700",      icon: Activity,     priority: 5 },
  pret:             { label: "Prête",             color: "bg-emerald-100 text-emerald-700",icon: Package,      priority: 6 },
  en_livraison:     { label: "En livraison",      color: "bg-teal-100 text-teal-700",      icon: Truck,        priority: 7 },
};

// Transitions rapides autorisées depuis chaque statut
const QUICK_TRANSITIONS: Partial<Record<OrderStatus, { status: OrderStatus; label: string; color: string }[]>> = {
  confirmee:        [
    { status: "bat_en_cours",  label: "→ BAT",          color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
  ],
  bat_en_cours:     [
    { status: "bat_valide",    label: "→ BAT validé",   color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200" },
  ],
  bat_valide:       [
    { status: "en_production", label: "→ Production",   color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
  ],
  en_production:    [
    { status: "controle_qualite", label: "→ Contrôle", color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200" },
    { status: "pret",          label: "→ Prête",        color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  ],
  controle_qualite: [
    { status: "pret",          label: "→ Prête",        color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
  ],
  pret:             [
    { status: "en_livraison",  label: "→ Livraison",    color: "bg-teal-100 text-teal-700 hover:bg-teal-200" },
    { status: "livre",         label: "→ Livré",        color: "bg-green-100 text-green-700 hover:bg-green-200" },
  ],
  en_livraison:     [
    { status: "livre",         label: "→ Livré",        color: "bg-green-100 text-green-700 hover:bg-green-200" },
  ],
};

type FilterKey =
  | "tout"
  | "aujourd_hui"
  | "semaine"
  | "retard"
  | "bat_en_cours"
  | "bat_valide"
  | "en_production"
  | "pret"
  | "livraison";

type ViewMode = "priorite" | "statut";

function formatAmount(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}

function isLate(order: OrderEnriched): boolean {
  if (!order.estimatedDelivery) return false;
  if (order.status === "livre" || order.status === "annulee") return false;
  return order.estimatedDelivery < new Date().toISOString().slice(0, 10);
}

function isToday(order: OrderEnriched): boolean {
  if (!order.estimatedDelivery) return false;
  return order.estimatedDelivery === new Date().toISOString().slice(0, 10);
}

function isThisWeek(order: OrderEnriched): boolean {
  if (!order.estimatedDelivery) return false;
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  const d = order.estimatedDelivery;
  return d >= now.toISOString().slice(0, 10) && d <= weekEnd.toISOString().slice(0, 10);
}

function buildWaMessage(order: OrderEnriched): string {
  const client = order.customer?.contactName ?? "client";
  const phone = (order.customer?.whatsapp ?? siteConfig.whatsapp).replace(/\D/g, "");
  const statusLabel = STATUS_CONFIG[order.status]?.label ?? order.status;
  const lines = [
    `Bonjour *${client}*,`,
    ``,
    `Mise à jour de votre commande *${order.reference}* :`,
    `*Statut* : ${statusLabel}`,
    order.estimatedDelivery ? `*Livraison prévue* : ${formatDateShort(order.estimatedDelivery)}` : "",
    ``,
    `Merci pour votre confiance — *GLOBAL TIC*`,
  ].filter((l) => l !== "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanningClientProps {
  orders:        OrderEnriched[];
  role:          AdminRole;
  canEditStatus: boolean;
  canSeeFinance: boolean;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function PlanningClient({ orders, canEditStatus, canSeeFinance }: PlanningClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter]   = useState<FilterKey>("tout");
  const [view,   setView]     = useState<ViewMode>("priorite");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Stats rapides
  const nbLate      = orders.filter(isLate).length;
  const nbToday     = orders.filter(isToday).length;
  const nbBat       = orders.filter((o) => o.status === "bat_en_cours" || o.status === "bat_valide").length;
  const nbPret      = orders.filter((o) => o.status === "pret").length;
  const nbProduction= orders.filter((o) => o.status === "en_production" || o.status === "controle_qualite").length;

  // Filtrage
  const filtered = useMemo(() => {
    switch (filter) {
      case "aujourd_hui":  return orders.filter(isToday);
      case "semaine":      return orders.filter(isThisWeek);
      case "retard":       return orders.filter(isLate);
      case "bat_en_cours": return orders.filter((o) => o.status === "bat_en_cours");
      case "bat_valide":   return orders.filter((o) => o.status === "bat_valide");
      case "en_production":return orders.filter((o) => o.status === "en_production" || o.status === "controle_qualite");
      case "pret":         return orders.filter((o) => o.status === "pret");
      case "livraison":    return orders.filter((o) => o.status === "en_livraison");
      default:             return orders;
    }
  }, [orders, filter]);

  // Vue priorité : retards en premier, puis par date estimée, puis par date de création
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aLate = isLate(a) ? 0 : 1;
      const bLate = isLate(b) ? 0 : 1;
      if (aLate !== bLate) return aLate - bLate;
      // Priorité statut : bat_valide > en_production > bat_en_cours > pret > ...
      const aPriority = STATUS_CONFIG[a.status]?.priority ?? 99;
      const bPriority = STATUS_CONFIG[b.status]?.priority ?? 99;
      if (aPriority !== bPriority) return aPriority - bPriority;
      // Date estimée la plus proche en premier
      if (a.estimatedDelivery && b.estimatedDelivery) {
        return a.estimatedDelivery.localeCompare(b.estimatedDelivery);
      }
      if (a.estimatedDelivery) return -1;
      if (b.estimatedDelivery) return 1;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }, [filtered]);

  // Vue par statut : groupement
  const byStatus = useMemo(() => {
    const groups = new Map<string, OrderEnriched[]>();
    const statusOrder = Object.entries(STATUS_CONFIG)
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([k]) => k);
    for (const s of statusOrder) groups.set(s, []);
    for (const o of filtered) {
      const grp = groups.get(o.status);
      if (grp) grp.push(o);
    }
    // Supprimer les groupes vides
    for (const [k, v] of groups) {
      if (v.length === 0) groups.delete(k);
    }
    return groups;
  }, [filtered]);

  function handleStatusChange(order: OrderEnriched, status: OrderStatus) {
    startTransition(async () => {
      await quickUpdateOrderStatusAction(order.id, status);
      router.refresh();
    });
  }

  function toggleGroup(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const filterTabs: { key: FilterKey; label: string; count?: number; alert?: boolean }[] = [
    { key: "tout",          label: "Tout",            count: orders.length },
    { key: "retard",        label: "En retard",       count: nbLate,       alert: nbLate > 0 },
    { key: "aujourd_hui",   label: "Aujourd'hui",     count: nbToday },
    { key: "semaine",       label: "Cette semaine" },
    { key: "bat_en_cours",  label: "BAT en cours",    count: nbBat },
    { key: "bat_valide",    label: "BAT validé" },
    { key: "en_production", label: "Production",      count: nbProduction },
    { key: "pret",          label: "Prêtes",          count: nbPret },
    { key: "livraison",     label: "Livraison" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">
            Planning de production
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {filtered.length} commande{filtered.length > 1 ? "s" : ""}
            {filter !== "tout" ? ` · filtre actif` : " en cours"}
          </p>
        </div>
        {/* Toggle vue */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setView("priorite")}
            className={`h-7 px-3 rounded-lg text-xs font-bold transition-all ${view === "priorite" ? "bg-white shadow-sm text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
          >
            Priorité
          </button>
          <button
            onClick={() => setView("statut")}
            className={`h-7 px-3 rounded-lg text-xs font-bold transition-all ${view === "statut" ? "bg-white shadow-sm text-slate-700" : "text-slate-400 hover:text-slate-600"}`}
          >
            Par statut
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className={`rounded-2xl border p-3 text-center ${nbLate > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-100"}`}>
          <AlertCircle className={`w-4 h-4 mx-auto mb-1 ${nbLate > 0 ? "text-red-500" : "text-slate-300"}`} />
          <p className={`text-lg font-black tabular-nums ${nbLate > 0 ? "text-red-600" : "text-slate-300"}`}>{nbLate}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Retards</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center">
          <Zap className="w-4 h-4 text-purple-400 mx-auto mb-1" />
          <p className="text-lg font-black text-slate-700 tabular-nums">{nbBat}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">BAT</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center">
          <Printer className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-black text-slate-700 tabular-nums">{nbProduction}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Production</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-3 text-center">
          <Package className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-black text-slate-700 tabular-nums">{nbPret}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Prêtes</p>
        </div>
        <div className={`rounded-2xl border p-3 text-center ${nbToday > 0 ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100"}`}>
          <Clock className={`w-4 h-4 mx-auto mb-1 ${nbToday > 0 ? "text-blue-500" : "text-slate-300"}`} />
          <p className={`text-lg font-black tabular-nums ${nbToday > 0 ? "text-blue-600" : "text-slate-300"}`}>{nbToday}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Aujourd&apos;hui</p>
        </div>
      </div>

      {/* Alerte retards */}
      {nbLate > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm font-bold text-red-700">
              {nbLate} commande{nbLate > 1 ? "s" : ""} en retard sur la date de livraison estimée
            </p>
          </div>
          <button
            onClick={() => setFilter("retard")}
            className="shrink-0 text-xs font-bold text-red-600 hover:text-red-700 underline underline-offset-2"
          >
            Voir
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`h-8 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filter === tab.key
                ? tab.alert
                  ? "bg-red-500 text-white shadow-sm"
                  : "bg-brand-primary text-white shadow-sm"
                : tab.alert
                  ? "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
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

      {/* Liste vide */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 px-6 py-12 text-center">
          <CheckCircle2 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-300">Aucune commande</p>
          <p className="text-xs text-slate-300 mt-1">
            {orders.length === 0
              ? "Aucune commande en cours de production"
              : "Aucun résultat pour ce filtre"}
          </p>
        </div>
      )}

      {/* ── VUE PRIORITÉ ──────────────────────────────────────────────────── */}
      {view === "priorite" && filtered.length > 0 && (
        <>
          {/* Mobile */}
          <div className="sm:hidden space-y-3">
            {sorted.map((order) => (
              <PlanningCard
                key={order.id}
                order={order}
                canEditStatus={canEditStatus}
                canSeeFinance={canSeeFinance}
                isPending={isPending}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <PlanningTable
                orders={sorted}
                canEditStatus={canEditStatus}
                canSeeFinance={canSeeFinance}
                isPending={isPending}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </>
      )}

      {/* ── VUE PAR STATUT ────────────────────────────────────────────────── */}
      {view === "statut" && filtered.length > 0 && (
        <div className="space-y-4">
          {Array.from(byStatus.entries()).map(([status, grpOrders]) => {
            const cfg = STATUS_CONFIG[status];
            if (!cfg) return null;
            const isOpen = !collapsed.has(status);
            const StatusIcon = cfg.icon;
            return (
              <div key={status} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(status)}
                  className="w-full flex items-center justify-between px-5 py-3.5 border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${cfg.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </span>
                    <span className="text-xs font-black text-slate-400">{grpOrders.length}</span>
                    {grpOrders.some(isLate) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" />
                        {grpOrders.filter(isLate).length} en retard
                      </span>
                    )}
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>

                {isOpen && (
                  <>
                    <div className="sm:hidden divide-y divide-slate-50">
                      {grpOrders.map((order) => (
                        <div key={order.id} className="p-4">
                          <PlanningCard
                            order={order}
                            canEditStatus={canEditStatus}
                            canSeeFinance={canSeeFinance}
                            isPending={isPending}
                            onStatusChange={handleStatusChange}
                            compact
                          />
                        </div>
                      ))}
                    </div>
                    <div className="hidden sm:block overflow-x-auto">
                      <PlanningTable
                        orders={grpOrders}
                        canEditStatus={canEditStatus}
                        canSeeFinance={canSeeFinance}
                        isPending={isPending}
                        onStatusChange={handleStatusChange}
                        hideStatusCol
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sous-composant card mobile ───────────────────────────────────────────────

function PlanningCard({
  order,
  canEditStatus,
  canSeeFinance,
  isPending,
  onStatusChange,
  compact = false,
}: {
  order: OrderEnriched;
  canEditStatus: boolean;
  canSeeFinance: boolean;
  isPending: boolean;
  onStatusChange: (o: OrderEnriched, s: OrderStatus) => void;
  compact?: boolean;
}) {
  const cfg      = STATUS_CONFIG[order.status];
  const late     = isLate(order);
  const today    = isToday(order);
  const balance  = order.total - order.paidAmount;
  const waLink   = buildWaMessage(order);
  const StatusIcon = cfg?.icon ?? CheckCircle2;
  const transitions = QUICK_TRANSITIONS[order.status as OrderStatus] ?? [];

  return (
    <div className={`space-y-3 ${!compact ? "bg-white rounded-2xl border border-slate-100 p-4" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-black text-slate-800 text-sm">{order.reference}</p>
            {late && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-600">
                <AlertCircle className="w-2.5 h-2.5" /> En retard
              </span>
            )}
            {today && !late && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-600">
                <Clock className="w-2.5 h-2.5" /> Aujourd&apos;hui
              </span>
            )}
          </div>
          {order.customer && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{order.customer.contactName}</p>
          )}
          {order.customer?.companyName && (
            <p className="text-[10px] text-slate-400 truncate">{order.customer.companyName}</p>
          )}
        </div>
        {cfg && (
          <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${cfg.color}`}>
            <StatusIcon className="w-3 h-3" /> {cfg.label}
          </span>
        )}
      </div>

      {/* Notes */}
      {order.notes && (
        <p className="text-[11px] text-slate-500 italic truncate">{order.notes}</p>
      )}

      {/* Dates + finances */}
      <div className="flex items-center justify-between py-2 border-y border-slate-50 gap-2">
        <div className="space-y-0.5">
          {order.estimatedDelivery && (
            <p className={`text-[10px] font-semibold flex items-center gap-1 ${late ? "text-red-500" : today ? "text-blue-600" : "text-slate-500"}`}>
              <Clock className="w-3 h-3 shrink-0" />
              Livraison : {formatDateShort(order.estimatedDelivery)}
            </p>
          )}
          {order.actualDelivery && (
            <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              Livré le {formatDateShort(order.actualDelivery)}
            </p>
          )}
        </div>
        {canSeeFinance && (
          <div className="text-right">
            <p className="text-xs font-black text-slate-700 tabular-nums">{formatAmount(order.total)}</p>
            {balance > 0 && (
              <p className="text-[10px] text-amber-600 font-semibold tabular-nums">Solde {formatAmount(balance)}</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/admin/commandes"
          title="Voir la commande"
          className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
        {order.customer?.whatsapp && (
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
        {canEditStatus && transitions.map((t) => (
          <button
            key={t.status}
            onClick={() => onStatusChange(order, t.status)}
            disabled={isPending}
            className={`h-9 px-3 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 flex items-center gap-1 ${t.color}`}
          >
            <Play className="w-3 h-3" /> {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Sous-composant tableau desktop ──────────────────────────────────────────

function PlanningTable({
  orders,
  canEditStatus,
  canSeeFinance,
  isPending,
  onStatusChange,
  hideStatusCol = false,
}: {
  orders: OrderEnriched[];
  canEditStatus: boolean;
  canSeeFinance: boolean;
  isPending: boolean;
  onStatusChange: (o: OrderEnriched, s: OrderStatus) => void;
  hideStatusCol?: boolean;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-100">
          <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Référence</th>
          <th className="text-left px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
          {!hideStatusCol && (
            <th className="text-center px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
          )}
          <th className="text-center px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Livraison</th>
          {canSeeFinance && (
            <th className="text-right px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Solde</th>
          )}
          <th className="text-center px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {orders.map((order) => {
          const cfg      = STATUS_CONFIG[order.status];
          const late     = isLate(order);
          const today    = isToday(order);
          const balance  = order.total - order.paidAmount;
          const waLink   = buildWaMessage(order);
          const StatusIcon = cfg?.icon ?? CheckCircle2;
          const transitions = QUICK_TRANSITIONS[order.status as OrderStatus] ?? [];

          return (
            <tr key={order.id} className={`hover:bg-slate-50/50 transition-colors ${late ? "bg-red-50/30" : ""}`}>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800">{order.reference}</p>
                  {late && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-600">
                      <AlertCircle className="w-2.5 h-2.5" /> Retard
                    </span>
                  )}
                  {today && !late && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-600">
                      Aujourd&apos;hui
                    </span>
                  )}
                </div>
                {order.notes && (
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">{order.notes}</p>
                )}
              </td>
              <td className="px-5 py-4">
                {order.customer ? (
                  <div>
                    <p className="font-semibold text-slate-700">{order.customer.contactName}</p>
                    {order.customer.companyName && (
                      <p className="text-[11px] text-slate-400">{order.customer.companyName}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-300 text-xs">—</span>
                )}
              </td>
              {!hideStatusCol && cfg && (
                <td className="px-5 py-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${cfg.color}`}>
                    <StatusIcon className="w-3 h-3" /> {cfg.label}
                  </span>
                </td>
              )}
              <td className="px-5 py-4 text-center">
                {order.estimatedDelivery ? (
                  <p className={`text-xs font-semibold ${late ? "text-red-500" : today ? "text-blue-600" : "text-slate-600"}`}>
                    {formatDateShort(order.estimatedDelivery)}
                  </p>
                ) : (
                  <span className="text-slate-300 text-xs">—</span>
                )}
                {order.actualDelivery && (
                  <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                    Livré {formatDateShort(order.actualDelivery)}
                  </p>
                )}
              </td>
              {canSeeFinance && (
                <td className="px-5 py-4 text-right tabular-nums">
                  {balance > 0 ? (
                    <span className="text-xs font-semibold text-amber-600">{formatAmount(balance)}</span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
              )}
              <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <Link
                    href="/admin/commandes"
                    title="Voir la commande"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  {order.customer?.whatsapp && (
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
                  {canEditStatus && transitions.map((t) => (
                    <button
                      key={t.status}
                      onClick={() => onStatusChange(order, t.status)}
                      disabled={isPending}
                      title={t.label}
                      className={`inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-[11px] font-bold transition-colors disabled:opacity-40 ${t.color}`}
                    >
                      <Play className="w-3 h-3 shrink-0" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
