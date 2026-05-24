"use client";

import { useState, useTransition } from "react";
import { Package, Plus, Pencil, Trash2, Search, Tag, Eye, EyeOff, Star, ExternalLink, Copy } from "lucide-react";
import type { Product, Category } from "@/lib/types/domain";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteConfirm } from "@/components/admin/DeleteConfirm";
import { ActiveFilterBadge } from "@/components/admin/ActiveFilterBadge";
import { deleteProductAction, updateProductAction, getProductTiersAction } from "@/lib/actions/products";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ProductQuantityTier } from "@/lib/types/domain";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingTiers, setEditingTiers] = useState<ProductQuantityTier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(false);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.includes(search.toLowerCase())
      )
    : products;

  const openCreate = () => { setEditing(undefined); setEditingTiers([]); setShowForm(true); };
  const openEdit = async (p: Product) => {
    setEditing(p);
    setLoadingTiers(true);
    setShowForm(true);
    const result = await getProductTiersAction(p.id);
    setEditingTiers(result.data?.quantityTiers ?? []);
    setLoadingTiers(false);
  };
  const closeForm = () => { setShowForm(false); setEditing(undefined); setEditingTiers([]); };

  const handleDelete = async () => {
    if (!deleting) return { error: "Aucun produit sélectionné" };
    const result = await deleteProductAction(deleting.id);
    if (!result.error) router.refresh();
    return { error: result.error };
  };

  function handleToggle(product: Product, field: "is_active" | "is_popular") {
    setPendingId(product.id + field);
    startTransition(async () => {
      const patch = field === "is_active"
        ? { is_active: !product.isActive }
        : { is_popular: !product.isPopular };
      const result = await updateProductAction(product.id, patch);
      if (!result.error) router.refresh();
      setPendingId(null);
    });
  }

  function handleCopyLink(product: Product) {
    const url = `${window.location.origin}/produit/${product.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(product.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

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
                    </div>
                  </div>
                </div>

                {/* Quick toggles */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleToggle(product, "is_active")}
                    disabled={isPending && pendingId === product.id + "is_active"}
                    className={`flex-1 h-8 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${product.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                  >
                    {product.isActive ? <><Eye className="w-3 h-3" /> Actif</> : <><EyeOff className="w-3 h-3" /> Inactif</>}
                  </button>
                  <button
                    onClick={() => handleToggle(product, "is_popular")}
                    disabled={isPending && pendingId === product.id + "is_popular"}
                    className={`flex-1 h-8 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${product.isPopular ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    <Star className="w-3 h-3" /> {product.isPopular ? "Populaire" : "Non populaire"}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Link
                    href={`/admin/produits/${product.id}`}
                    className="flex-1 h-9 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Tag className="w-3.5 h-3.5" /> Tarifs
                  </Link>
                  <button
                    onClick={() => handleCopyLink(product)}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                    title={copiedId === product.id ? "Lien copié !" : "Copier le lien public"}
                  >
                    <Copy className={`w-3.5 h-3.5 ${copiedId === product.id ? "text-emerald-500" : ""}`} />
                  </button>
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
                    <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                    <th className="text-center px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Populaire</th>
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
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">{product.unitType === "m2" ? "m²" : product.unitType}</span></td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggle(product, "is_active")}
                          disabled={isPending && pendingId === product.id + "is_active"}
                          title={product.isActive ? "Cliquer pour désactiver" : "Cliquer pour activer"}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${product.isActive ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200" : "bg-red-100 text-red-600 hover:bg-red-200"} disabled:opacity-50`}
                        >
                          {product.isActive ? "Actif" : "Inactif"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggle(product, "is_popular")}
                          disabled={isPending && pendingId === product.id + "is_popular"}
                          title={product.isPopular ? "Retirer du populaire" : "Marquer comme populaire"}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-colors cursor-pointer disabled:opacity-50 ${product.isPopular ? "bg-amber-100 text-amber-500 hover:bg-amber-200" : "bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500"}`}
                        >
                          <Star className="w-3.5 h-3.5" fill={product.isPopular ? "currentColor" : "none"} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/admin/produits/${product.id}`} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-cyan-50 flex items-center justify-center text-slate-400 hover:text-cyan-600 transition-colors" title="Tarifs">
                            <Tag className="w-3.5 h-3.5" />
                          </Link>
                          <a
                            href={`/produit/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            title="Voir la page publique"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleCopyLink(product)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${copiedId === product.id ? "bg-emerald-100 text-emerald-500" : "bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600"}`}
                            title={copiedId === product.id ? "Lien copié !" : "Copier le lien public"}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
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
      {showForm && <ProductForm product={editing} categories={categories} quantityTiers={editingTiers} onClose={closeForm} />}
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
