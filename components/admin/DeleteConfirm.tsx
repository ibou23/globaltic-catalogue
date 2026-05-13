"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

interface DeleteConfirmProps {
  title: string;
  description: string;
  onConfirm: () => Promise<{ error: string | null }>;
  onClose: () => void;
}

export function DeleteConfirm({ title, description, onConfirm, onClose }: DeleteConfirmProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await onConfirm();
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-black text-slate-800 font-heading">{title}</h3>
          <p className="text-sm text-slate-400 mt-2">{description}</p>

          {error && (
            <div className="w-full bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 mt-4">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mt-6 w-full">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
