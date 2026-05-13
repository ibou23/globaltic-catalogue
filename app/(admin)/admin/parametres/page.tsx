import { createClient } from "@/lib/supabase/server";
import { Settings } from "lucide-react";

export default async function AdminParametresPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("business_config").select("*").order("key");
  const configs = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">Paramètres</h2>
        <p className="text-sm text-slate-400 font-medium mt-1">Configuration générale de la plateforme</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clé</th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valeur</th>
              <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {configs.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-12 text-center"><Settings className="w-8 h-8 text-slate-200 mx-auto mb-2" /><p className="text-xs font-bold text-slate-300">Aucune configuration</p></td></tr>
            ) : configs.map((c: Record<string, unknown>) => (
              <tr key={c.key as string} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-bold text-brand-primary">{c.key as string}</td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs max-w-xs truncate">{String(c.value)}</td>
                <td className="px-6 py-4 text-slate-400 text-xs">{c.description as string}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
