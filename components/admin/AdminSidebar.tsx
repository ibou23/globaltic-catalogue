"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  FileText,
  ShoppingCart,
  Users,
  Image,
  Settings,
  LogOut,
  Printer,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Upload,
  HelpCircle,
  Wrench,
  CheckSquare,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { signOutAction } from "@/lib/actions/auth";
import { canAccessModule, type Module } from "@/lib/auth/permissions";
import type { AdminRole } from "@/lib/types/domain";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  module: Module;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Vue d'ensemble", href: "/admin",              icon: LayoutDashboard, exact: true, module: "dashboard" },
  { label: "Produits",       href: "/admin/produits",     icon: Package,                      module: "produits" },
  { label: "Catégories",     href: "/admin/categories",   icon: FolderOpen,                   module: "categories" },
  { label: "Devis",          href: "/admin/devis",        icon: FileText,                     module: "devis" },
  { label: "Commandes",      href: "/admin/commandes",    icon: ShoppingCart,                 module: "commandes" },
  { label: "Clients",        href: "/admin/clients",      icon: Users,                        module: "clients" },
  { label: "Réalisations",   href: "/admin/realisations", icon: Image,                        module: "realisations" },
  { label: "Utilisateurs",   href: "/admin/utilisateurs", icon: UserCog,                      module: "utilisateurs" },
  { label: "Imports CSV",    href: "/admin/imports",      icon: Upload,                       module: "imports" },
  { label: "Paramètres",     href: "/admin/parametres",   icon: Settings,                     module: "parametres" },
  { label: "Tâches",         href: "/admin/taches",       icon: CheckSquare,                  module: "taches" },
  { label: "Aide",           href: "/admin/aide",         icon: HelpCircle,                   module: "aide" },
  { label: "Maintenance",    href: "/admin/maintenance",  icon: Wrench,                        module: "maintenance" },
];

interface AdminSidebarProps {
  role: AdminRole;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ role, isMobileOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Fermer la sidebar mobile lors d'un changement de route
  useEffect(() => {
    if (isMobileOpen && onClose) onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const visibleItems = NAV_ITEMS.filter((item) => canAccessModule(role, item.module));

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <aside
      className={cn(
        "h-full flex flex-col bg-brand-secondary text-white transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-5 h-[72px] border-b border-white/10",
        collapsed && "justify-center px-0"
      )}>
        <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center shrink-0">
          <Printer className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 overflow-hidden">
            <h1 className="text-sm font-black tracking-tight leading-none">GLOBAL TIC</h1>
            <p className="text-[10px] font-medium text-white/50 uppercase tracking-widest mt-0.5">PrintTech Admin</p>
          </div>
        )}
        {/* Bouton fermeture mobile */}
        {!collapsed && onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                active
                  ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                  : "text-white/60 hover:text-white hover:bg-white/8",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-transform duration-200",
                  !active && "group-hover:scale-110"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-white/70 hover:bg-white/5 transition-all w-full",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span>Réduire</span>
            </>
          )}
        </button>

        <form action={signOutAction}>
          <button
            type="submit"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all w-full",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? "Déconnexion" : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop : sidebar sticky normale */}
      <div className="hidden lg:block sticky top-0 h-screen z-40 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile : drawer avec backdrop */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
