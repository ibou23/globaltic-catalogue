"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { ChevronDown, Loader2, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  color: string;
}

interface QuickStatusSelectProps {
  current: string;
  options: Option[];
  onSelect: (value: string) => Promise<{ error?: string | null }>;
  disabled?: boolean;
}

export function QuickStatusSelect({ current, options, onSelect, disabled }: QuickStatusSelectProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const currentOption = options.find((o) => o.value === current) ?? { label: current, color: "bg-slate-100 text-slate-600" };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(value: string) {
    if (value === current) { setOpen(false); return; }
    setOpen(false);
    setError(null);
    startTransition(async () => {
      const result = await onSelect(value);
      if (result.error) setError(result.error);
    });
  }

  if (disabled) {
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${currentOption.color}`}>
        {currentOption.label}
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${currentOption.color}`}
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : currentOption.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {error && <p className="absolute top-full left-0 mt-1 text-[10px] text-red-500 font-semibold whitespace-nowrap z-50">{error}</p>}
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-50 min-w-[160px] py-1 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${opt.color}`}>{opt.label}</span>
              {opt.value === current && <Check className="w-3 h-3 text-brand-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
