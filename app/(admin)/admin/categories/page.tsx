import { getCategories } from "@/lib/db/categories";
import { FolderOpen, Plus } from "lucide-react";

export default async function AdminCategoriesPage() {
  const result = await getCategories();
  const categories = result.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">
            Gestion des catégories
          </h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {categories.length} catégorie{categories.length > 1 ? "s" : ""} actives
          </p>
        </div>
        <button className="h-10 px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark hover:shadow-lg hover:shadow-brand-primary/25 transition-all">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-slate-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-700 group-hover:text-brand-primary transition-colors truncate">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {cat.description ?? "Pas de description"}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">
                    Ordre: {cat.displayOrder}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    cat.isActive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                  }`}>
                    {cat.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
