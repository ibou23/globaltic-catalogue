"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  MessageCircle,
  Filter,
  X,
  UserPlus,
  Calendar,
  Phone,
  Flame,
  Zap,
  Snowflake,
  HelpCircle,
  XCircle,
  UserCheck,
  ClipboardList,
  Pencil,
  Trash2,
  MoreVertical,
  Copy,
  Check,
} from "lucide-react";
import type { Prospect, ProspectStatus, ProspectPriority, AdminRole } from "@/lib/types/domain";
import { siteConfig } from "@/lib/config/site";
import {
  PROSPECT_MESSAGE_LABELS,
  getProspectWhatsAppUrl,
  type ProspectMessageType,
} from "@/lib/whatsapp/prospect-messages";
import {
  markProspectContactedAction,
  updateProspectAction,
  convertProspectToCustomerAction,
  createProspectTaskAction,
  deleteProspectAction,
  getProspectLinkedEntitiesAction,
} from "@/lib/actions/prospects";
import { ConfirmWithWord } from "@/components/admin/ConfirmWithWord";

const STATUS_CONFIG: Record<ProspectStatus, { label: string; color: string }> = {
  nouveau:              { label: "Nouveau",              color: "bg-blue-100 text-blue-700" },
  devis_envoye:         { label: "Devis envoyé",        color: "bg-indigo-100 text-indigo-700" },
  en_negociation:       { label: "En négociation",      color: "bg-amber-100 text-amber-700" },
  validation_conception:{ label: "Valid. conception",    color: "bg-purple-100 text-purple-700" },
  commande_confirmee:   { label: "Commande confirmée",  color: "bg-emerald-100 text-emerald-700" },
  en_production:        { label: "En production",       color: "bg-orange-100 text-orange-700" },
  livre:                { label: "Livré",               color: "bg-green-100 text-green-700" },
  annule:               { label: "Annulé",              color: "bg-red-100 text-red-700" },
};

const PRIORITY_CONFIG: Record<ProspectPriority, { label: string; color: string; icon: typeof Flame }> = {
  urgent:      { label: "Urgent",      color: "bg-red-100 text-red-700",    icon: Zap },
  chaud:       { label: "Chaud",       color: "bg-orange-100 text-orange-700", icon: Flame },
  a_qualifier: { label: "À qualifier", color: "bg-slate-100 text-slate-600", icon: HelpCircle },
  froid:       { label: "Froid",       color: "bg-blue-50 text-blue-500",   icon: Snowflake },
  perdu:       { label: "Perdu",       color: "bg-gray-100 text-gray-500",  icon: XCircle },
};

type InboxTab = "all" | "to_process" | "urgent" | "follow_up" | "qualified" | "lost";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-SN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "< 1h";
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "hier";
  return `${days}j`;
}

function buildWhatsAppLink(whatsapp: string): string {
  const number = whatsapp.replace(/[^0-9]/g, "") || siteConfig.whatsapp;
  return `https://wa.me/${number}`;
}

function isOverdue(p: Prospect): boolean {
  if (p.status !== "nouveau" && p.status !== "en_negociation") return false;
  const age = Date.now() - new Date(p.createdAt).getTime();
  return age > 24 * 60 * 60 * 1000 && !p.contactedAt;
}

interface UntreatedProspectAlert {
  count: number;
  oldestMinutes: number;
}

interface ProspectsClientProps {
  prospects: Prospect[];
  totalCount: number;
  activeFilter?: { label: string; count: number; resetHref: string };
  role: AdminRole;
  canEdit?: boolean;
  canDelete?: boolean;
  untreatedAlert?: UntreatedProspectAlert | null;
}

const FORM_URL = "https://imprimerie.globalticgroup.com/demande";
const WA_FORM_MESSAGE = `Bonjour,\n\nMerci pour votre intérêt.\n\nVous pouvez remplir notre formulaire de demande de devis ici :\n${FORM_URL}\n\nNotre équipe vous recontactera rapidement.\n\nGLOBAL TIC`;

export function ProspectsClient({ prospects, totalCount, activeFilter, role: _role, canEdit, canDelete, untreatedAlert }: ProspectsClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<ProspectPriority | "">("");
  const [activeTab, setActiveTab] = useState<InboxTab>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [localProspects, setLocalProspects] = useState(prospects);
  const [linkCopied, setLinkCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Prospect | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | undefined>(undefined);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const tabFilter = (p: Prospect): boolean => {
    switch (activeTab) {
      case "to_process": return p.status === "nouveau" && !p.contactedAt;
      case "urgent": return p.priority === "urgent" || p.priority === "chaud";
      case "follow_up": return isOverdue(p);
      case "qualified": return p.status === "en_negociation" || p.status === "devis_envoye";
      case "lost": return p.priority === "perdu" || p.status === "annule";
      default: return true;
    }
  };

  const filtered = localProspects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.fullName.toLowerCase().includes(q) ||
      p.whatsapp.includes(q) ||
      (p.companyName?.toLowerCase().includes(q) ?? false) ||
      (p.email?.toLowerCase().includes(q) ?? false);

    const matchesStatus = !statusFilter || p.status === statusFilter;
    const matchesPriority = !priorityFilter || p.priority === priorityFilter;
    const matchesTab = tabFilter(p);

    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });

  const counts = {
    all: localProspects.length,
    to_process: localProspects.filter(p => p.status === "nouveau" && !p.contactedAt).length,
    urgent: localProspects.filter(p => p.priority === "urgent" || p.priority === "chaud").length,
    follow_up: localProspects.filter(p => isOverdue(p)).length,
    qualified: localProspects.filter(p => p.status === "en_negociation" || p.status === "devis_envoye").length,
    lost: localProspects.filter(p => p.priority === "perdu" || p.status === "annule").length,
  };

  const tabs: { key: InboxTab; label: string; count: number; color: string }[] = [
    { key: "all", label: "Tous", count: counts.all, color: "text-slate-600" },
    { key: "to_process", label: "À traiter", count: counts.to_process, color: "text-blue-600" },
    { key: "urgent", label: "Urgents", count: counts.urgent, color: "text-red-600" },
    { key: "follow_up", label: "À relancer", count: counts.follow_up, color: "text-amber-600" },
    { key: "qualified", label: "Qualifiés", count: counts.qualified, color: "text-emerald-600" },
    { key: "lost", label: "Perdus", count: counts.lost, color: "text-gray-500" },
  ];

  async function handleMarkContacted(id: string) {
    setActionLoading(id);
    const result = await markProspectContactedAction(id);
    if (result.data) {
      setLocalProspects(prev => prev.map(p => p.id === id ? { ...p, contactedAt: new Date().toISOString() } : p));
    }
    setActionLoading(null);
  }

  async function handleSetPriority(id: string, priority: ProspectPriority) {
    setActionLoading(id);
    const result = await updateProspectAction(id, { priority });
    if (result.data) {
      setLocalProspects(prev => prev.map(p => p.id === id ? { ...p, priority } : p));
    }
    setActionLoading(null);
  }

  async function handleConvert(id: string) {
    setActionLoading(id);
    const result = await convertProspectToCustomerAction(id);
    if (result.data) {
      setLocalProspects(prev => prev.map(p => p.id === id ? { ...p, convertedCustomerId: result.data!.id, status: "commande_confirmee" as const } : p));
    }
    setActionLoading(null);
  }

  async function handleCreateTask(id: string, name: string) {
    setActionLoading(id);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    await createProspectTaskAction(id, "appeler_client", `Relancer ${name}`, tomorrow);
    setActionLoading(null);
  }

  async function handleDeleteStart(p: Prospect) {
    setDeleteTarget(p);
    setDeleteWarning(undefined);
    const result = await getProspectLinkedEntitiesAction(p.id);
    if (result.data) {
      const parts: string[] = [];
      if (result.data.convertedCustomerId) parts.push("un client converti (ne sera PAS supprimé)");
      if (result.data.tasks > 0) parts.push(`${result.data.tasks} tâche(s) liée(s)`);
      if (parts.length > 0) setDeleteWarning(`Ce prospect est lié à : ${parts.join(", ")}.`);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return { error: "Aucun prospect sélectionné" };
    const result = await deleteProspectAction(deleteTarget.id);
    if (!result.error) {
      setLocalProspects(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
    return result;
  }

  function handleCopyFormLink() {
    const text = FORM_URL;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2500);
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    }
  }

  function handleCopyWaMessage() {
    const text = WA_FORM_MESSAGE;
    navigator.clipboard?.writeText(text);
  }

  return (
    <div className="space-y-5">
      {/* Modal suppression */}
      {deleteTarget && (
        <ConfirmWithWord
          title="Supprimer ce prospect"
          description={`Voulez-vous supprimer définitivement "${deleteTarget.fullName}" ?`}
          warning={deleteWarning}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Inbox Prospects</h1>
          <p className="text-sm text-slate-400 mt-1">
            {totalCount} prospect{totalCount !== 1 ? "s" : ""} au total
            {activeFilter && (
              <span className="ml-2 inline-flex items-center gap-1 text-brand-primary font-semibold">
                · {activeFilter.label} ({activeFilter.count})
                <Link href={activeFilter.resetHref} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </Link>
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyFormLink}
            className={`h-10 px-4 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 ${
              linkCopied
                ? "bg-emerald-500 text-white"
                : "bg-brand-primary text-white hover:bg-brand-primary-dark"
            }`}
          >
            {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {linkCopied ? "Lien copié !" : "Copier lien formulaire"}
          </button>
          <button
            onClick={handleCopyWaMessage}
            title="Copier le message WhatsApp avec le lien"
            className="h-10 px-3 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 text-sm font-bold transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerte prospects non traités > 2h */}
      {untreatedAlert && untreatedAlert.count > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-sm">
            <span className="font-bold text-red-700">
              {untreatedAlert.count} prospect{untreatedAlert.count > 1 ? "s" : ""} non contact{untreatedAlert.count > 1 ? "és" : "é"}
            </span>
            <span className="text-red-600 ml-1">
              depuis plus de {untreatedAlert.oldestMinutes >= 60
                ? `${Math.floor(untreatedAlert.oldestMinutes / 60)}h${untreatedAlert.oldestMinutes % 60 > 0 ? `${untreatedAlert.oldestMinutes % 60}min` : ""}`
                : `${untreatedAlert.oldestMinutes}min`}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-brand-primary text-white"
                : `bg-white border border-slate-200 ${tab.color} hover:border-brand-primary/30`
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === tab.key ? "bg-white/20" : "bg-slate-100"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, entreprise..."
            className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProspectStatus | "")}
            className="h-11 pl-10 pr-8 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary appearance-none bg-white"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as ProspectPriority | "")}
          className="h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary appearance-none bg-white"
        >
          <option value="">Toutes priorités</option>
          {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Compteur résultats */}
      {(search || statusFilter || priorityFilter || activeTab !== "all") && (
        <p className="text-xs text-slate-400">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Liste mobile */}
      <div className="sm:hidden space-y-3">
        {filtered.map((p) => {
          const status = STATUS_CONFIG[p.status];
          const prio = PRIORITY_CONFIG[p.priority];
          const PrioIcon = prio.icon;
          const overdue = isOverdue(p);
          return (
            <div key={p.id} className={`bg-white rounded-2xl border p-4 space-y-3 ${overdue ? "border-amber-300" : "border-slate-100"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800">{p.fullName}</p>
                    <PrioIcon className={`w-3.5 h-3.5 ${prio.color.split(" ")[1]}`} />
                  </div>
                  {p.companyName && <p className="text-xs text-slate-400">{p.companyName}</p>}
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${status.color}`}>
                  {status.label}
                </span>
              </div>
              {p.requestedProducts.length > 0 && (
                <p className="text-xs text-slate-500 truncate">{p.requestedProducts.join(", ")}</p>
              )}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
                <span>{p.whatsapp}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatRelative(p.createdAt)}
                </span>
              </div>
              {/* Quick actions mobile */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Link
                  href={`/admin/prospects/${p.id}`}
                  className="h-8 px-3 rounded-lg bg-brand-primary/10 text-brand-primary text-[11px] font-bold flex items-center gap-1 transition-colors hover:bg-brand-primary hover:text-white"
                >
                  <Eye className="w-3 h-3" /> Fiche
                </Link>
                <a
                  href={buildWhatsAppLink(p.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-3 rounded-lg bg-green-100 text-green-700 text-[11px] font-bold flex items-center gap-1 transition-colors hover:bg-green-200"
                >
                  <MessageCircle className="w-3 h-3" /> WhatsApp
                </a>
                {!p.contactedAt && (
                  <button
                    onClick={() => handleMarkContacted(p.id)}
                    disabled={actionLoading === p.id}
                    className="h-8 px-3 rounded-lg bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1 transition-colors hover:bg-indigo-200 disabled:opacity-50"
                  >
                    <Phone className="w-3 h-3" /> Contacté
                  </button>
                )}
                {canEdit && (
                  <Link
                    href={`/admin/prospects/${p.id}/modifier`}
                    className="h-8 px-3 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center gap-1 transition-colors hover:bg-slate-200"
                  >
                    <Pencil className="w-3 h-3" /> Modifier
                  </Link>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDeleteStart(p)}
                    className="h-8 px-3 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold flex items-center gap-1 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tableau desktop */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prospect</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Produits</th>
                <th className="text-center px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priorité</th>
                <th className="text-center px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Âge</th>
                <th className="text-center px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => {
                const status = STATUS_CONFIG[p.status];
                const prio = PRIORITY_CONFIG[p.priority];
                const PrioIcon = prio.icon;
                const overdue = isOverdue(p);
                return (
                  <tr key={p.id} className={`transition-colors ${overdue ? "bg-amber-50/50" : "hover:bg-slate-50/50"}`}>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/prospects/${p.id}`} className="font-bold text-slate-700 hover:text-brand-primary transition-colors">
                        {p.fullName}
                      </Link>
                      {p.companyName && <p className="text-[11px] text-slate-400">{p.companyName}</p>}
                      <p className="text-[11px] text-slate-400">{p.whatsapp}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-slate-600 truncate max-w-[180px]">
                        {p.requestedProducts.length > 0
                          ? p.requestedProducts.join(", ")
                          : <span className="text-slate-300">—</span>}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <PrioIcon className={`w-3.5 h-3.5 ${prio.color.split(" ")[1]}`} />
                        <select
                          value={p.priority}
                          onChange={(e) => handleSetPriority(p.id, e.target.value as ProspectPriority)}
                          className="text-[11px] font-bold bg-transparent border-none cursor-pointer focus:outline-none"
                          disabled={actionLoading === p.id}
                        >
                          {Object.entries(PRIORITY_CONFIG).map(([k, { label }]) => (
                            <option key={k} value={k}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs ${overdue ? "text-amber-600 font-bold" : "text-slate-500"}`}>
                        {formatRelative(p.createdAt)}
                      </span>
                      {p.contactedAt && (
                        <p className="text-[10px] text-green-600">Contacté {formatRelative(p.contactedAt)}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/prospects/${p.id}`}
                          title="Fiche"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {/* WhatsApp dropdown */}
                        <div className="relative group">
                          <button
                            title="WhatsApp"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-100 shadow-lg py-1 z-50 hidden group-hover:block">
                            {(Object.keys(PROSPECT_MESSAGE_LABELS) as ProspectMessageType[]).map(type => (
                              <a
                                key={type}
                                href={getProspectWhatsAppUrl(type, p)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-3 py-2 text-xs text-slate-700 hover:bg-green-50 hover:text-green-700"
                              >
                                {PROSPECT_MESSAGE_LABELS[type]}
                              </a>
                            ))}
                          </div>
                        </div>
                        {!p.contactedAt && (
                          <button
                            onClick={() => handleMarkContacted(p.id)}
                            disabled={actionLoading === p.id}
                            title="Marquer contacté"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors disabled:opacity-50"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!p.convertedCustomerId && (
                          <button
                            onClick={() => handleConvert(p.id)}
                            disabled={actionLoading === p.id}
                            title="Convertir en client"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleCreateTask(p.id, p.fullName)}
                          disabled={actionLoading === p.id}
                          title="Créer tâche relance"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors disabled:opacity-50"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <Link
                            href={`/admin/prospects/${p.id}/modifier`}
                            title="Modifier"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteStart(p)}
                            title="Supprimer"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
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
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <UserPlus className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold">Aucun prospect trouvé</p>
            <p className="text-xs mt-1">Partagez le lien du formulaire sur WhatsApp pour recevoir des prospects.</p>
          </div>
        )}
      </div>
    </div>
  );
}
