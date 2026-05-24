"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save, Plus, Trash2, AlertCircle } from "lucide-react";
import type { Product, Category, ProductQuantityTier } from "@/lib/types/domain";
import {
  createProductAction,
  updateProductAction,
  replaceQuantityTiersAction,
} from "@/lib/actions/products";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface TierDraft {
  id?: string;
  min_qty: number;
  max_qty: number | null;
  base_unit_price: number;
  label: string;
}

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  quantityTiers?: ProductQuantityTier[];
  onClose: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ProductForm({ product, categories, quantityTiers, onClose }: ProductFormProps) {
  const isEditing = !!product;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? (categories[0]?.id ?? ""));
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const existingImages = product?.imageUrls ?? [];
  const [mainImage, setMainImage] = useState(existingImages[0] ?? "");
  const [otherImages, setOtherImages] = useState(existingImages.slice(1).join("\n") ?? "");
  const [baseTurnaroundDays, setBaseTurnaroundDays] = useState(product?.baseTurnaroundDays ?? 3);
  const [minOrderQuantity, setMinOrderQuantity] = useState(product?.minOrderQuantity ?? 1);
  const [unitType, setUnitType] = useState(product?.unitType ?? "piece");
  const [isPopular, setIsPopular] = useState(product?.isPopular ?? false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [tags, setTags] = useState(product?.tags?.join(", ") ?? "");
  const [displayOrder, setDisplayOrder] = useState(product?.displayOrder ?? 0);
  const [autoSlug, setAutoSlug] = useState(!isEditing);

  const [tiers, setTiers] = useState<TierDraft[]>(() => {
    if (!quantityTiers || quantityTiers.length === 0) return [];
    return quantityTiers
      .sort((a, b) => a.minQty - b.minQty)
      .map((t) => ({
        id: t.id,
        min_qty: t.minQty,
        max_qty: t.maxQty,
        base_unit_price: t.baseUnitPrice,
        label: t.label ?? "",
      }));
  });
  const [tierErrors, setTierErrors] = useState<string[]>([]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) setSlug(slugify(val));
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier ? (lastTier.max_qty ? lastTier.max_qty + 1 : lastTier.min_qty + 100) : 1;
    setTiers([...tiers, { min_qty: newMin, max_qty: null, base_unit_price: 0, label: "" }]);
  };

  const updateTier = (index: number, field: keyof TierDraft, value: number | string | null) => {
    setTiers(tiers.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const validateTiers = (): string[] => {
    const errors: string[] = [];
    for (let i = 0; i < tiers.length; i++) {
      const t = tiers[i];
      if (t.min_qty < 1) errors.push(`Palier ${i + 1} : quantité min doit être ≥ 1`);
      if (t.base_unit_price < 0) errors.push(`Palier ${i + 1} : prix unitaire invalide`);
      if (t.max_qty !== null && t.max_qty < t.min_qty) {
        errors.push(`Palier ${i + 1} : quantité max < quantité min`);
      }
      if (i > 0) {
        const prev = tiers[i - 1];
        const prevEnd = prev.max_qty ?? Infinity;
        if (t.min_qty <= prevEnd && prev.max_qty !== null) {
          errors.push(`Palier ${i + 1} : chevauchement avec le palier précédent`);
        }
      }
    }
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTierErrors([]);

    const tierValidationErrors = validateTiers();
    if (tierValidationErrors.length > 0) {
      setTierErrors(tierValidationErrors);
      return;
    }

    const parsedOtherImages = otherImages
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    const parsedImageUrls = [mainImage, ...parsedOtherImages].filter(Boolean);

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name,
      slug,
      category_id: categoryId,
      short_description: shortDescription || null,
      description: description || null,
      image_urls: parsedImageUrls,
      base_turnaround_days: baseTurnaroundDays,
      min_order_quantity: minOrderQuantity,
      unit_type: unitType as "piece" | "m2" | "lot",
      is_popular: isPopular,
      is_active: isActive,
      tags: parsedTags,
      display_order: displayOrder,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateProductAction(product!.id, payload)
        : await createProductAction(payload);

      if (result.error) {
        setError(result.error);
        return;
      }

      const productId = isEditing ? product!.id : result.data!.id;

      const tiersPayload = tiers.map((t) => ({
        min_qty: t.min_qty,
        max_qty: t.max_qty,
        base_unit_price: t.base_unit_price,
        label: t.label || null,
      }));

      const tiersResult = await replaceQuantityTiersAction({
        productId,
        tiers: tiersPayload,
      });

      if (tiersResult.error) {
        setError(tiersResult.error);
        return;
      }

      router.refresh();
      onClose();
    });
  };

  const inputClass = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all";
  const labelClass = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92dvh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-black text-slate-800 font-heading">
            {isEditing ? "Modifier le produit" : "Nouveau produit"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Nom + Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nom *</label>
              <input type="text" required value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} placeholder="Carte de Visite" />
            </div>
            <div>
              <label className={labelClass}>
                Slug *
                {!isEditing && (
                  <button type="button" onClick={() => setAutoSlug(!autoSlug)} className="ml-2 text-brand-primary normal-case tracking-normal">
                    {autoSlug ? "(auto)" : "(manuel)"}
                  </button>
                )}
              </label>
              <input type="text" required value={slug} onChange={(e) => { setAutoSlug(false); setSlug(e.target.value); }} className={`${inputClass} font-mono`} placeholder="carte-de-visite" />
            </div>
          </div>

          {/* Catégorie + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Catégorie *</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Unité</label>
              <select value={unitType} onChange={(e) => {
                const val = e.target.value;
                if (val === "piece" || val === "m2" || val === "lot") setUnitType(val);
              }} className={inputClass}>
                <option value="piece">Pièce</option>
                <option value="m2">mètre carré (m²)</option>
                <option value="lot">Lot</option>
              </select>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className={labelClass}>Description courte</label>
            <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputClass} placeholder="Résumé en une ligne" />
          </div>
          <div>
            <label className={labelClass}>Description complète</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="Description détaillée du produit..." />
          </div>

          {/* Images */}
          <div className="space-y-4">
            <ImageUploadField
              value={mainImage}
              onChange={setMainImage}
              folder="products"
              slug={slug}
              label="Image principale"
            />
            <div>
              <label className={labelClass}>Autres images (URLs, une par ligne)</label>
              <textarea value={otherImages} onChange={(e) => setOtherImages(e.target.value)} rows={2} className={`${inputClass} resize-none font-mono text-xs`} placeholder={"/images/products/exemple2.jpg"} />
            </div>
          </div>

          {/* Délai, Qté min, Ordre */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Délai (jours)</label>
              <input type="number" min={1} value={baseTurnaroundDays} onChange={(e) => setBaseTurnaroundDays(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Qté minimum</label>
              <input type="number" min={1} value={minOrderQuantity} onChange={(e) => setMinOrderQuantity(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ordre</label>
              <input type="number" min={0} value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} className={inputClass} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={labelClass}>Tags (séparés par des virgules)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} placeholder="carte, visite, pro" />
          </div>

          {/* ── Tarification / Paliers de prix ── */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">Tarification / Paliers de prix</h3>
              <span className="text-[10px] font-bold text-slate-400">
                {tiers.length} palier{tiers.length > 1 ? "s" : ""}
              </span>
            </div>

            {tiers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 font-medium mb-2">Aucun palier tarifaire défini</p>
                <button type="button" onClick={addTier} className="text-xs font-bold text-brand-primary hover:text-brand-primary-dark transition-colors">
                  + Ajouter un premier palier
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {tiers.map((tier, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] sm:grid-cols-[1fr_1fr_1fr_1.5fr_auto] gap-2 items-end">
                      <div>
                        {index === 0 && <label className="block text-[10px] font-bold text-slate-400 mb-1">Qté min</label>}
                        <input
                          type="number"
                          min={1}
                          value={tier.min_qty}
                          onChange={(e) => updateTier(index, "min_qty", Number(e.target.value))}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-brand-primary/50 transition-all"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        {index === 0 && <label className="block text-[10px] font-bold text-slate-400 mb-1">Qté max</label>}
                        <input
                          type="number"
                          min={0}
                          value={tier.max_qty ?? ""}
                          onChange={(e) => updateTier(index, "max_qty", e.target.value === "" ? null : Number(e.target.value))}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-brand-primary/50 transition-all"
                          placeholder="∞"
                        />
                      </div>
                      <div>
                        {index === 0 && <label className="block text-[10px] font-bold text-slate-400 mb-1">Prix (FCFA)</label>}
                        <input
                          type="number"
                          min={0}
                          value={tier.base_unit_price}
                          onChange={(e) => updateTier(index, "base_unit_price", Number(e.target.value))}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-brand-primary/50 transition-all"
                          placeholder="150"
                        />
                      </div>
                      <div className="hidden sm:block">
                        {index === 0 && <label className="block text-[10px] font-bold text-slate-400 mb-1">Libellé</label>}
                        <input
                          type="text"
                          value={tier.label}
                          onChange={(e) => updateTier(index, "label", e.target.value)}
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-brand-primary/50 transition-all"
                          placeholder="100-299 ex."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTier(index)}
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors shrink-0"
                        title="Supprimer ce palier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addTier} className="text-xs font-bold text-brand-primary hover:text-brand-primary-dark transition-colors flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Ajouter un palier
                </button>
              </>
            )}

            {tierErrors.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 space-y-1">
                {tierErrors.map((err, i) => (
                  <p key={i} className="text-[11px] font-semibold text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {err}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-brand-primary transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Actif</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-amber-400 transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Populaire</span>
            </label>
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
            <button type="button" onClick={onClose} className="h-10 px-5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-10 px-6 rounded-xl bg-brand-primary text-white text-sm font-bold flex items-center gap-2 hover:bg-brand-primary-dark hover:shadow-lg hover:shadow-brand-primary/25 transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
