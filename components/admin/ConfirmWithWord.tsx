"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

const CONFIRM_WORD = "SUPPRIMER";

interface ConfirmWithWordProps {
  title: string;
  description: string;
  warning?: string;
  onConfirm: (confirmation: string) => Promise<{ error?: string | null }>;
  onClose: () => void;
}

export function ConfirmWithWord({ title, description, warning, onConfirm, onClose }: ConfirmWithWordProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isValid = input === CONFIRM_WORD;

  function handleConfirm() {
    if (!isValid) return;
    setError(null);
    startTransition(async () => {
      const result = await onConfirm(input);
      if (result.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-black text-slate-800 font-heading">{title}</h3>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">{description}</p>

          {warning && (
            <div className="w-full mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
              <p className="text-xs font-bold text-amber-700">{warning}</p>
            </div>
          )}

          <div className="w-full mt-5">
            <p className="text-xs font-bold text-slate-500 mb-2 text-left">
              Tapez <span className="font-black text-red-600 font-mono">{CONFIRM_WORD}</span> pour confirmer :
            </p>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder={CONFIRM_WORD}
              autoComplete="off"
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-mono font-bold placeholder:text-slate-300 focus:outline-none focus:border-red-400 transition-all uppercase"
            />
          </div>

          {error && (
            <div className="w-full bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 mt-3 text-left">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mt-5 w-full">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isValid || isPending}
              className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
