"use client";

import { useState } from "react";
import { Plus, FileText, MessageCircle, Download, Pencil } from "lucide-react";
import type { QuoteEnriched } from "@/lib/types/domain";
import { formatPrice, formatDateShort } from "@/lib/utils/format";
import { DevisForm } from "@/components/admin/DevisForm";
import { DevisEditForm } from "@/components/admin/DevisEditForm";
import { siteConfig } from "@/lib/config/site";

interface DevisClientProps {
  quotes: QuoteEnriched[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  brouillon: { label: "Brouillon", color: "bg-slate-100 text-slate-600" },
  envoye:    { label: "Envoyé",    color: "bg-blue-100 text-blue-600" },
  accepte:   { label: "Accepté",  color: "bg-green-100 text-green-600" },
  refuse:    { label: "Refusé",   color: "bg-red-100 text-red-600" },
  expire:    { label: "Expiré",   color: "bg-amber-100 text-amber-600" },
};

function buildWhatsAppReply(quote: QuoteEnriched): string {
  const client = quote.customer?.contactName ?? "client";
  const item = quote.firstItem;
  const lines = [
    `Bonjour *${client}*,`,
    ``,
    `Suite à notre échange, voici le récapitulatif de votre devis :`,
    ``,
    `*Référence* : ${quote.reference}`,
    item ? `*Produit* : ${item.productName}` : null,
    item ? `*Quantité* : ${item.quantity.toLocaleString("fr-SN")}` : null,
    item ? `*Prix unitaire* : ${item.unitPrice.toLocaleString("fr-SN")} FCFA` : null,
    `*Total estimatif* : ${quote.total.toLocaleString("fr-SN")} FCFA`,
    ``,
    `Confirmez-vous cette commande ? Nous pouvons démarrer la production dès validation.`,
  ].filter((l): l is string => l !== null);

  const whatsapp = quote.customer?.whatsapp?.replace(/[^0-9]/g, "") ?? siteConfig.whatsapp;
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function DevisClient({ quotes }: DevisClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<QuoteEnriched | null>(null);

  return (
    <>
      {showForm && <DevisForm onClose={() => setShowForm(false)} />}
      {editingQuote && (
        <DevisEditForm quote={editingQuote} onClose={() => setEditingQuote(null)} />
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">
              Gestion des devis
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-1">
              {quotes.length} devis au total
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark hover:shadow-lg hover:shadow-brand-primary/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Créer un devis
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Produit</th>
                  <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</th>
                  <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-300">Aucun devis pour l&apos;instant</p>
                      <p className="text-xs text-slate-300 mt-1">Créez votre premier devis depuis une discussion WhatsApp</p>
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => {
                    const status = STATUS_LABELS[quote.status] ?? { label: quote.status, color: "bg-slate-100 text-slate-600" };
                    const waLink = buildWhatsAppReply(quote);
                    return (
                      <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-700">{quote.reference}</span>
                          {quote.isUrgent && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-red-100 text-red-600 uppercase">Urgent</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {quote.customer ? (
                            <div>
                              <p className="font-semibold text-slate-700">{quote.customer.contactName}</p>
                              {quote.customer.companyName && (
                                <p className="text-xs text-slate-400">{quote.customer.companyName}</p>
                              )}
                              <p className="text-xs text-slate-400">{quote.customer.whatsapp}</p>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {quote.firstItem ? (
                            <div>
                              <p className="font-medium text-slate-700 max-w-[180px] truncate">{quote.firstItem.productName}</p>
                              <p className="text-xs text-slate-400">{quote.firstItem.quantity.toLocaleString("fr-SN")} × {quote.firstItem.unitPrice.toLocaleString("fr-SN")} FCFA</p>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{formatDateShort(quote.createdAt)}</td>
                        <td className="px-6 py-4 text-right font-black text-slate-700 tabular-nums">
                          {formatPrice(quote.total)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingQuote(quote)}
                              title="Modifier le devis"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <a
                              href={`/api/admin/devis/${quote.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Télécharger le devis PDF"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            {quote.customer && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Répondre sur WhatsApp"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
