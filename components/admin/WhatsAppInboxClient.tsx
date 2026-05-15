"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  User,
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
} from "lucide-react";
import type { WhatsAppMessage } from "@/lib/types/domain";
import { markWhatsAppMessageProcessedAction } from "@/lib/actions/whatsapp";

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
  const [filter, setFilter] = useState<"all" | "unprocessed">("all");

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (m.phoneNumber?.includes(q) ?? false) ||
      (m.contactName?.toLowerCase().includes(q) ?? false) ||
      (m.content?.toLowerCase().includes(q) ?? false);

    const matchesFilter = filter === "all" || !m.processed;

    return matchesSearch && matchesFilter;
  });

  const unprocessedCount = messages.filter(m => !m.processed).length;

  async function handleMarkProcessed(id: string) {
    const result = await markWhatsAppMessageProcessedAction(id);
    if (!result.error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, processed: true } : m));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">Messages WhatsApp</h1>
        <p className="text-sm text-slate-400 mt-1">
          {messages.length} message{messages.length !== 1 ? "s" : ""} reçu{messages.length !== 1 ? "s" : ""}
          {unprocessedCount > 0 && (
            <span className="ml-2 text-blue-600 font-semibold">· {unprocessedCount} non traité{unprocessedCount !== 1 ? "s" : ""}</span>
          )}
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro, nom ou contenu..."
            className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`h-11 px-4 rounded-xl text-sm font-bold transition-colors ${
              filter === "all" ? "bg-brand-primary text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-primary/30"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter("unprocessed")}
            className={`h-11 px-4 rounded-xl text-sm font-bold transition-colors ${
              filter === "unprocessed" ? "bg-brand-primary text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-brand-primary/30"
            }`}
          >
            Non traités ({unprocessedCount})
          </button>
        </div>
      </div>

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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {m.contactName || m.phoneNumber || "Inconnu"}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium shrink-0">
                      {TYPE_LABELS[m.messageType] ?? m.messageType}
                    </span>
                  </div>
                  {m.contactName && m.phoneNumber && (
                    <p className="text-[11px] text-slate-400 mt-0.5">{m.phoneNumber}</p>
                  )}
                  {m.content && (
                    <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{m.content}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
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
                        <User className="w-3 h-3" /> Prospect
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                    {m.customerId && (
                      <Link
                        href={`/admin/clients`}
                        className="flex items-center gap-1 text-emerald-600 hover:underline"
                      >
                        <User className="w-3 h-3" /> Client
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!m.processed ? (
                  <button
                    onClick={() => handleMarkProcessed(m.id)}
                    title="Marquer comme traité"
                    className="w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                ) : (
                  <span title="Traité" className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center">
                    <Circle className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold">Aucun message WhatsApp</p>
            <p className="text-xs mt-1">Les messages entrants apparaîtront ici une fois le webhook Meta configuré.</p>
          </div>
        )}
      </div>
    </div>
  );
}
