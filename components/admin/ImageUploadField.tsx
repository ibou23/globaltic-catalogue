"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/utils/upload";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder: "products" | "categories" | "realisations";
  slug: string;
  label?: string;
}

export function ImageUploadField({ value, onChange, folder, slug, label = "Image principale" }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const result = await uploadImage(file, folder, slug);
    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      onChange(result.url);
    }
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-[10px] text-brand-primary font-bold hover:underline">
          {showAdvanced ? "Masquer URL manuelle" : "URL manuelle"}
        </button>
      </div>

      <div className="flex items-start gap-4">
        {/* Preview Area */}
        <div className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 group">
          {value ? (
            <>
              <img src={value} alt="Aperçu" className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={handleRemove}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                title="Supprimer l'image"
              >
                <X className="w-6 h-6" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-300" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            </div>
          )}
        </div>

        {/* Actions Area */}
        <div className="flex-1 space-y-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 w-full justify-center disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Changer l'image
          </button>
          <p className="text-[10px] text-slate-400 text-center">Format recommandé : JPG, PNG, WEBP</p>
        </div>
      </div>

      {/* Advanced URL Input */}
      {showAdvanced && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30 transition-all"
          placeholder="https://..."
        />
      )}

      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
    </div>
  );
}
