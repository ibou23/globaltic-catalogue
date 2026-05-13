import { getQuotes } from "@/lib/db/quotes";
import { formatPrice, formatDateShort } from "@/lib/utils/format";
import { FileText, Plus, Search } from "lucide-react";

export default async function AdminDevisPage() {
  const result = await getQuotes();
  const quotes = result.data ?? [];

  const statusLabels: Record<string, { label: string; color: string }> = {
    brouillon: { label: "Brouillon", color: "bg-slate-100 text-slate-600" },
    envoye: { label: "Envoyé", color: "bg-blue-100 text-blue-600" },
    accepte: { label: "Accepté", color: "bg-green-100 text-green-600" },
    refuse: { label: "Refusé", color: "bg-red-100 text-red-600" },
    expire: { label: "Expiré", color: "bg-amber-100 text-amber-600" },
  };

  return (
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
        <button className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark hover:shadow-lg hover:shadow-brand-primary/25 transition-all">
          <Plus className="w-4 h-4" /> Nouveau devis
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          type="text"
          placeholder="Rechercher par référence..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Référence</th>
                <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Urgent</th>
                <th className="text-right px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-300">Aucun devis</p>
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => {
                  const status = statusLabels[quote.status] ?? { label: quote.status, color: "bg-slate-100 text-slate-600" };
                  return (
                    <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{quote.reference}</td>
                      <td className="px-6 py-4 text-slate-500">{formatDateShort(quote.createdAt)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {quote.isUrgent && (
                          <span className="px-2 py-1 rounded-md bg-red-100 text-[10px] font-bold text-red-600 uppercase">Urgent</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-700 tabular-nums">
                        {formatPrice(quote.total)}
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
  );
}
