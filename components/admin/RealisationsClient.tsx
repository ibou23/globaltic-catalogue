"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import type { Realisation } from "@/lib/types/domain";
import { RealisationForm } from "@/components/admin/RealisationForm";
import { DeleteConfirm } from "@/components/admin/DeleteConfirm";
import { deleteRealisationAction } from "@/lib/actions/realisations";
import { useRouter } from "next/navigation";

interface RealisationsClientProps {
  realisations: Realisation[];
}

export function RealisationsClient({ realisations }: RealisationsClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Realisation | undefined>(undefined);
  const [deleting, setDeleting] = useState<Realisation | undefined>(undefined);

  const openCreate = () => { setEditing(undefined); setShowForm(true); };
  const openEdit = (r: Realisation) => { setEditing(r); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(undefined); };

  const handleDelete = async () => {
    if (!deleting) return { error: "Aucune réalisation sélectionnée" };
    const result = await deleteRealisationAction(deleting.id);
    if (!result.error) router.refresh();
    return { error: result.error };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">Réalisations</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">{realisations.length} réalisation{realisations.length > 1 ? "s" : ""}</p>
        </div>
        <button onClick={openCreate} className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark hover:shadow-lg hover:shadow-brand-primary/25 transition-all">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {realisations.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden group hover:shadow-lg transition-all relative">
            {r.imageUrl ? (
              <img src={r.imageUrl} alt={r.title} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-40 bg-slate-100 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-200" /></div>
            )}
            <div className="p-4">
              <h3 className="font-bold text-slate-700 text-sm truncate">{r.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{r.category} {r.clientName ? `— ${r.clientName}` : ""}</p>
              <div className="flex items-center gap-2 mt-2">
                {r.isFeatured && <span className="px-2 py-0.5 rounded-md bg-amber-100 text-[10px] font-bold text-amber-600 uppercase">À la une</span>}
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">Ordre: {r.displayOrder}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
              <button onClick={() => openEdit(r)} className="w-8 h-8 rounded-lg bg-white hover:bg-brand-primary/10 flex items-center justify-center text-slate-500 hover:text-brand-primary transition-colors" title="Modifier">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setDeleting(r)} className="w-8 h-8 rounded-lg bg-white hover:bg-red-50 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors" title="Supprimer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {showForm && <RealisationForm realisation={editing} onClose={closeForm} />}
      {deleting && (
        <DeleteConfirm
          title="Supprimer la réalisation"
          description={`Êtes-vous sûr de vouloir supprimer « ${deleting.title} » ? Cette action est irréversible.`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(undefined)}
        />
      )}
    </div>
  );
}
