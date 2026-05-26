"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "./SearchBar";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50 py-2" : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-8 justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group" aria-label="Retour à l'accueil GLOBAL TIC" title="Accueil GLOBAL TIC">
              <div className="relative overflow-hidden rounded-xl p-1 transition-transform duration-300 group-hover:scale-105">
                <img src="/logo.png" alt="GLOBAL TIC" className="h-10 w-auto object-contain" />
              </div>
            </Link>
          </div>

          {/* Search Bar - Center on Desktop, Icon on Mobile */}
          <div className="flex-grow flex justify-center lg:justify-start lg:max-w-md">
            <SearchBar />
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors relative group">
                Accueil
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/catalogue" className="text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors relative group">
                Catalogue
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/realisations" className="text-sm font-semibold text-slate-600 hover:text-brand-primary transition-colors relative group">
                Réalisations
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>
            
            <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>

            <Button asChild className="focus-visible:ring-2 focus-visible:ring-brand-primary shadow-lg shadow-brand-primary/10 rounded-xl px-6">
              <Link href="/catalogue" aria-label="Démarrer un nouveau projet d'impression">
                Projet <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="text-brand-secondary hover:text-brand-primary p-2 transition-colors ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xl overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 space-y-2">
              <Link 
                href="/" 
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-bold text-brand-secondary hover:bg-slate-50 hover:text-brand-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
              <Link 
                href="/catalogue" 
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-bold text-brand-secondary hover:bg-slate-50 hover:text-brand-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catalogue complet <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
              <Link 
                href="/realisations" 
                className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-bold text-brand-secondary hover:bg-slate-50 hover:text-brand-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nos Réalisations <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
              
              <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col gap-4">
                <Button size="lg" className="w-full justify-center h-14 rounded-2xl text-lg font-black shadow-xl shadow-brand-primary/20" asChild>
                  <Link href="/catalogue" onClick={() => setIsMobileMenuOpen(false)}>Démarrer un projet</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
