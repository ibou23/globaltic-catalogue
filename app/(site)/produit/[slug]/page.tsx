"use client";

import React from "react";

import { notFound } from "next/navigation";
import Link from "next/link";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { useCalculator } from "@/hooks/use-calculator";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Home, CheckCircle2, Info, MessageCircle, ImageIcon, Zap, Clock } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/whatsapp/generator";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import { PriceAnimation } from "@/components/calculator/PriceAnimation";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const product = products.find(p => p.slug === slug);
  
  if (!product) {
    notFound();
  }

  const category = categories.find(c => c.id === product.categoryId);
  const { state, result, actions } = useCalculator(product);

  const whatsappLink = generateWhatsAppLink(product, state, result);

  // Tracking de la vue produit
  React.useEffect(() => {
    trackEvent(AnalyticsEvents.PRODUCT_VIEW, {
      product_name: product.name,
      category_id: product.categoryId
    });
  }, [product.id, product.name, product.categoryId]);

  // Calcul du progrès de configuration
  const steps = [
    { id: 'format', active: !!state.format || product.formats.length === 0 },
    { id: 'paper', active: !!state.paper || product.papers.length === 0 },
    { id: 'finishes', active: state.selectedFinishes.length > 0 || product.finishes.length === 0 },
  ];
  const completedSteps = steps.filter(s => s.active).length;
  const progressPercent = (completedSteps / steps.length) * 100;

  // Calcul des économies (simple simulation basée sur le prix dégressif)
  const basePrice = product.quantityTiers[0].baseUnitPrice;
  const currentTierPrice = result.unitPrice;
  const savingsPercent = Math.round(((basePrice - currentTierPrice) / basePrice) * 100);

  return (
    <div className="bg-muted/10 min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-brand-primary transition-colors"><Home className="h-4 w-4" /></Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/catalogue" className="hover:text-brand-primary transition-colors">Catalogue</Link>
            {category && (
              <>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link href={`/catalogue/${category.slug}`} className="hover:text-brand-primary transition-colors">{category.name}</Link>
              </>
            )}
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Visuals & Description */}
          <div className="lg:col-span-5 space-y-8">
            {/* Image Product */}
            <div className="aspect-square bg-white rounded-2xl border shadow-sm flex items-center justify-center p-8 relative overflow-hidden group">
               <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-brand-primary/10 transition-colors z-0"></div>
               
               {product.imageUrls[0] ? (
                 <Image 
                   src={product.imageUrls[0]}
                   alt={product.name}
                   fill
                   priority
                   sizes="(max-width: 1024px) 100vw, 50vw"
                   className="object-cover relative z-10 transition-transform duration-700 group-hover:scale-105"
                 />
               ) : (
                 <>
                   <ImageIcon className="w-24 h-24 opacity-10 relative z-10" />
                   <span className="absolute text-brand-secondary/50 font-bold text-2xl tracking-widest uppercase rotate-45 z-10">Aperçu visuel</span>
                 </>
               )}
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-black text-brand-secondary mb-4 font-heading tracking-tight">{product.name}</h1>
              <p className="text-lg text-slate-500 leading-relaxed">
                {product.description}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-sm font-medium rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Calculator */}
          <div className="lg:col-span-7">
            <Card className="border-0 shadow-xl ring-1 ring-gray-100 sticky top-24">
              <CardContent className="p-0">
                
                {/* Configuration Area */}
                <div className="p-0">
                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-slate-100 overflow-hidden rounded-t-xl">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full bg-brand-primary"
                    />
                  </div>

                  <div className="p-6 sm:p-8 space-y-8">
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                      <h2 className="text-xl font-bold text-brand-secondary">Configurez votre produit</h2>
                      {savingsPercent > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-green-100 text-green-700 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm"
                        >
                          <Zap className="h-3 w-3 fill-current" />
                          ÉCONOMIE {savingsPercent}%
                        </motion.div>
                      )}
                    </div>

                  {/* 1. Format */}
                  {product.formats.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-brand-secondary uppercase tracking-wider">1. Format d'impression</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {product.formats.map(format => (
                          <button
                            key={format.id}
                            onClick={() => actions.setFormat(format.id)}
                            className={`p-3 text-left rounded-xl border-2 transition-all ${
                              state.format?.id === format.id 
                              ? "border-brand-primary bg-brand-primary/5" 
                              : "border-gray-100 hover:border-brand-primary/30"
                            }`}
                          >
                            <div className="font-semibold text-brand-secondary text-sm">{format.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Papier */}
                  {product.papers.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-brand-secondary uppercase tracking-wider">2. Type de support</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {product.papers.map(paper => (
                          <button
                            key={paper.id}
                            onClick={() => actions.setPaper(paper.id)}
                            className={`p-3 text-left rounded-xl border-2 transition-all flex items-center justify-between ${
                              state.paper?.id === paper.id 
                              ? "border-brand-primary bg-brand-primary/5" 
                              : "border-gray-100 hover:border-brand-primary/30"
                            }`}
                          >
                            <div>
                              <div className="font-semibold text-brand-secondary text-sm">{paper.name}</div>
                              <div className="text-xs text-muted-foreground">{paper.type}</div>
                            </div>
                            {state.paper?.id === paper.id && <CheckCircle2 className="h-5 w-5 text-brand-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Finitions */}
                  {product.finishes.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-brand-secondary uppercase tracking-wider">3. Finitions & Sublimation</label>
                      <div className="space-y-2">
                        {product.finishes.map(finish => {
                          const isSelected = state.selectedFinishes.some(f => f.id === finish.id);
                          const isIncompatible = finish.incompatibleWith.some(id => state.selectedFinishes.some(f => f.id === id));
                          
                          return (
                            <button
                              key={finish.id}
                              onClick={() => actions.toggleFinish(finish.id)}
                              className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between ${
                                isSelected 
                                ? "border-brand-primary bg-brand-primary/5" 
                                : isIncompatible 
                                  ? "border-gray-100 opacity-50 cursor-not-allowed bg-gray-50" 
                                  : "border-gray-100 hover:border-brand-primary/30"
                              }`}
                            >
                              <div>
                                <div className="font-semibold text-brand-secondary flex items-center gap-2">
                                  {finish.name}
                                  {isIncompatible && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wide">Incompatible</span>}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{finish.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-brand-primary">+{formatPrice(finish.unitPrice)} /u</div>
                                {finish.fixedPrice > 0 && <div className="text-xs text-muted-foreground">+ {formatPrice(finish.fixedPrice)} calage</div>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. Quantité */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-brand-secondary uppercase tracking-wider">3. Quantité</label>
                      <span className="text-xs font-medium text-muted-foreground bg-gray-100 px-2 py-1 rounded">Prix dégressif</span>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-medium bg-slate-50/80 px-3 py-1.5 rounded-lg border border-slate-100 w-fit"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                      </span>
                      Glissez le curseur ou saisissez votre quantité manuellement
                    </motion.div>

                    {/* Range Slider for Quantity */}
                    <div className="pt-2">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="flex-grow py-4 flex items-center">
                          <input 
                            type="range" 
                            min={product.quantityTiers[0]?.min || 10} 
                            max={product.quantityTiers[product.quantityTiers.length - 1]?.max > 10000 ? 10000 : product.quantityTiers[product.quantityTiers.length - 1]?.max} 
                            step={product.quantityTiers[0]?.min < 50 ? 10 : 50}
                            value={state.quantity}
                            onChange={(e) => actions.setQuantity(Number(e.target.value))}
                            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                          />
                        </div>
                        <input 
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={state.quantity === 0 ? "" : state.quantity.toString()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '');
                            actions.setQuantity(val === "" ? 0 : parseInt(val, 10));
                          }}
                          onBlur={() => {
                            const minQ = product.quantityTiers[0]?.min || 1;
                            if (state.quantity < minQ) {
                              actions.setQuantity(minQ);
                            }
                          }}
                          className="w-full sm:w-32 text-center font-bold text-2xl border-2 border-slate-200 rounded-2xl py-4 focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all shadow-inner"
                        />
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-4xl font-black text-brand-secondary font-heading">
                          {state.quantity.toLocaleString('fr-SN')} 
                          <span className="text-base font-medium text-slate-400 font-sans ml-2">
                            { (product.tags.includes("m2") || product.slug === "vinyle-pre-decoupe") ? "m²" : "exemplaires"}
                          </span>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>

                {/* Recap & CTA Area */}
                <div className="sticky bottom-0 z-50 bg-[#132034] text-white p-5 sm:p-8 rounded-t-3xl sm:rounded-none sm:rounded-b-xl border-t border-white/10 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.4)] sm:shadow-none safe-bottom">
                  {/* Détail du calcul (Receipt) - Hidden on very small screens to save space */}
                  <div className="hidden sm:block mb-6 pb-6 border-b border-brand-secondary-light/50 space-y-3">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Résumé de votre configuration</h3>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Quantité</span>
                      <span className="font-medium text-white">
                        {state.quantity.toLocaleString('fr-SN')} { (product.tags.includes("m2") || product.slug === "vinyle-pre-decoupe") ? "m²" : "exemplaires"}
                      </span>
                    </div>
                    
                    {state.format && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Format</span>
                        <span className="font-medium text-white">{state.format.name}</span>
                      </div>
                    )}
                    
                    {state.paper && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Support</span>
                        <span className="font-medium text-white">{state.paper.name}</span>
                      </div>
                    )}
                    
                    {state.selectedFinishes.length > 0 && (
                      <div className="flex justify-between items-start text-sm">
                        <span className="text-slate-400">Options incluses</span>
                        <div className="flex flex-col items-end gap-1">
                          {state.selectedFinishes.map(f => (
                            <span key={f.id} className="font-medium text-white text-right">{f.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
                    <div className="w-full md:w-auto">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs sm:text-sm text-brand-primary-light font-bold uppercase tracking-widest">Budget Total</span>
                        <span className="text-[10px] bg-brand-primary/20 text-brand-primary-light px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Estimatif</span>
                      </div>
                      <PriceAnimation value={result.totalPrice} className="text-3xl sm:text-4xl md:text-5xl font-black text-white" />
                      <div className="flex text-[11px] sm:text-sm text-slate-400 mt-2 items-center gap-1 font-medium bg-white/5 px-3 py-1 rounded-full w-fit border border-white/5">
                        <Info className="h-3 w-3 sm:h-4 sm:w-4 text-brand-primary" />
                        Prix unitaire : {formatPrice(result.unitPrice)} / { (product.tags.includes("m2") || product.slug === "vinyle-pre-decoupe") ? "m²" : "unité"}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 mt-2 sm:mt-3 font-medium flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                          Production estimée : ~{result.estimatedTurnaroundDays} jours ouvrés
                        </div>
                        <div className="flex items-center gap-2 text-brand-primary-light">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          Livraison Dakar disponible (48h)
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
                      <Button variant="whatsapp" size="lg" className="w-full h-14 sm:h-12 font-bold shadow-xl hover:scale-105 active:scale-95 transition-transform rounded-xl" asChild>
                        <a 
                          href={whatsappLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={() => trackEvent(AnalyticsEvents.WHATSAPP_CLICK, {
                            product_name: product.name,
                            total_price: result.totalPrice,
                            quantity: state.quantity
                          })}
                        >
                          <MessageCircle className="mr-2 h-6 w-6" />
                          <span className="hidden sm:inline">Commander sur WhatsApp</span>
                          <span className="sm:hidden text-lg">Commander sur WhatsApp</span>
                        </a>
                      </Button>
                      <p className="text-[10px] text-gray-400 text-center mt-3 uppercase tracking-wider max-w-[200px] leading-tight">
                        Devis sans engagement. Le prix final peut varier selon les contraintes de fichier.
                      </p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
