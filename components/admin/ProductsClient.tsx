"use client";

import { useState } from "react";
import { Package, Plus, Pencil, Trash2, Search, Tag } from "lucide-react";
import type { Product, Category } from "@/lib/types/domain";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteConfirm } from "@/components/admin/DeleteConfirm";
import { ActiveFilterBadge } from "@/components/admin/ActiveFilterBadge";
import { deleteProductAction } from "@/lib/actions/products";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ActiveFilter {
  label: string;
  count: number;
  resetHref: string;
}

interface ProductsClientProps {
  products: Product[];
  categories: Category[];
  totalCount?: number;
  activeFilter?: ActiveFilter;
}

export function ProductsClient({ products, categories, totalCount, activeFilter }: ProductsClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [deleting, setDeleting] = useState<Product | undefined>(undefined);
  const [search, setSearch] = useState("");

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Le filtrage URL est fait côté serveur ; ici on filtre uniquement par la recherche locale
  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.includes(search.toLowerCase())
      )
    : products;

  const openCreate = () => { setEditing(undefined); setShowForm(true); };
  const openEdit = (p: Product) => { setEditing(p); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(undefined); };

  const handleDelete = async () => {
    if (!deleting) return { error: "Aucun produit sélectionné" };
    const result = await deleteProductAction(deleting.id);
    if (!result.error) router.refresh();
    return { error: result.error };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-heading tracking-tight">Gestion des produits</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">
            {activeFilter
              ? `${products.length} résultat${products.length > 1 ? "s" : ""} sur ${totalCount ?? products.length} produits`
              : `${products.length} produit${products.length > 1 ? "s" : ""} au catalogue`}
          </p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 sm:px-5 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark hover:shadow-lg hover:shadow-brand-primary/25 transition-all shrink-0">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>

      {activeFilter && (
        <ActiveFilterBadge
          label={activeFilter.label}
          count={activeFilter.count}
          resetHref={activeFilter.resetHref}
        />
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 px-6 py-12 text-center">
          <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-300">Aucun produit trouvé</p>
        </div>
      ) : (
        <>
          {/* ── Vue mobile : cards ── */}
          <div className="sm:hidden space-y-3">
            {filtered.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  {product.imageUrls[0] ? (
                    <img src={product.imageUrls[0]} alt={product.name} className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-100 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-700 truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-semibold text-slate-400">{categoryMap.get(product.categoryId) ?? "—"}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${product.isActive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                        {product.isActive ? "Actif" : "Inactif"}
                      </span>
                      {product.isPopular && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-600">Populaire</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                  <Link
                    href={`/admin/produits/${product.id}`}
                    className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" /> Tarifs
                  </Link>
                  <button onClick={() => openEdit(product)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-brand-primary/10 text-slate-400 hover:text-brand-primary flex items-center justify-center transition-colors" title="Modifier">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleting(product)} className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors" title="Supprimer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Vue desktop : tableau ── */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Produit</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catégorie</th>
                    <th className="text-left px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pop.</th>
                    <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                    <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrls[0] ? (
                            <img src={product.imageUrls[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Package className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-700 group-hover:text-brand-primary transition-colors">{product.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-xs font-semibold text-slate-500">{categoryMap.get(product.categoryId) ?? "—"}</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">{product.unitType === "m2" ? "mètre carré (m²)" : product.unitType}</span></td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${product.isPopular ? "bg-amber-400" : "bg-slate-200"}`} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${product.isActive ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                          {product.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/admin/produits/${product.id}`} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-cyan-50 flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-colors" title="Tarifs">
                            <span className="text-[10px] font-black">€</span>
                          </Link>
                          <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-brand-primary/10 flex items-center justify-center text-slate-400 hover:text-brand-primary transition-colors" title="Modifier">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleting(product)} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" title="Supprimer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {showForm && <ProductForm product={editing} categories={categories} onClose={closeForm} />}
      {deleting && (
        <DeleteConfirm
          title="Supprimer le produit"
          description={`Êtes-vous sûr de vouloir supprimer « ${deleting.name} » ? Les tarifs et options liés seront supprimés (CASCADE).`}
          onConfirm={handleDelete}
          onClose={() => setDeleting(undefined)}
        />
      )}
    </div>
  );
}
