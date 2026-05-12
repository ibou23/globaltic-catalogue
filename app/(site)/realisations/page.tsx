"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, X, Maximize2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FullCatalogueCTA } from "@/components/sections/FullCatalogueCTA";
import { realisations, realisationCategories, Realisation } from "@/data/realisations";

export default function RealisationsPage() {
  const [activeCategory, setActiveCategory] = React.useState("Tous");
  const [selectedImage, setSelectedImage] = React.useState<Realisation | null>(null);

  const filteredRealisations = activeCategory === "Tous" 
    ? realisations 
    : realisations.filter(r => r.category === activeCategory);

  return (
    <div className="flex flex-col flex-1 bg-slate-50/50 pb-24">
      {/* Header Section */}
      <section className="pt-32 pb-20 bg-brand-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-secondary/0 to-brand-secondary/80 z-0"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/catalogue" className="inline-flex items-center text-brand-primary-light hover:text-white transition-colors mb-8 font-bold bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour au catalogue
            </Link>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-black mb-6 font-heading tracking-tight"
          >
            L'excellence en <span className="text-brand-primary-light">Images</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Explorez notre galerie de projets réalisés pour nos clients. Du textile au grand format, découvrez la qualité GLOBAL TIC.
          </motion.p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-start md:justify-center gap-2 min-w-max">
            {realisationCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  activeCategory === cat
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          layout
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-8 space-y-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredRealisations.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="break-inside-avoid relative rounded-3xl overflow-hidden group cursor-pointer bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:border-brand-primary/20 transition-all duration-500"
                onClick={() => setSelectedImage(item)}
              >
                <div className="relative">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={600}
                    height={800}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/90 via-brand-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-brand-primary-light text-xs font-black uppercase tracking-widest mb-1">{item.category}</p>
                      <h3 className="text-white font-bold text-lg leading-tight mb-2">{item.title}</h3>
                      {item.client && (
                        <p className="text-slate-300 text-sm italic">Client: {item.client}</p>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredRealisations.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-slate-400 text-lg">Aucun projet trouvé dans cette catégorie.</p>
          </div>
        )}
      </main>

      <FullCatalogueCTA />

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-secondary/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 md:top-12 md:right-12 text-white/50 hover:text-white transition-colors z-50 p-2"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-10 h-10" />
            </button>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full max-h-full overflow-hidden rounded-3xl shadow-2xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 h-full max-h-[85vh]">
                <div className="md:col-span-8 bg-slate-100 relative min-h-[300px] md:min-h-0">
                  <Image
                    src={selectedImage.imageUrl}
                    alt={selectedImage.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="md:col-span-4 p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-brand-primary font-black text-xs uppercase tracking-[0.2em] mb-4 block">
                    {selectedImage.category}
                  </span>
                  <h2 className="text-3xl font-black text-brand-secondary mb-6 leading-tight">
                    {selectedImage.title}
                  </h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Client</p>
                      <p className="text-brand-secondary font-bold">{selectedImage.client || "Confidentiel"}</p>
                    </div>
                    <p className="text-slate-500 leading-relaxed">
                      Réalisation premium utilisant nos technologies d'impression haute définition. 
                      Support durable et rendu des couleurs fidèle à la charte graphique.
                    </p>
                    <Button className="w-full h-14 rounded-2xl font-bold" asChild>
                      <Link href="/catalogue">
                        Demander un devis similaire <ExternalLink className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
