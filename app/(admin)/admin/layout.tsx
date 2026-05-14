import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/db/admin";
import { getUnreadCount } from "@/lib/db/notifications";
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
  const unreadCount = await getUnreadCount(admin.userId);

  return (
    <AdminShell admin={admin} unreadCount={unreadCount}>
      {children}
    </AdminShell>
  );
}
