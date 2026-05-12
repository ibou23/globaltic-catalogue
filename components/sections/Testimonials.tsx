"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Moussa Diop",
    role: "Responsable Marketing",
    company: "Dakar Tech",
    content: "Une qualité d'impression exceptionnelle et un respect des délais impressionnant. Notre partenaire de confiance à Dakar.",
    rating: 5
  },
  {
    name: "Awa Ndiaye",
    role: "Fondatrice",
    company: "Awa Beauty",
    content: "Le configurateur est un vrai gain de temps. Je reçois mon devis instantanément et le rendu final est toujours parfait.",
    rating: 5
  },
  {
    name: "Jean-Pierre Sarr",
    role: "Chef de projet",
    company: "BTP Sénégal",
    content: "Pour nos bâches grand format, GLOBAL TIC est imbattable sur la précision des couleurs et la résistance des supports.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-brand-secondary mb-4 font-heading tracking-tight">Ils nous font confiance</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Plus de 500 entreprises sénégalaises s'appuient sur notre expertise pour leur communication visuelle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-3xl bg-slate-50 border border-slate-100 relative group hover:bg-white hover:shadow-2xl transition-all duration-500"
            >
              <Quote className="absolute top-6 right-6 h-8 w-8 text-brand-primary/10 group-hover:text-brand-primary/20 transition-colors" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-brand-primary text-brand-primary" />
                ))}
              </div>

              <p className="text-slate-600 mb-8 italic leading-relaxed">"{t.content}"</p>
              
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-brand-primary/20 flex items-center justify-center font-bold text-brand-primary">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-brand-secondary">{t.name}</h4>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{t.role} • {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
