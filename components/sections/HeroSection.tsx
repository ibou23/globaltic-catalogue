"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-12 lg:pt-40 lg:pb-32 overflow-hidden bg-mesh">
      <div className="absolute top-1/4 left-10 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-10 w-[600px] h-[600px] bg-[#132034]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-brand-primary/20 bg-white/60 backdrop-blur-md px-4 py-1.5 text-sm font-bold text-brand-primary mb-6 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand-primary mr-2 animate-pulse"></span>
              Nouveau : Devis en ligne instantané
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-[4.5rem] font-black text-brand-secondary tracking-tight leading-[1.05] mb-6 font-heading"
            >
              L&apos;impression premium. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-primary bg-[length:200%_auto] animate-gradient">
                Rapide & Sans friction.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-xl"
            >
              Global TIC transforme votre expérience d&apos;impression à Dakar.
              Configurez vos produits, obtenez un prix en temps réel et lancez la
              production en 3 clics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto h-16 sm:h-14 px-8 text-lg sm:text-base shadow-xl shadow-brand-primary/20 rounded-2xl"
                asChild
              >
                <Link href="/catalogue">
                  Créer mon projet <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="glass"
                size="lg"
                className="w-full sm:w-auto h-16 sm:h-14 px-8 text-lg sm:text-base bg-white/80 rounded-2xl"
                asChild
              >
                <a
                  href="https://wa.me/221776190419"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Commercial
                </a>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="mt-8 flex items-center gap-4 text-sm font-medium text-slate-500"
            >
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                  JD
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-500">
                  MK
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                  AL
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-primary/10 flex items-center justify-center text-xs font-bold text-brand-primary">
                  +500
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex text-[#D4A843]">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span>Recommandé par les pros à Dakar</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl bg-white/40 border border-white/60 shadow-2xl backdrop-blur-xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="rounded-xl overflow-hidden bg-white border border-slate-100 shadow-sm flex flex-col h-[450px]">
                <div className="h-12 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="p-6 flex-1 bg-center flex items-center justify-center opacity-80">
                  <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 w-3/4 transform -translate-y-4">
                    <div className="h-4 w-1/3 bg-slate-200 rounded-full mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-3 w-full bg-slate-100 rounded-full"></div>
                      <div className="h-3 w-5/6 bg-slate-100 rounded-full"></div>
                    </div>
                    <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-50">
                      <div className="h-6 w-24 bg-brand-primary/10 rounded-md"></div>
                      <div className="h-8 w-24 bg-brand-primary rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -left-12 top-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    Devis Validé
                  </div>
                  <div className="text-xs text-slate-500">En production</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
