import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  color: "blue" | "green" | "purple" | "amber" | "rose" | "cyan";
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "bg-blue-500/10 text-blue-600",
    ring: "ring-blue-500/20",
  },
  green: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-500/10 text-emerald-600",
    ring: "ring-emerald-500/20",
  },
  purple: {
    bg: "bg-purple-50",
    icon: "bg-purple-500/10 text-purple-600",
    ring: "ring-purple-500/20",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "bg-amber-500/10 text-amber-600",
    ring: "ring-amber-500/20",
  },
  rose: {
    bg: "bg-rose-50",
    icon: "bg-rose-500/10 text-rose-600",
    ring: "ring-rose-500/20",
  },
  cyan: {
    bg: "bg-cyan-50",
    icon: "bg-cyan-500/10 text-cyan-600",
    ring: "ring-cyan-500/20",
  },
};

export function StatCard({ label, value, icon: Icon, trend, color }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-slate-800 mt-2 font-heading tracking-tight">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-xs font-bold mt-2 flex items-center gap-1",
                trend.positive ? "text-emerald-600" : "text-red-500"
              )}
            >
              <span>{trend.positive ? "↑" : "↓"}</span>
              {trend.value}
            </p>
          )}
        </div>

        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            colors.icon
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
