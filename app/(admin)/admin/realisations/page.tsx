import { createClient } from "@/lib/supabase/server";
import { Image as ImageIcon } from "lucide-react";

export default async function AdminRealisationsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("realisations").select("*").order("display_order", { ascending: true });
  const realisations = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">Réalisations</h2>
        <p className="text-sm text-slate-400 font-medium mt-1">{realisations.length} réalisation{realisations.length > 1 ? "s" : ""}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {realisations.map((r: Record<string, unknown>) => (
          <div key={r.id as string} className="bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-lg transition-all">
            {r.image_url ? (
              <img src={r.image_url as string} alt={r.title as string} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-slate-100 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-200" /></div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-slate-700 text-sm">{r.title as string}</h3>
              <p className="text-[11px] text-slate-400 mt-1">{r.category as string} — {r.client_name as string}</p>
              {Boolean(r.is_featured) && <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-amber-100 text-[10px] font-bold text-amber-600 uppercase">À la une</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
