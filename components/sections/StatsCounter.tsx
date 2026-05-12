"use client";

import React from "react";
import { motion, useInView } from "framer-motion";

interface StatProps {
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
}

function Counter({ value, suffix = "", label, delay = 0 }: StatProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2;
      let startTime: number | null = null;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      const timer = setTimeout(() => {
        requestAnimationFrame(animate);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isInView, value, delay]);

  return (
    <div ref={ref} className="text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
      <div className="text-4xl md:text-5xl font-black text-brand-primary mb-2 font-heading">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-slate-500 font-bold uppercase tracking-[0.1em] text-xs md:text-sm">
        {label}
      </div>
    </div>
  );
}

export function StatsCounter() {
  return (
    <section className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <Counter label="Impressions / Mois" value={12000} suffix="+" />
          <Counter label="Entreprises" value={500} suffix="+" delay={0.2} />
          <Counter label="Projets livrés" value={2500} suffix="+" delay={0.4} />
          <Counter label="Satisfaction" value={98} suffix="%" delay={0.6} />
        </div>
      </div>
    </section>
  );
}
