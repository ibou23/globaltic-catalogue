"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save } from "lucide-react";
import type { Product, Category } from "@/lib/types/domain";
import {
  createProductAction,
  updateProductAction,
} from "@/lib/actions/products";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
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

export function ProductForm({ product, categories, onClose }: ProductFormProps) {
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

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) setSlug(slugify(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      } else {
        router.refresh();
        onClose();
      }
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
