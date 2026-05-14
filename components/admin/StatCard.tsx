import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  color: "blue" | "green" | "purple" | "amber" | "rose" | "cyan";
  href?: string;
}

const colorMap = {
  blue: {
    icon: "bg-blue-500/10 text-blue-600",
    arrow: "text-blue-400",
  },
  green: {
    icon: "bg-emerald-500/10 text-emerald-600",
    arrow: "text-emerald-400",
  },
  purple: {
    icon: "bg-purple-500/10 text-purple-600",
    arrow: "text-purple-400",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600",
    arrow: "text-amber-400",
  },
  rose: {
    icon: "bg-rose-500/10 text-rose-600",
    arrow: "text-rose-400",
  },
  cyan: {
    icon: "bg-cyan-500/10 text-cyan-600",
    arrow: "text-cyan-400",
  },
};

export function StatCard({ label, value, icon: Icon, trend, color, href }: StatCardProps) {
  const colors = colorMap[color];

  const inner = (
    <div className={cn(
      "bg-white rounded-2xl border border-slate-100 p-5 transition-all duration-300 group relative overflow-hidden",
      href
        ? "cursor-pointer hover:shadow-lg hover:shadow-slate-200/60 hover:border-slate-200 hover:-translate-y-0.5"
        : "hover:shadow-lg hover:shadow-slate-200/50"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-slate-800 mt-2 font-heading tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs font-bold mt-2 flex items-center gap-1",
              trend.positive ? "text-emerald-600" : "text-red-500"
            )}>
              <span>{trend.positive ? "↑" : "↓"}</span>
              {trend.value}
            </p>
          )}
        </div>

        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0",
          colors.icon
        )}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {/* Indicateur "Voir" visible au hover uniquement si lien présent */}
      {href && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className={cn("text-[10px] font-bold", colors.arrow)}>Voir</span>
          <ArrowUpRight className={cn("w-3 h-3", colors.arrow)} />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 rounded-2xl">
        {inner}
      </Link>
    );
  }

  return inner;
}
