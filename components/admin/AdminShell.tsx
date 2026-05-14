"use client";

import { useState } from "react";
import type { AdminProfile } from "@/lib/types/domain";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

interface AdminShellProps {
  admin: AdminProfile;
  unreadCount: number;
  children: React.ReactNode;
}

export function AdminShell({ admin, unreadCount, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar
        role={admin.role}
        isMobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <AdminTopbar
          admin={admin}
          title="Dashboard"
          unreadCount={unreadCount}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
