"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, Check, Building2, Wallet, FileText, MessageCircle, Plus, Trash2 } from "lucide-react";
import type { BusinessConfig } from "@/lib/db/business-config";
import {
  updateCompanyInfoAction,
  updateCommercialAction,
  updatePdfContentAction,
  updateWaTemplatesAction,
} from "@/lib/actions/business-config";

interface ParametresClientProps {
  config: BusinessConfig;
}

const inputClass =
  "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white";
const labelClass =
  "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5";
const textareaClass =
  "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all bg-white resize-none font-mono";

type Tab = "entreprise" | "commercial" | "pdf" | "whatsapp";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "entreprise", label: "Entreprise",  icon: Building2 },
  { id: "commercial", label: "Commercial",  icon: Wallet },
  { id: "pdf",        label: "PDF",         icon: FileText },
  { id: "whatsapp",   label: "WhatsApp",    icon: MessageCircle },
];

function SaveButton({ isPending, saved }: { isPending: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-all disabled:opacity-60 shrink-0"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      {isPending ? "Enregistrement…" : saved ? "Enregistré" : "Enregistrer"}
    </button>
  );
}

function ErrorBanner({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
      {error}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{children}</h3>
  );
}

// ── Onglet Entreprise ──────────────────────────────────────────────────────
function TabEntreprise({ config }: { config: BusinessConfig }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [name, setName]       = useState(String(config.company_name));
  const [tagline, setTagline] = useState(String(config.company_tagline));
  const [address, setAddress] = useState(String(config.company_address));
  const [phone, setPhone]     = useState(String(config.company_phone));
  const [whatsapp, setWhatsapp] = useState(String(config.whatsapp_number));
  const [email, setEmail]     = useState(String(config.company_email));
  const [website, setWebsite] = useState(String(config.company_website));
  const [googleReviewUrl, setGoogleReviewUrl] = useState(String(config.google_review_url));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateCompanyInfoAction({
        company_name:      name.trim(),
        company_tagline:   tagline.trim(),
        company_address:   address.trim(),
        company_phone:     phone.trim(),
        whatsapp_number:   whatsapp.trim().replace(/[^0-9]/g, ""),
        company_email:     email.trim().toLowerCase(),
        company_website:   website.trim(),
        google_review_url: googleReviewUrl.trim(),
      });
      if (!result.data) {
        setError(result.error ?? "Erreur lors de l'enregistrement");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ErrorBanner error={error} />
      <div>
        <SectionTitle>Identité</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nom de l&apos;entreprise *</label>
            <input className={inputClass} value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Slogan / Activité</label>
            <input className={inputClass} value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Imprimerie Professionnelle" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Adresse</label>
            <input className={inputClass} value={address} onChange={e => setAddress(e.target.value)} placeholder="Dakar, Sénégal" />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Contact</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Téléphone</label>
            <input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+221 77 619 04 19" />
          </div>
          <div>
            <label className={labelClass}>Numéro WhatsApp * <span className="normal-case font-normal">(chiffres uniquement)</span></label>
            <input className={inputClass} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="221776190419" required />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@example.com" />
          </div>
          <div>
            <label className={labelClass}>Site web</label>
            <input className={inputClass} type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Lien Google Avis <span className="normal-case font-normal text-slate-400">(pour demandes d&apos;avis post-livraison)</span></label>
            <input className={inputClass} type="url" value={googleReviewUrl} onChange={e => setGoogleReviewUrl(e.target.value)} placeholder="https://g.page/r/..." />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton isPending={isPending} saved={saved} />
      </div>
    </form>
  );
}

// ── Onglet Commercial ──────────────────────────────────────────────────────
function TabCommercial({ config }: { config: BusinessConfig }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [validityDays, setValidityDays] = useState(String(config.default_quote_validity_days));
  const [depositPercent, setDepositPercent] = useState(String(config.default_deposit_percent));
  const [urgentSurcharge, setUrgentSurcharge] = useState(String(config.urgent_surcharge_percent));
  const [turnaroundDays, setTurnaroundDays] = useState(String(config.default_turnaround_days));
  const [minOrder, setMinOrder] = useState(String(config.min_order_amount));
  const [paymentTerms, setPaymentTerms] = useState(String(config.pdf_payment_terms));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateCommercialAction({
        default_quote_validity_days: parseInt(validityDays) || 15,
        default_deposit_percent:     parseInt(depositPercent) || 50,
        urgent_surcharge_percent:    parseInt(urgentSurcharge) || 30,
        default_turnaround_days:     parseInt(turnaroundDays) || 3,
        min_order_amount:            parseInt(minOrder) || 5000,
        pdf_payment_terms:           paymentTerms.trim(),
      });
      if (!result.data) {
        setError(result.error ?? "Erreur lors de l'enregistrement");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ErrorBanner error={error} />
      <div>
        <SectionTitle>Devis</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Validité devis par défaut <span className="normal-case font-normal">(jours)</span></label>
            <input className={inputClass} type="number" min="1" max="365" value={validityDays} onChange={e => setValidityDays(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Acompte par défaut <span className="normal-case font-normal">(%)</span></label>
            <input className={inputClass} type="number" min="0" max="100" value={depositPercent} onChange={e => setDepositPercent(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Conditions de paiement <span className="normal-case font-normal">(PDF devis)</span></label>
            <input className={inputClass} value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="50% d'acompte à la commande, solde à la livraison" />
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Production</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Délai de production par défaut <span className="normal-case font-normal">(jours)</span></label>
            <input className={inputClass} type="number" min="1" max="365" value={turnaroundDays} onChange={e => setTurnaroundDays(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Surcharge urgence <span className="normal-case font-normal">(%)</span></label>
            <input className={inputClass} type="number" min="0" max="200" value={urgentSurcharge} onChange={e => setUrgentSurcharge(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Montant minimum de commande <span className="normal-case font-normal">(FCFA)</span></label>
            <input className={inputClass} type="number" min="0" value={minOrder} onChange={e => setMinOrder(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton isPending={isPending} saved={saved} />
      </div>
    </form>
  );
}

// ── Onglet PDF ─────────────────────────────────────────────────────────────
function TabPDF({ config }: { config: BusinessConfig }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [conditions, setConditions] = useState<string[]>(
    Array.isArray(config.pdf_conditions) ? (config.pdf_conditions as string[]) : []
  );
  const [footerText, setFooterText] = useState(String(config.pdf_footer_text));

  function addCondition() {
    setConditions(prev => [...prev, ""]);
  }

  function removeCondition(idx: number) {
    setConditions(prev => prev.filter((_, i) => i !== idx));
  }

  function updateCondition(idx: number, val: string) {
    setConditions(prev => prev.map((c, i) => i === idx ? val : c));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const filtered = conditions.map(c => c.trim()).filter(Boolean);
    if (filtered.length === 0) {
      setError("Au moins une condition est requise.");
      return;
    }
    startTransition(async () => {
      const result = await updatePdfContentAction({
        pdf_conditions:  filtered,
        pdf_footer_text: footerText.trim(),
      });
      if (!result.data) {
        setError(result.error ?? "Erreur lors de l'enregistrement");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ErrorBanner error={error} />

      <div>
        <SectionTitle>Conditions générales</SectionTitle>
        <p className="text-xs text-slate-400 mb-4">Ces conditions apparaissent dans chaque PDF devis généré.</p>
        <div className="space-y-3">
          {conditions.map((cond, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="shrink-0 mt-2.5 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                {idx + 1}
              </span>
              <textarea
                className={`${textareaClass} flex-1`}
                rows={2}
                value={cond}
                onChange={e => updateCondition(idx, e.target.value)}
                placeholder="Condition générale…"
              />
              <button
                type="button"
                onClick={() => removeCondition(idx)}
                disabled={conditions.length <= 1}
                className="shrink-0 mt-1 w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        {conditions.length < 10 && (
          <button
            type="button"
            onClick={addCondition}
            className="mt-3 flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary-dark transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter une condition
          </button>
        )}
      </div>

      <div>
        <SectionTitle>Pied de page</SectionTitle>
        <div>
          <label className={labelClass}>Texte de bas de page PDF</label>
          <input className={inputClass} value={footerText} onChange={e => setFooterText(e.target.value)} placeholder="GLOBAL TIC — Imprimerie Professionnelle — Dakar, Sénégal" />
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton isPending={isPending} saved={saved} />
      </div>
    </form>
  );
}

// ── Onglet WhatsApp ────────────────────────────────────────────────────────
const WA_TEMPLATE_FIELDS: { key: keyof Pick<BusinessConfig, "wa_template_devis" | "wa_template_confirmation" | "wa_template_pret" | "wa_template_livraison" | "wa_template_livre" | "wa_template_paiement" | "wa_template_bat">; label: string; variables: string[] }[] = [
  { key: "wa_template_devis",        label: "Envoi devis",             variables: ["{client}", "{reference}", "{total}"] },
  { key: "wa_template_confirmation", label: "Confirmation commande",   variables: ["{client}", "{reference}", "{total}"] },
  { key: "wa_template_pret",         label: "Commande prête",          variables: ["{client}", "{reference}"] },
  { key: "wa_template_livraison",    label: "En livraison",            variables: ["{client}", "{reference}"] },
  { key: "wa_template_livre",        label: "Commande livrée",         variables: ["{client}", "{reference}"] },
  { key: "wa_template_paiement",     label: "Paiement reçu",           variables: ["{client}", "{reference}", "{montant}"] },
  { key: "wa_template_bat",          label: "BAT envoyé",              variables: ["{client}", "{reference}"] },
];

function TabWhatsApp({ config }: { config: BusinessConfig }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [templates, setTemplates] = useState({
    wa_template_devis:        String(config.wa_template_devis),
    wa_template_confirmation: String(config.wa_template_confirmation),
    wa_template_pret:         String(config.wa_template_pret),
    wa_template_livraison:    String(config.wa_template_livraison),
    wa_template_livre:        String(config.wa_template_livre),
    wa_template_paiement:     String(config.wa_template_paiement),
    wa_template_bat:          String(config.wa_template_bat),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateWaTemplatesAction(templates);
      if (!result.data) {
        setError(result.error ?? "Erreur lors de l'enregistrement");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ErrorBanner error={error} />
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-blue-700 mb-1">Variables disponibles</p>
        <p className="text-xs text-blue-600">
          Utilisez <code className="bg-blue-100 px-1 rounded">{'{'+'client}'}</code>, <code className="bg-blue-100 px-1 rounded">{'{'+'reference}'}</code>, <code className="bg-blue-100 px-1 rounded">{'{'+'total}'}</code>, <code className="bg-blue-100 px-1 rounded">{'{'+'montant}'}</code> dans vos messages.
          Ces variables seront remplacées automatiquement lors de l&apos;envoi.
        </p>
      </div>

      <div className="space-y-5">
        {WA_TEMPLATE_FIELDS.map(({ key, label, variables }) => (
          <div key={key}>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
              <div className="flex gap-1">
                {variables.map(v => (
                  <span key={v} className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[9px] font-bold font-mono">{v}</span>
                ))}
              </div>
            </div>
            <textarea
              className={`${textareaClass} w-full`}
              rows={4}
              value={templates[key]}
              onChange={e => setTemplates(prev => ({ ...prev, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <SaveButton isPending={isPending} saved={saved} />
      </div>
    </form>
  );
}

// ── Composant principal ────────────────────────────────────────────────────
export function ParametresClient({ config }: ParametresClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("entreprise");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">Paramètres business</h2>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Configurez les informations et règles de GLOBAL TIC PrintTech
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-6">
        {activeTab === "entreprise" && <TabEntreprise config={config} />}
        {activeTab === "commercial" && <TabCommercial config={config} />}
        {activeTab === "pdf"        && <TabPDF        config={config} />}
        {activeTab === "whatsapp"   && <TabWhatsApp   config={config} />}
      </div>
    </div>
  );
}
