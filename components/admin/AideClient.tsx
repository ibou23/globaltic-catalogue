"use client";

import { useState, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Search, X, Download, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type React from "react";

// Convertit un titre Markdown en id d'ancre, en gérant les accents français
function toAnchor(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // supprime les diacritiques (é→e, ô→o…)
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Extrait le texte brut d'un nœud React (pour générer les IDs des titres)
function nodeText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (node !== null && node !== undefined && typeof node === "object" && "props" in node) {
    return nodeText((node as React.ReactElement<{ children?: React.ReactNode }>).props.children);
  }
  return "";
}

// IDs dérivés des titres H2 réels du guide (toAnchor appliqué aux textes exacts)
const SECTIONS = [
  { id: "1-introduction",                    label: "Introduction" },
  { id: "2-connexion",                        label: "Connexion" },
  { id: "3-vue-densemble-du-dashboard",       label: "Vue d'ensemble" },
  { id: "4-gestion-du-catalogue",             label: "Catalogue" },
  { id: "5-import-export-csv",                label: "Import / Export CSV" },
  { id: "6-gestion-des-devis",                label: "Devis" },
  { id: "7-gestion-des-commandes",            label: "Commandes" },
  { id: "8-paiements",                        label: "Paiements" },
  { id: "9-fichiers-et-bat",                  label: "Fichiers & BAT" },
  { id: "10-journal-dactivite",               label: "Journal d'activité" },
  { id: "11-notifications",                   label: "Notifications" },
  { id: "12-utilisateurs-et-roles",           label: "Utilisateurs & Rôles" },
  { id: "13-parametres-business",             label: "Paramètres" },
  { id: "14-bonnes-pratiques",                label: "Bonnes pratiques" },
  { id: "15-faq-depannage",                   label: "FAQ / Dépannage" },
];

interface AideClientProps {
  content: string;
}

export function AideClient({ content }: AideClientProps) {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Filtre par sections H2 qui contiennent le terme recherché
  const displayedContent = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return content;
    const blocks = content.split(/(?=^## )/m);
    const matched = blocks.filter((block) => block.toLowerCase().includes(q));
    if (matched.length === 0) return "_Aucun résultat pour cette recherche._";
    return matched.join("\n");
  }, [content, query]);

  const handleSectionClick = useCallback((id: string) => {
    setActiveSection(id);
    setQuery("");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GUIDE_ADMIN_GLOBAL_TIC.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [content]);

  return (
    <div className="flex gap-6 items-start">

      {/* ── Navigation latérale (desktop uniquement) ────────────────────── */}
      <aside className="hidden xl:flex flex-col w-56 shrink-0 sticky top-6 gap-1">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Sections
        </p>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSectionClick(s.id)}
            className={cn(
              "text-left text-sm px-3 py-2 rounded-lg transition-colors",
              activeSection === s.id
                ? "bg-brand-primary/10 text-brand-primary font-semibold"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {s.label}
          </button>
        ))}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-primary transition-colors px-3 py-2 rounded-lg hover:bg-slate-100 w-full"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Télécharger le guide</span>
          </button>
        </div>
      </aside>

      {/* ── Contenu principal ────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Barre de recherche + bouton télécharger */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher… (devis, BAT, paiement, commande…)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleDownload}
            className="xl:hidden flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger</span>
          </button>
        </div>

        {/* Navigation rapide par section (mobile/tablette) */}
        <div className="xl:hidden mb-6 flex gap-2 flex-wrap">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSectionClick(s.id)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Indicateur de recherche active */}
        {query && (
          <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
            <BookOpen className="w-4 h-4" />
            <span>
              Résultats pour <strong className="text-slate-700">"{query}"</strong>
            </span>
          </div>
        )}

        {/* Contenu Markdown rendu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1
                  id={toAnchor(nodeText(children))}
                  className="text-2xl font-black text-slate-900 mb-6 pb-4 border-b-2 border-brand-primary/20 scroll-mt-6"
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2
                  id={toAnchor(nodeText(children))}
                  className="text-xl font-bold text-slate-800 mt-10 mb-4 pb-2 border-b border-slate-200 scroll-mt-6"
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  id={toAnchor(nodeText(children))}
                  className="text-base font-bold text-slate-700 mt-6 mb-3 scroll-mt-6"
                >
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-sm text-slate-700 leading-relaxed mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="mb-4 pl-5 list-disc space-y-1.5">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-4 pl-5 list-decimal space-y-1.5">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-sm text-slate-700 leading-relaxed">
                  {children}
                </li>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-6 rounded-xl border border-slate-200">
                  <table className="w-full text-sm border-collapse">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-slate-50 text-left">
                  {children}
                </thead>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-sm text-slate-700 border-b border-slate-100">
                  {children}
                </td>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-slate-50/50 transition-colors">
                  {children}
                </tr>
              ),
              // pre gère les blocs de code ; code gère l'inline
              pre: ({ children }) => (
                <div className="mb-4 rounded-xl overflow-hidden">
                  {children}
                </div>
              ),
              code: ({ children, className }) => {
                const isBlock = !!className;
                if (isBlock) {
                  return (
                    <code className="block bg-slate-900 text-emerald-400 text-xs p-4 rounded-xl overflow-x-auto font-mono leading-relaxed">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="bg-slate-100 text-brand-primary text-xs px-1.5 py-0.5 rounded font-mono">
                    {children}
                  </code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-brand-primary/40 pl-4 py-1 my-4 bg-brand-primary/5 rounded-r-lg text-sm text-slate-600 italic">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="my-8 border-slate-200" />,
              strong: ({ children }) => (
                <strong className="font-semibold text-slate-900">{children}</strong>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-brand-primary underline hover:text-brand-primary/80 transition-colors"
                >
                  {children}
                </a>
              ),
            }}
          >
            {displayedContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
