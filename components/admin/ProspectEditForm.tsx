"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Prospect, AdminProfile } from "@/lib/types/domain";
import { updateProspectAction } from "@/lib/actions/prospects";
import { CATALOG_PRODUCTS, PROSPECT_STATUSES, PROSPECT_PRIORITIES } from "@/lib/validators/prospect";

const STATUS_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  devis_envoye: "Devis envoyé",
  en_negociation: "En négociation",
  validation_conception: "Valid. conception",
  commande_confirmee: "Commande confirmée",
  en_production: "En production",
  livre: "Livré",
  annule: "Annulé",
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgent",
  chaud: "Chaud",
  a_qualifier: "À qualifier",
  froid: "Froid",
  perdu: "Perdu",
};

interface ProspectEditFormProps {
  prospect: Prospect;
  adminProfiles: AdminProfile[];
}

export function ProspectEditForm({ prospect, adminProfiles }: ProspectEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contact
  const [fullName, setFullName] = useState(prospect.fullName);
  const [whatsapp, setWhatsapp] = useState(prospect.whatsapp);
  const [phoneSecondary, setPhoneSecondary] = useState(prospect.phoneSecondary ?? "");
  const [email, setEmail] = useState(prospect.email ?? "");

  // Entreprise
  const [companyName, setCompanyName] = useState(prospect.companyName ?? "");
  const [companyAddress, setCompanyAddress] = useState(prospect.companyAddress ?? "");
  const [website, setWebsite] = useState(prospect.website ?? "");
  const [sector, setSector] = useState(prospect.sector ?? "");

  // Conception
  const [productsServices, setProductsServices] = useState(prospect.productsServices ?? "");
  const [preferredColors, setPreferredColors] = useState(prospect.preferredColors ?? "");
  const [supportText, setSupportText] = useState(prospect.supportText ?? "");

  // Commande
  const [requestedProducts, setRequestedProducts] = useState<string[]>(prospect.requestedProducts);
  const [otherProduct, setOtherProduct] = useState(prospect.otherProduct ?? "");
  const [quantity, setQuantity] = useState(prospect.quantity ?? "");
  const [formatDimensions, setFormatDimensions] = useState(prospect.formatDimensions ?? "");
  const [finish, setFinish] = useState(prospect.finish ?? "");
  const [desiredDeadline, setDesiredDeadline] = useState(prospect.desiredDeadline ?? "");
  const [deliveryZone, setDeliveryZone] = useState(prospect.deliveryZone ?? "");
  const [message, setMessage] = useState(prospect.message ?? "");

  // Suivi commercial
  const [status, setStatus] = useState(prospect.status);
  const [priority, setPriority] = useState(prospect.priority);
  const [internalNotes, setInternalNotes] = useState(prospect.internalNotes ?? "");
  const [assignedTo, setAssignedTo] = useState(prospect.assignedTo ?? "");

  function toggleProduct(product: string) {
    setRequestedProducts((prev) =>
      prev.includes(product) ? prev.filter((p) => p !== product) : [...prev, product]
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      full_name: fullName.trim(),
      whatsapp: whatsapp.trim(),
      phone_secondary: phoneSecondary.trim() || null,
      email: email.trim() || null,
      company_name: companyName.trim() || null,
      company_address: companyAddress.trim() || null,
      website: website.trim() || null,
      sector: sector.trim() || null,
      products_services: productsServices.trim() || null,
      preferred_colors: preferredColors.trim() || null,
      support_text: supportText.trim() || null,
      requested_products: requestedProducts,
      other_product: otherProduct.trim() || null,
      quantity: quantity.trim() || null,
      format_dimensions: formatDimensions.trim() || null,
      finish: finish.trim() || null,
      desired_deadline: desiredDeadline.trim() || null,
      delivery_zone: deliveryZone.trim() || null,
      message: message.trim() || null,
      status,
      priority,
      internal_notes: internalNotes.trim() || null,
      assigned_to: assignedTo || null,
    };

    try {
      const result = await updateProspectAction(prospect.id, payload);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/admin/prospects/${prospect.id}`);
      }
    } catch {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all";
  const labelClass =
    "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/admin/prospects/${prospect.id}`}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-800 font-heading">
              Modifier le prospect
            </h1>
            <p className="text-xs text-slate-400 font-mono">{prospect.reference}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ─── Contact ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom complet *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="Nom du prospect"
                />
              </div>
              <div>
                <label className={labelClass}>WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={inputClass}
                  placeholder="+221 7X XXX XX XX"
                />
              </div>
              <div>
                <label className={labelClass}>Tél. secondaire</label>
                <input
                  type="text"
                  value={phoneSecondary}
                  onChange={(e) => setPhoneSecondary(e.target.value)}
                  className={inputClass}
                  placeholder="+221 3X XXX XX XX"
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="email@exemple.com"
                />
              </div>
            </div>
          </div>

          {/* ─── Entreprise ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Entreprise</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom de l&apos;entreprise</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                  placeholder="Nom de l'entreprise"
                />
              </div>
              <div>
                <label className={labelClass}>Secteur</label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className={inputClass}
                  placeholder="Secteur d'activité"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Adresse</label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className={inputClass}
                  placeholder="Adresse de l'entreprise"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Site web</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* ─── Produits & Besoin ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Produits & Besoin</h2>

            <div>
              <label className={labelClass}>Produits demandés</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {CATALOG_PRODUCTS.map((product) => (
                  <button
                    type="button"
                    key={product}
                    onClick={() => toggleProduct(product)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      requestedProducts.includes(product)
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:border-brand-primary/30"
                    }`}
                  >
                    {product}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Autre produit</label>
                <input
                  type="text"
                  value={otherProduct}
                  onChange={(e) => setOtherProduct(e.target.value)}
                  className={inputClass}
                  placeholder="Si non listé ci-dessus"
                />
              </div>
              <div>
                <label className={labelClass}>Quantité</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={inputClass}
                  placeholder="Ex: 500 pièces"
                />
              </div>
              <div>
                <label className={labelClass}>Format / Dimensions</label>
                <input
                  type="text"
                  value={formatDimensions}
                  onChange={(e) => setFormatDimensions(e.target.value)}
                  className={inputClass}
                  placeholder="Ex: A5, 85x55mm"
                />
              </div>
              <div>
                <label className={labelClass}>Finition</label>
                <input
                  type="text"
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  className={inputClass}
                  placeholder="Pelliculage, vernis, etc."
                />
              </div>
              <div>
                <label className={labelClass}>Délai souhaité</label>
                <input
                  type="text"
                  value={desiredDeadline}
                  onChange={(e) => setDesiredDeadline(e.target.value)}
                  className={inputClass}
                  placeholder="Ex: 5 jours"
                />
              </div>
              <div>
                <label className={labelClass}>Zone de livraison</label>
                <input
                  type="text"
                  value={deliveryZone}
                  onChange={(e) => setDeliveryZone(e.target.value)}
                  className={inputClass}
                  placeholder="Dakar, Thiès, etc."
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Conception — Produits/services de l&apos;entreprise</label>
              <textarea
                value={productsServices}
                onChange={(e) => setProductsServices(e.target.value)}
                rows={2}
                maxLength={2000}
                className={`${inputClass} resize-none`}
                placeholder="Description de l'activité du prospect..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Couleurs préférées</label>
                <input
                  type="text"
                  value={preferredColors}
                  onChange={(e) => setPreferredColors(e.target.value)}
                  className={inputClass}
                  placeholder="Bleu, doré..."
                />
              </div>
              <div>
                <label className={labelClass}>Texte support</label>
                <input
                  type="text"
                  value={supportText}
                  onChange={(e) => setSupportText(e.target.value)}
                  className={inputClass}
                  placeholder="Texte à imprimer"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Message complémentaire</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                maxLength={2000}
                className={`${inputClass} resize-none`}
                placeholder="Message libre du prospect..."
              />
            </div>
          </div>

          {/* ─── Suivi commercial ─── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-5">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Suivi commercial</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Statut</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className={inputClass}
                >
                  {PROSPECT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s] ?? s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Priorité</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as typeof priority)}
                  className={inputClass}
                >
                  {PROSPECT_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p] ?? p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Commercial assigné</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Non assigné —</option>
                  {adminProfiles.map((admin) => (
                    <option key={admin.userId} value={admin.userId}>
                      {admin.fullName} ({admin.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Notes commerciales</label>
              <textarea
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                rows={3}
                maxLength={5000}
                className={`${inputClass} resize-none`}
                placeholder="Notes internes sur ce prospect..."
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/admin/prospects/${prospect.id}`}
              className="h-10 px-5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors flex items-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark hover:shadow-lg hover:shadow-brand-primary/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
