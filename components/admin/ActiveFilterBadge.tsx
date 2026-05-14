import Link from "next/link";
import { X } from "lucide-react";

interface ActiveFilterBadgeProps {
  label: string;
  count: number;
  resetHref: string;
}

export function ActiveFilterBadge({ label, count, resetHref }: ActiveFilterBadgeProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
        <span className="text-xs font-bold text-brand-primary">Filtre :</span>
        <span className="text-xs font-semibold text-brand-primary">{label}</span>
        <span className="text-[10px] font-black text-brand-primary/70 bg-brand-primary/10 px-1.5 py-0.5 rounded-full">
          {count}
        </span>
        <Link
          href={resetHref}
          className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-brand-primary/20 transition-colors"
          title="Réinitialiser le filtre"
        >
          <X className="w-3 h-3 text-brand-primary" />
        </Link>
      </div>
    </div>
  );
}
