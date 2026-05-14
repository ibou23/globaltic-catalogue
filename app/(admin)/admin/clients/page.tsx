import { getCustomers } from "@/lib/db/customers";
import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { formatDateShort } from "@/lib/utils/format";
import { Users, Plus, Search } from "lucide-react";

export default async function AdminClientsPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "clients")) {
    return <AccessDenied />;
  }

  const result = await getCustomers();
  const customers = result.data ?? [];

  const tierLabels: Record<string, { label: string; color: string }> = {
    nouveau: { label: "Nouveau", color: "bg-slate-100 text-slate-600" },
    regulier: { label: "Régulier", color: "bg-blue-100 text-blue-600" },
    vip: { label: "VIP", color: "bg-amber-100 text-amber-600" },
    premium: { label: "Premium", color: "bg-purple-100 text-purple-600" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">Gestion des clients</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">{customers.length} client{customers.length > 1 ? "s" : ""} enregistrés</p>
        </div>
        <button className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark transition-all">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input type="text" placeholder="Rechercher un client..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-brand-primary/50 transition-all" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fidélité</th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {customers.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center"><Users className="w-8 h-8 text-slate-200 mx-auto mb-2" /><p className="text-xs font-bold text-slate-300">Aucun client</p></td></tr>
            ) : customers.map((c) => {
              const tier = tierLabels[c.loyaltyTier] ?? tierLabels.nouveau;
              return (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4"><p className="font-bold text-slate-700">{c.contactName}</p>{c.companyName && <p className="text-[11px] text-slate-400">{c.companyName}</p>}</td>
                  <td className="px-6 py-4 text-slate-600">{c.whatsapp}</td>
                  <td className="px-6 py-4 text-center"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${tier.color}`}>{tier.label}</span></td>
                  <td className="px-6 py-4 text-slate-500">{formatDateShort(c.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
