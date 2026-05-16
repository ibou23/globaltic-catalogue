import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-brand-secondary text-slate-300 relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-primary"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 p-4 rounded-2xl inline-block border border-white/10 backdrop-blur-sm">
              <img src="/logo.png" alt="GLOBAL TIC" className="h-10 w-auto object-contain brightness-0 invert" />
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              La plateforme technologique d'impression leader à Dakar. Nous combinons un parc machines de pointe avec une expérience digitale sans couture pour propulser votre communication visuelle.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="https://www.facebook.com/globalticgroup" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all duration-300 border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/ibrahima-diop-global-tic/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all duration-300 border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://www.globalticgroup.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all duration-300 border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-white font-bold mb-6 font-heading tracking-wide">Catalogue</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/catalogue/numerique-et-grand-format" className="hover:text-white transition-colors flex items-center group"><span className="w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-2 mr-0 group-hover:mr-2"></span> Numérique et Grand Format</Link></li>
              <li><Link href="/catalogue/papeterie" className="hover:text-white transition-colors flex items-center group"><span className="w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-2 mr-0 group-hover:mr-2"></span> Papeterie & Offset</Link></li>
              <li><Link href="/catalogue/packaging" className="hover:text-white transition-colors flex items-center group"><span className="w-0 h-0.5 bg-brand-primary transition-all duration-300 group-hover:w-2 mr-0 group-hover:mr-2"></span> Packaging</Link></li>
              <li><Link href="/catalogue" className="text-brand-primary hover:text-brand-primary-light transition-colors flex items-center mt-2 font-semibold">Voir tout <ArrowRight className="ml-1 h-3 w-3" /></Link></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 font-heading tracking-wide">L'Entreprise</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/realisations" className="hover:text-white transition-colors">Nos Réalisations</Link></li>
              <li><Link href="/demande" className="hover:text-white transition-colors">Demander un devis</Link></li>
              <li><span className="text-slate-500 cursor-default">Parc Technologique</span></li>
              <li><span className="text-slate-500 cursor-default">Carrières</span></li>
              <li><span className="text-slate-500 cursor-default">Blog & Ressources</span></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-6 font-heading tracking-wide">Contact</h4>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <MapPin className="h-4 w-4 text-brand-primary" />
                </div>
                <span className="mt-1 leading-relaxed">Siège GLOBAL TIC<br/>Dakar, Sénégal</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Mail className="h-4 w-4 text-brand-primary" />
                </div>
                <a href="mailto:contact@globalticgroup.com" className="hover:text-white transition-colors mt-1">contact@globalticgroup.com</a>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Phone className="h-4 w-4 text-brand-primary" />
                </div>
                <a href="tel:+221776190419" className="hover:text-white transition-colors mt-1">+221 77 619 04 19</a>
              </li>
            </ul>
          </div>
        </div>

        {/* WhatsApp CTA Banner inside footer */}
        <div className="bg-gradient-to-r from-brand-primary-dark/20 to-transparent border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 font-heading">Besoin d'un devis sur-mesure ?</h3>
            <p className="text-slate-400 text-sm">Notre équipe commerciale vous répond en moins de 15 minutes sur WhatsApp.</p>
          </div>
          <Button variant="whatsapp" size="lg" className="shrink-0" asChild>
            <a href="https://wa.me/221776190419" target="_blank" rel="noopener noreferrer">
              Discuter sur WhatsApp
            </a>
          </Button>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} GLOBAL TIC. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <span className="cursor-default">Mentions légales</span>
            <span className="cursor-default">Politique de confidentialité</span>
            <span className="cursor-default">CGV</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
