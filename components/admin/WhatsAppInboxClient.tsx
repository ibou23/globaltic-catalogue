"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  User,
  Users,
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
  UserPlus,
  ClipboardList,
  MessageCircle,
  Calendar,
} from "lucide-react";
import type { WhatsAppMessage } from "@/lib/types/domain";
import {
  markWhatsAppMessageProcessedAction,
  unmarkWhatsAppMessageProcessedAction,
  createProspectFromMessageAction,
  createTaskFromMessageAction,
} from "@/lib/actions/whatsapp";
import { siteConfig } from "@/lib/config/site";

type InboxFilter = "all" | "unprocessed" | "clients" | "prospects" | "new" | "today";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-SN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function buildWhatsAppLink(phone: string): string {
  const number = phone.replace(/[^0-9]/g, "") || siteConfig.whatsapp;
  return `https://wa.me/${number}`;
}

const TYPE_LABELS: Record<string, string> = {
  text: "Texte",
  image: "Image",
  document: "Document",
  audio: "Audio",
  other: "Autre",
};

interface WhatsAppInboxClientProps {
  messages: WhatsAppMessage[];
}

export function WhatsAppInboxClient({ messages: initialMessages }: WhatsAppInboxClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }

  const filterFn = (m: WhatsAppMessage): boolean => {
    switch (filter) {
      case "unprocessed": return !m.processed;
      case "clients": return !!m.customerId;
      case "prospects": return !!m.prospectId;
      case "new": return !m.prospectId && !m.customerId;
      case "today": return isToday(m.sentAt);
      default: return true;
    }
  };

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (m.phoneNumber?.includes(q) ?? false) ||
      (m.contactName?.toLowerCase().includes(q) ?? false) ||
      (m.content?.toLowerCase().includes(q) ?? false);

    return matchesSearch && filterFn(m);
  });

  const counts = {
    all: messages.length,
    unprocessed: messages.filter(m => !m.processed).length,
    clients: messages.filter(m => !!m.customerId).length,
    prospects: messages.filter(m => !!m.prospectId).length,
    new: messages.filter(m => !m.prospectId && !m.customerId).length,
    today: messages.filter(m => isToday(m.sentAt)).length,
  };

  const tabs: { key: InboxFilter; label: string; count: number }[] = [
    { key: "all", label: "Tous", count: counts.all },
    { key: "unprocessed", label: "Non traités", count: counts.unprocessed },
    { key: "new", label: "Nouveaux", count: counts.new },
    { key: "prospects", label: "Prospects", count: counts.prospects },
    { key: "clients", label: "Clients", count: counts.clients },
    { key: "today", label: "Aujourd'hui", count: counts.today },
  ];

  async function handleToggleProcessed(id: string, current: boolean) {
    setActionLoading(id);
    const result = current
      ? await unmarkWhatsAppMessageProcessedAction(id)
      : await markWhatsAppMessageProcessedAction(id);
    if (!result.error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, processed: !current } : m));
    }
    setActionLoading(null);
  }

  async function handleCreateProspect(m: WhatsAppMessage) {
    setActionLoading(m.id);
    const result = await createProspectFromMessageAction(
      m.id,
      m.phoneNumber || "",
      m.contactName,
      m.content
    );
    if (result.data) {
      setMessages(prev => prev.map(msg =>
        msg.id === m.id ? { ...msg, prospectId: result.data!.id, processed: true } : msg
      ));
      showFeedback(`Prospect "${result.data.fullName}" créé`);
    }
    setActionLoading(null);
  }

  async function handleCreateTask(m: WhatsAppMessage) {
    setActionLoading(m.id);
    const result = await createTaskFromMessageAction(
      m.id,
      m.phoneNumber || "",
      m.contactName,
      m.content,
      m.prospectId
    );
    if (result.data) {
      setMessages(prev => prev.map(msg =>
        msg.id === m.id ? { ...msg, processed: true } : msg
      ));
      showFeedback("Tâche de relance créée");
    }
    setActionLoading(null);
  }

  function getContactBadge(m: WhatsAppMessage) {
    if (m.customerId) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">
          <Users className="w-2.5 h-2.5" /> Client
        </span>
      );
    }
    if (m.prospectId) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
          <User className="w-2.5 h-2.5" /> Prospect
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">
        <UserPlus className="w-2.5 h-2.5" /> Nouveau
      </span>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Inbox WhatsApp</h1>
        <p className="text-sm text-slate-400 mt-1">
          {messages.length} message{messages.length !== 1 ? "s" : ""} reçu{messages.length !== 1 ? "s" : ""}
          {counts.unprocessed > 0 && (
            <span className="ml-2 text-blue-600 font-semibold">· {counts.unprocessed} à traiter</span>
          )}
        </p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-semibold border border-green-200">
          {feedback}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              filter === tab.key
                ? "bg-brand-primary text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-brand-primary/30"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                filter === tab.key ? "bg-white/20" : "bg-slate-100"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par numéro, nom ou contenu..."
          className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
        />
      </div>

      {/* Compteur */}
      {(search || filter !== "all") && (
        <p className="text-xs text-slate-400">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Liste messages */}
      <div className="space-y-2">
        {filtered.map((m) => (
          <div
            key={m.id}
            className={`bg-white rounded-2xl border p-4 transition-colors ${
              m.processed ? "border-slate-100" : "border-blue-200 bg-blue-50/30"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  m.processed ? "bg-slate-100" : "bg-green-100"
                }`}>
                  <MessageSquare className={`w-4 h-4 ${m.processed ? "text-slate-400" : "text-green-600"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {m.contactName || m.phoneNumber || "Inconnu"}
                    </p>
                    {getContactBadge(m)}
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                      {TYPE_LABELS[m.messageType] ?? m.messageType}
                    </span>
                  </div>
                  {m.contactName && m.phoneNumber && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{m.phoneNumber}</p>
                  )}
                  {m.content && (
                    <p className="text-sm text-slate-600 mt-1.5 line-clamp-3">{m.content}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(m.sentAt)}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span>{formatRelative(m.sentAt)}</span>
                    {m.prospectId && (
                      <Link
                        href={`/admin/prospects/${m.prospectId}`}
                        className="flex items-center gap-1 text-brand-primary hover:underline"
                      >
                        <User className="w-3 h-3" /> Fiche prospect
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                    {m.customerId && (
                      <Link
                        href="/admin/clients"
                        className="flex items-center gap-1 text-emerald-600 hover:underline"
                      >
                        <Users className="w-3 h-3" /> Fiche client
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>

                  {/* Actions rapides */}
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {m.phoneNumber && (
                      <a
                        href={buildWhatsAppLink(m.phoneNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 px-2.5 rounded-lg bg-green-100 text-green-700 text-[11px] font-bold flex items-center gap-1 hover:bg-green-200 transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" /> Répondre
                      </a>
                    )}
                    {!m.prospectId && !m.customerId && (
                      <button
                        onClick={() => handleCreateProspect(m)}
                        disabled={actionLoading === m.id}
                        className="h-7 px-2.5 rounded-lg bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1 hover:bg-blue-200 transition-colors disabled:opacity-50"
                      >
                        <UserPlus className="w-3 h-3" /> Créer prospect
                      </button>
                    )}
                    <button
                      onClick={() => handleCreateTask(m)}
                      disabled={actionLoading === m.id}
                      className="h-7 px-2.5 rounded-lg bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-200 transition-colors disabled:opacity-50"
                    >
                      <ClipboardList className="w-3 h-3" /> Tâche
                    </button>
                    <button
                      onClick={() => handleToggleProcessed(m.id, m.processed)}
                      disabled={actionLoading === m.id}
                      title={m.processed ? "Marquer non traité" : "Marquer traité"}
                      className={`h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50 ${
                        m.processed
                          ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {m.processed ? (
                        <><Circle className="w-3 h-3" /> Non traité</>
                      ) : (
                        <><CheckCircle2 className="w-3 h-3" /> Traité</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold">Aucun message trouvé</p>
            <p className="text-xs mt-1">
              {filter === "all"
                ? "Les messages entrants apparaîtront ici."
                : "Aucun message dans cette catégorie."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
