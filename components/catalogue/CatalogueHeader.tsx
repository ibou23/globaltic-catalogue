"use client";

import { motion } from "framer-motion";

export function CatalogueHeader() {
  return (
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
          Parcourez nos solutions d&apos;impression professionnelles. Tout est
          personnalisable et produit dans notre atelier à Dakar.
        </motion.p>
      </div>
    </section>
  );
}
