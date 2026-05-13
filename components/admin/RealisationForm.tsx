"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save } from "lucide-react";
import type { Realisation } from "@/lib/types/domain";
import {
  createRealisationAction,
  updateRealisationAction,
} from "@/lib/actions/realisations";
import { useRouter } from "next/navigation";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface RealisationFormProps {
  realisation?: Realisation;
  onClose: () => void;
}

export function RealisationForm({ realisation, onClose }: RealisationFormProps) {
  const isEditing = !!realisation;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(realisation?.title ?? "");
  const [category, setCategory] = useState(realisation?.category ?? "");
  const [clientName, setClientName] = useState(realisation?.clientName ?? "");
  const [description, setDescription] = useState(realisation?.description ?? "");
  const [imageUrl, setImageUrl] = useState(realisation?.imageUrl ?? "");
  const [isFeatured, setIsFeatured] = useState(realisation?.isFeatured ?? false);
  const [displayOrder, setDisplayOrder] = useState(realisation?.displayOrder ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imageUrl) {
      setError("L'image est requise.");
      return;
    }

    const payload = {
      title,
      category,
      client_name: clientName || null,
      description: description || null,
      image_url: imageUrl,
      is_featured: isFeatured,
      display_order: displayOrder,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateRealisationAction(realisation!.id, payload)
        : await createRealisationAction(payload);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-black text-slate-800 font-heading">
            {isEditing ? "Modifier la réalisation" : "Nouvelle réalisation"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image Upload */}
          <ImageUploadField
            value={imageUrl}
            onChange={setImageUrl}
            folder="realisations"
            slug={`rea-${Date.now()}`}
            label="Image de la réalisation *"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className={labelClass}>Titre *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="Enseigne lumineuse XYZ"
              />
            </div>

            {/* Category */}
            <div>
              <label className={labelClass}>Catégorie *</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
                placeholder="Signalétique"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Name */}
            <div>
              <label className={labelClass}>Client</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={inputClass}
                placeholder="Nom du client"
              />
            </div>

            {/* Order */}
            <div>
              <label className={labelClass}>Ordre</label>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Description du projet..."
            />
          </div>

          {/* Featured toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-amber-400 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
            </div>
            <span className="text-sm font-semibold text-slate-600">Mettre à la une</span>
          </label>

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
