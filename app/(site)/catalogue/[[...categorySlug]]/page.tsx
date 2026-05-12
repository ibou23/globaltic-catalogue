"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowRight, Settings2, Sparkles, Filter, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FullCatalogueCTA } from "@/components/sections/FullCatalogueCTA";
import Image from "next/image";

export default function CataloguePage({ params }: { params: Promise<{ categorySlug?: string[] }> }) {
  const { categorySlug } = React.use(params);
  const slug = categorySlug?.[0];

  const initialCategory = slug 
    ? categories.find(c => c.slug === slug)?.id || "all"
    : "all";

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  useEffect(() => {
    if (slug) {
      const found = categories.find(c => c.slug === slug);
      if (found) setActiveCategory(found.id);
    } else {
      setActiveCategory("all");
    }
  }, [slug]);

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.categoryId === activeCategory);

  return (
    <div className="flex flex-col flex-1 bg-background pb-24">
      
      {/* Header Section */}
      <section className="pt-32 pb-16 bg-brand-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0,transparent_100%)]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 font-heading"
          >
            Le Catalogue
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-300"
          >
            Parcourez nos solutions d'impression professionnelles. Tout est personnalisable et produit dans notre atelier à Dakar.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Filter className="w-5 h-5" /> Filtrer par catégorie :
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeCategory === "all" 
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30" 
                  : "bg-white text-slate-600 border border-slate-200 hover:border-brand-primary/50 hover:bg-slate-50"
              }`}
            >
              Tous les produits
            </button>
            {categories.sort((a,b) => a.order - b.order).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={activeCategory === cat.id}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeCategory === cat.id 
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30" 
                    : "bg-white text-slate-600 border border-slate-200 hover:border-brand-primary/50 hover:bg-slate-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-200/50 pb-4">
          <span className="text-slate-500 font-medium">{filteredProducts.length} produits trouvés</span>
        </div>

        {/* Products Grid */}
        <motion.div 
          layout 
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => {
              const indicativePrice = product.quantityTiers[0]?.baseUnitPrice || 0;
              const category = categories.find(c => c.id === product.categoryId);

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/produit/${product.slug}`} className="block h-full group">
                    <Card className="h-full flex flex-col overflow-hidden bg-white hover:border-brand-primary/40 hover:shadow-xl transition-all duration-500">
                      
                      {/* Image Area */}
                      <div className="h-56 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100 group-hover:bg-brand-primary/5 transition-colors">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#529FD7_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        
                        {product.isPopular && (
                          <div className="absolute top-3 left-3 z-10 bg-brand-primary text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Populaire
                          </div>
                        )}
                        
                        {product.imageUrls[0] ? (
                          <Image
                            src={product.imageUrls[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-white rounded-xl shadow-sm rotate-6 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 flex items-center justify-center text-slate-300 relative z-0">
                             <ImageIcon className="w-8 h-8 opacity-50" />
                          </div>
                        )}
                      </div>

                      <CardHeader className="pt-5 pb-2">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-brand-primary mb-1">
                          {category?.name || "Produit"}
                        </div>
                        <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                      </CardHeader>
                      
                      <CardContent className="flex-grow pt-0 pb-4">
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {product.shortDescription || product.description}
                        </p>
                      </CardContent>

                      <CardFooter className="pt-3 sm:pt-4 border-t border-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-slate-50/50 gap-3 px-3 sm:px-6">
                        <div className="flex flex-row sm:flex-col justify-between items-center sm:items-start">
                          <div className="text-[10px] text-slate-500 font-medium">À partir de</div>
                          <div className="font-black text-brand-secondary">
                            {formatPrice(indicativePrice)}
                            <span className="text-xs font-normal text-slate-400">
                              /{ (product.tags.includes("m2") || product.slug === "vinyle-pre-decoupe") ? "m²" : "Unité"}
                            </span>
                          </div>
                        </div>
                        <Button variant="default" size="sm" className="w-full sm:w-auto h-10 sm:h-9 rounded-xl sm:rounded-full shadow-md group-hover:bg-brand-secondary group-hover:shadow-brand-secondary/30 transition-colors text-xs font-bold">
                          Configurer <Settings2 className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun produit trouvé</h3>
            <p className="text-slate-500">Nous enrichissons notre catalogue régulièrement. Revenez bientôt !</p>
            <Button variant="outline" className="mt-6" onClick={() => setActiveCategory("all")}>
              Voir tous les produits
            </Button>
          </div>
        )}

      </div>
      
      {activeCategory !== "all" && <FullCatalogueCTA />}
    </div>
  );
}
