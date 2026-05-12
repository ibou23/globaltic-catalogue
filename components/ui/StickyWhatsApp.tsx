"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";

export function StickyWhatsApp() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    trackEvent(AnalyticsEvents.WHATSAPP_CLICK, {
      location: "sticky_button"
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 sm:hidden"
        >
          {/* Tooltip hint */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 text-brand-secondary text-sm font-bold premium-shadow"
          >
            Besoin d'aide ? 👋
          </motion.div>

          <a
            href="https://wa.me/221776190419"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="group relative flex items-center justify-center"
            aria-label="Contacter sur WhatsApp"
          >
            {/* Pulsing layers */}
            <div className="absolute inset-0 bg-whatsapp rounded-full animate-ping opacity-25"></div>
            <div className="absolute inset-0 bg-whatsapp rounded-full animate-pulse-premium opacity-50"></div>
            
            <div className="relative h-16 w-16 bg-whatsapp text-white rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 group-active:scale-90">
              <MessageCircle className="h-8 w-8" />
            </div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
