import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/db/admin";
import { getUnreadCount } from "@/lib/db/notifications";
import { getMenuConfig, getRoleModuleAccess } from "@/lib/db/menu-config";
import { AdminShell } from "@/components/admin/AdminShell";
import type { AdminProfile } from "@/lib/types/domain";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const result = await getCurrentAdmin();

  if (!result.data) {
    redirect("/login");
  }

  const admin: AdminProfile = result.data;
  const [unreadCount, menuResult, accessResult] = await Promise.all([
    getUnreadCount(admin.userId),
    getMenuConfig(),
    getRoleModuleAccess(),
  ]);

  const menuOrder = (menuResult.data ?? []).map((item) => ({
    moduleKey: item.moduleKey,
    sortOrder: item.sortOrder,
  }));

  const roleOverrides = (accessResult.data ?? []).map((entry) => ({
    role: entry.role,
    moduleKey: entry.moduleKey,
    canAccess: entry.canAccess,
  }));

  return (
    <AdminShell admin={admin} unreadCount={unreadCount} menuOrder={menuOrder} roleOverrides={roleOverrides}>
      {children}
    </AdminShell>
  );
}
