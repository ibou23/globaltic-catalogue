"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, ShoppingCart, Users, Package, Image, Paperclip } from "lucide-react";
import type { AdminRole } from "@/lib/types/domain";
import type { SearchResultType, SearchResult } from "@/lib/db/global-search";
import { globalSearchAction } from "@/lib/actions/global-search";

interface GlobalSearchProps {
  role: AdminRole;
}

const TYPE_LABELS: Record<SearchResultType, string> = {
  commande: "Commandes",
  devis: "Devis",
  client: "Clients",
  produit: "Produits",
  realisation: "Réalisations",
  fichier: "Fichiers",
};

const TYPE_ICONS: Record<SearchResultType, React.ReactNode> = {
  commande: <ShoppingCart className="w-3.5 h-3.5" />,
  devis: <FileText className="w-3.5 h-3.5" />,
  client: <Users className="w-3.5 h-3.5" />,
  produit: <Package className="w-3.5 h-3.5" />,
  realisation: <Image className="w-3.5 h-3.5" />,
  fichier: <Paperclip className="w-3.5 h-3.5" />,
};

const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
  en_attente: "En attente",
  confirmee: "Confirmée",
  bat_en_cours: "BAT en cours",
  bat_valide: "BAT validé",
  en_production: "En production",
  controle_qualite: "Contrôle qualité",
  pret: "Prêt",
  en_livraison: "En livraison",
  livre: "Livré",
  annulee: "Annulée",
};

function groupByType(results: SearchResult[]): Map<SearchResultType, SearchResult[]> {
  const map = new Map<SearchResultType, SearchResult[]>();
  for (const r of results) {
    if (!map.has(r.type)) map.set(r.type, []);
    map.get(r.type)!.push(r);
  }
  return map;
}

export function GlobalSearch({ role: _role }: GlobalSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flatResults = results;

  const search = useCallback((q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    startTransition(async () => {
      const res = await globalSearchAction(q);
      if (res.data) {
        setResults(res.data);
        setActiveIndex(-1);
      }
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handleGlobal(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleGlobal);
    return () => document.removeEventListener("keydown", handleGlobal);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleClose() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && flatResults[activeIndex]) {
        navigate(flatResults[activeIndex]);
      }
    } else if (e.key === "Escape") {
      handleClose();
    }
  }

  function navigate(result: SearchResult) {
    handleClose();
    router.push(result.link);
  }

  const grouped = groupByType(results);
  const showDropdown = open && query.trim().length >= 2;

  // Build flat ordered list for keyboard nav
  const orderedFlat: SearchResult[] = [];
  for (const [, group] of grouped) {
    orderedFlat.push(...group);
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
        title="Recherche (Ctrl+K)"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Overlay backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={handleClose} />
      )}

      {/* Search panel */}
      {open && (
        <div className="fixed left-0 right-0 top-0 sm:left-1/2 sm:top-[80px] sm:-translate-x-1/2 sm:w-full sm:max-w-[600px] z-50 sm:px-4">
          <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 overflow-hidden min-h-screen sm:min-h-0">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher une commande, un client, un produit…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                  className="shrink-0 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
                ESC
              </kbd>
            </div>

            {/* Results */}
            {showDropdown && (
              <div className="max-h-[420px] overflow-y-auto py-2">
                {isPending && results.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs text-slate-400">Recherche en cours…</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-xs font-bold text-slate-400">Aucun résultat pour &quot;{query}&quot;</p>
                    <p className="text-[11px] text-slate-300 mt-1">Essayez avec une référence, un nom ou un numéro</p>
                  </div>
                ) : (
                  (() => {
                    let globalIdx = 0;
                    const sections: React.ReactNode[] = [];
                    for (const [type, group] of grouped) {
                      const startIdx = globalIdx;
                      globalIdx += group.length;
                      sections.push(
                        <div key={type} className="mb-1">
                          {/* Group label */}
                          <div className="flex items-center gap-1.5 px-4 py-1.5">
                            <span className="text-slate-400">{TYPE_ICONS[type]}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{TYPE_LABELS[type]}</span>
                          </div>
                          {group.map((result, i) => {
                            const idx = startIdx + i;
                            const isActive = idx === activeIndex;
                            return (
                              <button
                                key={result.id}
                                onClick={() => navigate(result)}
                                onMouseEnter={() => setActiveIndex(idx)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isActive ? "bg-brand-primary/8 text-slate-800" : "hover:bg-slate-50 text-slate-700"}`}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate">{result.title}</p>
                                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{result.subtitle}</p>
                                </div>
                                {result.status && (
                                  <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-500">
                                    {STATUS_LABELS[result.status] ?? result.status}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    }
                    return sections;
                  })()
                )}
              </div>
            )}

            {/* Footer hint */}
            {showDropdown && results.length > 0 && (
              <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 bg-slate-50/60">
                <span className="text-[10px] text-slate-400"><kbd className="font-mono">↑↓</kbd> Naviguer</span>
                <span className="text-[10px] text-slate-400"><kbd className="font-mono">↵</kbd> Ouvrir</span>
                <span className="text-[10px] text-slate-400"><kbd className="font-mono">ESC</kbd> Fermer</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
