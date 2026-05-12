"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight, Printer, Sparkles, TrendingUp, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { Product, Category } from "@/types/product";

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ products: Product[]; categories: Category[] }>({ products: [], categories: [] });
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Suggestions de recherches populaires
  const popularSearches = ["Carte de visite", "Flyer", "Bâche", "T-shirt", "Calendrier", "Vinyle"];

  // Fermer la recherche au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults({ products: [], categories: [] });
      return;
    }

    const timeoutId = setTimeout(() => {
      const searchTerms = query.toLowerCase().split(" ");
      
      const filteredProducts = products.filter(p => {
        const nameMatch = p.name.toLowerCase();
        const descMatch = (p.shortDescription || "").toLowerCase();
        const tagsMatch = (p.tags || []).join(" ").toLowerCase();
        return searchTerms.every(term => 
          nameMatch.includes(term) || descMatch.includes(term) || tagsMatch.includes(term)
        );
      }).slice(0, 5);

      const filteredCategories = categories.filter(c => {
        const nameMatch = c.name.toLowerCase();
        return searchTerms.every(term => nameMatch.includes(term));
      }).slice(0, 3);

      setResults({ products: filteredProducts, categories: filteredCategories });
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsFocused(true);
  };

  return (
    <div className="relative w-full max-w-sm lg:max-w-md" ref={searchRef}>
      {/* Desktop Search Bar (and now visible on Mobile too) */}
      <div className="relative group flex-grow lg:flex-grow-0 lg:w-full">
        <div className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-colors ${isFocused ? 'text-brand-primary' : 'text-slate-400'}`}>
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <input
          type="text"
          className={`block w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-100/50 border-2 transition-all duration-300 rounded-xl sm:rounded-2xl text-[12px] sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white ${
            isFocused 
              ? "border-brand-primary ring-4 ring-brand-primary/10 shadow-lg" 
              : "border-transparent hover:bg-slate-100 group-hover:border-slate-200"
          }`}
          placeholder="Rechercher..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (window.innerWidth < 1024) {
              setIsOpen(true);
            } else {
              setIsFocused(true);
            }
          }}
        />
        
        {query && !isOpen && (
          <button 
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Desktop Dropdown Results */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[60] hidden lg:block max-h-[70vh] overflow-y-auto"
          >
            <div className="p-4 space-y-6">
              {query.length < 2 ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 px-2">
                      <TrendingUp className="h-3 w-3" /> Recherches populaires
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((item) => (
                        <button
                          key={item}
                          onClick={() => handleSuggestionClick(item)}
                          className="px-4 py-1.5 rounded-full bg-slate-50 text-slate-600 text-xs font-bold hover:bg-brand-primary hover:text-white transition-all border border-slate-100"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 px-2 mb-3">
                      <Clock className="h-3 w-3" /> Suggestions rapides
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {categories.slice(0, 4).map(cat => (
                        <Link 
                          key={cat.id} 
                          href={`/catalogue/${cat.slug}`}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                          onClick={() => setIsFocused(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                              <Printer className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all text-brand-primary" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {results.categories.length > 0 && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-3">Catégories</div>
                      <div className="grid grid-cols-1 gap-1">
                        {results.categories.map(cat => (
                          <Link 
                            key={cat.id} 
                            href={`/catalogue/${cat.slug}`}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                            onClick={() => setIsFocused(false)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                              {cat.name[0]}
                            </div>
                            <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.products.length > 0 && (
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-3">Produits</div>
                      <div className="grid grid-cols-1 gap-1">
                        {results.products.map(prod => (
                          <Link 
                            key={prod.id} 
                            href={`/produit/${prod.slug}`}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                            onClick={() => setIsFocused(false)}
                          >
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden relative">
                              {prod.imageUrls?.[0] && (
                                <img src={prod.imageUrls[0]} alt={prod.name} className="object-cover w-full h-full" />
                              )}
                            </div>
                            <div className="flex-grow">
                              <div className="text-sm font-bold text-slate-800 group-hover:text-brand-primary transition-colors">{prod.name}</div>
                              <div className="text-[10px] text-slate-400 line-clamp-1">{prod.shortDescription}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.products.length === 0 && results.categories.length === 0 && (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">Aucun résultat pour "{query}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-4 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium italic">Astuce: Essayez "carte" ou "flyer"</span>
              <Link 
                href="/catalogue" 
                className="text-xs font-black text-brand-primary flex items-center gap-1 hover:underline"
                onClick={() => setIsFocused(false)}
              >
                Catalogue complet <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Search Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[100] lg:hidden flex flex-col"
          >
            <div className="p-4 flex items-center gap-4 border-b border-slate-100">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-primary" />
                <input
                  autoFocus
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-2xl text-base font-bold focus:outline-none"
                  placeholder="Rechercher..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 bg-white rounded-full">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-sm font-black text-slate-500 px-2"
              >
                Fermer
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-8">
              {query.length < 2 ? (
                <>
                  <div className="space-y-4">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Recherches populaires
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((item) => (
                        <button
                          key={item}
                          onClick={() => handleSuggestionClick(item)}
                          className="px-5 py-2.5 rounded-xl bg-slate-50 text-slate-700 text-sm font-bold border border-slate-100 shadow-sm"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Printer className="h-4 w-4" /> Catégories
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {categories.map(cat => (
                        <Link 
                          key={cat.id} 
                          href={`/catalogue/${cat.slug}`}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-base font-bold text-slate-700">{cat.name}</span>
                          <ArrowRight className="h-5 w-5 text-brand-primary" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-8">
                   {results.categories.length > 0 && (
                    <div className="space-y-4">
                      <div className="text-xs font-black uppercase tracking-widest text-slate-400">Catégories</div>
                      <div className="grid grid-cols-1 gap-2">
                        {results.categories.map(cat => (
                          <Link 
                            key={cat.id} 
                            href={`/catalogue/${cat.slug}`}
                            className="flex items-center justify-between p-4 bg-brand-primary/5 rounded-2xl"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="text-base font-bold text-brand-primary">{cat.name}</span>
                            <ArrowRight className="h-5 w-5" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.products.length > 0 && (
                    <div className="space-y-4">
                      <div className="text-xs font-black uppercase tracking-widest text-slate-400">Produits</div>
                      <div className="grid grid-cols-1 gap-4">
                        {results.products.map(prod => (
                          <Link 
                            key={prod.id} 
                            href={`/produit/${prod.slug}`}
                            className="flex items-center gap-4 p-3 border border-slate-100 rounded-2xl shadow-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden relative flex-shrink-0">
                               {prod.imageUrls?.[0] && (
                                <img src={prod.imageUrls[0]} alt={prod.name} className="object-cover w-full h-full" />
                              )}
                            </div>
                            <div className="flex-grow">
                              <div className="text-base font-bold text-slate-800">{prod.name}</div>
                              <div className="text-xs text-slate-400 line-clamp-1">{prod.shortDescription}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.products.length === 0 && results.categories.length === 0 && (
                    <div className="py-20 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="h-10 w-10 text-slate-200" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-700 mb-2">Aucun résultat</h3>
                      <p className="text-slate-400">Essayez avec d'autres mots-clés comme "bâche" ou "flyer".</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 mt-auto">
              <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/20" asChild>
                <Link href="/catalogue" onClick={() => setIsOpen(false)}>
                   Parcourir tout le catalogue
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
