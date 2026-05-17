import { getCurrentAdmin } from "@/lib/db/admin";
import { getAdminProfiles } from "@/lib/db/admin";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { TachesClient } from "@/components/admin/TachesClient";
import { getAllTasks, getOverdueTasks, getTasksDueToday } from "@/lib/db/tasks";
import { getCustomers } from "@/lib/db/customers";

export const dynamic = "force-dynamic";

export default async function AdminTachesPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !(await checkModuleAccess(admin.role, "taches"))) {
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

  const profiles = profilesResult.data ?? [];

  // Enrich tasks with admin profile data (assigned_to / created_by point to auth.users.id = AdminProfile.userId)
  const tasks = (tasksResult.data ?? []).map((task) => ({
    ...task,
    assignedAdmin: task.assignedTo
      ? profiles.find((p) => p.userId === task.assignedTo) ?? null
      : null,
    createdByAdmin: task.createdBy
      ? profiles.find((p) => p.userId === task.createdBy) ?? null
      : null,
  }));

  const overdueCount = (overdueResult.data ?? []).length;
  const todayCount   = (todayResult.data ?? []).length;

  return (
    <TachesClient
      tasks={tasks}
      adminProfiles={profiles}
      customers={customersResult.data ?? []}
      role={admin.role}
      overdueCount={overdueCount}
      todayCount={todayCount}
    />
  );
}
