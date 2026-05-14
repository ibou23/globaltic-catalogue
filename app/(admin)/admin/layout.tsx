import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/db/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
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

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar role={admin.role} />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <AdminTopbar admin={admin} title="Dashboard" />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
