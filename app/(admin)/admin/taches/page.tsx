import { getCurrentAdmin } from "@/lib/db/admin";
import { getAdminProfiles } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { TachesClient } from "@/components/admin/TachesClient";
import { getAllTasks, getOverdueTasks, getTasksDueToday } from "@/lib/db/tasks";
import { getCustomers } from "@/lib/db/customers";

export const dynamic = "force-dynamic";

export default async function AdminTachesPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "taches")) {
    return <AccessDenied />;
  }

  const [tasksResult, overdueResult, todayResult, profilesResult, customersResult] =
    await Promise.all([
      getAllTasks(),
      getOverdueTasks(),
      getTasksDueToday(),
      getAdminProfiles(),
      getCustomers(),
    ]);

  return (
    <TachesClient
      tasks={tasksResult.data ?? []}
      adminProfiles={profilesResult.data ?? []}
      customers={customersResult.data ?? []}
      role={admin.role}
      overdueCount={(overdueResult.data ?? []).length}
      todayCount={(todayResult.data ?? []).length}
    />
  );
}
