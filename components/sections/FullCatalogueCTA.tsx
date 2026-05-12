"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FullCatalogueCTAProps {
  className?: string;
}

export function FullCatalogueCTA({ className = "" }: FullCatalogueCTAProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`py-12 text-center ${className}`}
    >
      <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-black shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all group" asChild>
        <Link href="/catalogue">
          Voir tout le catalogue <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </motion.div>
  );
}
