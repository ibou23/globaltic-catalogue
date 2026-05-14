"use client";

import type { AdminProfile } from "@/lib/types/domain";
import { Menu } from "lucide-react";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { GlobalSearch } from "@/components/admin/GlobalSearch";

interface AdminTopbarProps {
  admin: AdminProfile;
  title: string;
  description?: string;
  unreadCount: number;
  onMenuToggle?: () => void;
}

export function AdminTopbar({ admin, title, description, unreadCount, onMenuToggle }: AdminTopbarProps) {
  const initials = admin.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleBadge: Record<string, { label: string; color: string }> = {
    patron: { label: "Patron", color: "bg-amber-100 text-amber-700" },
    admin: { label: "Admin", color: "bg-blue-100 text-blue-700" },
    commercial: { label: "Commercial", color: "bg-green-100 text-green-700" },
    production: { label: "Production", color: "bg-purple-100 text-purple-700" },
    infographiste: { label: "Infographiste", color: "bg-pink-100 text-pink-700" },
  };

  const badge = roleBadge[admin.role] ?? roleBadge.admin;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center justify-between h-[64px] sm:h-[72px] px-4 sm:px-6 lg:px-8">
        {/* Left — Hamburger (mobile) + Page title */}
        <div className="flex items-center gap-3 min-w-0">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all shrink-0"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-slate-800 font-heading tracking-tight truncate">{title}</h1>
            {description && (
              <p className="hidden sm:block text-xs text-slate-400 font-medium mt-0.5">{description}</p>
            )}
          </div>
        </div>

        {/* Right — Actions + User */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search */}
          <GlobalSearch role={admin.role} />

          {/* Notifications */}
          <NotificationBell initialUnread={unreadCount} isPatron={admin.role === "patron"} />

          {/* Separator */}
          <div className="hidden sm:block w-px h-8 bg-slate-200 mx-1" />

          {/* User */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 leading-none">{admin.fullName}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            {admin.avatarUrl ? (
              <img
                src={admin.avatarUrl}
                alt={admin.fullName}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-sm font-black ring-2 ring-slate-100">
                {initials}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
