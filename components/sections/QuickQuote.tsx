"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Send, FileText, CheckCircle2 } from "lucide-react";
import { products } from "@/data/products";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import { trackContact } from "@/lib/tracking/meta-pixel";

export function QuickQuote() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    product: products[0].name,
    quantity: "100",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Génération du lien WhatsApp
    const nl = "%0A";
    let text = `*NOUVELLE DEMANDE DE DEVIS RAPIDE* ⚡${nl}${nl}`;
    text += `*Nom :* ${formData.name}${nl}`;
    text += `*Téléphone :* ${formData.phone}${nl}`;
    text += `*Produit :* ${formData.product}${nl}`;
    text += `*Quantité :* ${formData.quantity}${nl}`;
    
    if (formData.message) {
      text += `*Message :* ${formData.message}${nl}`;
    }
    
    text += `${nl}Bonjour GLOBAL TIC, merci de me recontacter pour ce projet.`;
    
    window.open(`https://wa.me/221776190419?text=${text}`, "_blank");
    trackEvent(AnalyticsEvents.WHATSAPP_CLICK, {
      content_name: formData.product,
      location: "quick_quote",
    });
    trackContact({
      content_name: formData.product,
      content_category: "quick_quote",
      source: "whatsapp",
    });
    setIsSubmitted(true);
  };

  return (
    <section className="py-24 bg-brand-secondary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0,transparent_100%)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left: Info */}
            <div className="p-10 md:p-16 bg-slate-50 flex flex-col justify-center">
              <h2 className="text-3xl md:text-5xl font-black text-brand-secondary mb-6 font-heading tracking-tight leading-tight">
                Un projet <span className="text-brand-primary">Spécifique</span> ?
              </h2>
              <p className="text-slate-500 text-lg mb-10">
                Vous ne trouvez pas exactement ce qu'il vous faut dans le catalogue ? 
                Remplissez ce formulaire éclair et un conseiller vous recontactera sur WhatsApp en moins de 15 minutes.
              </p>
              
              <div className="space-y-6">
                {[
                  "Devis gratuit et sans engagement",
                  "Accompagnement design possible",
                  "Production locale à Dakar",
                  "Livraison rapide partout au Sénégal"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 font-bold text-brand-secondary">
                    <CheckCircle2 className="h-6 w-6 text-brand-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="p-10 md:p-16">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nom complet</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Votre nom"
                      className="w-full h-14 px-6 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-brand-primary transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Téléphone (WhatsApp)</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="+221 ..."
                      className="w-full h-14 px-6 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-brand-primary transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Produit souhaité</label>
                    <select 
                      className="w-full h-14 px-6 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-brand-primary transition-all appearance-none"
                      value={formData.product}
                      onChange={(e) => setFormData({...formData, product: e.target.value})}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                      <option value="Autre">Autre projet sur mesure</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Quantité estimée</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 500"
                      className="w-full h-14 px-6 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-brand-primary transition-all"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Votre message</label>
                  <textarea 
                    rows={3}
                    placeholder="Décrivez votre besoin..."
                    className="w-full p-6 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-brand-primary transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-brand-primary/20">
                  <Send className="mr-2 h-5 w-5" /> Envoyer ma demande
                </Button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
