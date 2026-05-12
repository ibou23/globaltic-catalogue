"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export function RealisationsHeader() {
  return (
    <section className="pt-32 pb-20 bg-brand-secondary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-secondary/0 to-brand-secondary/80 z-0"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            href="/catalogue"
            className="inline-flex items-center text-brand-primary-light hover:text-white transition-colors mb-8 font-bold bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au catalogue
          </Link>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-7xl font-black mb-6 font-heading tracking-tight"
        >
          L&apos;excellence en{" "}
          <span className="text-brand-primary-light">Images</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          Explorez notre galerie de projets réalisés pour nos clients. Du
          textile au grand format, découvrez la qualité GLOBAL TIC.
        </motion.p>
      </div>
    </section>
  );
}
