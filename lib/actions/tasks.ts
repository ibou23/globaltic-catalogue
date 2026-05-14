"use server";

import { taskSchema, updateTaskStatusSchema } from "@/lib/validators/task";
import {
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "@/lib/db/tasks";
import { ok, err, type Result } from "@/lib/utils/result";
import { getCurrentAdmin } from "@/lib/db/admin";
import { getAdminProfiles } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { createAdminNotifications } from "@/lib/db/notifications";
import type { Task } from "@/lib/types/domain";

export async function createTaskAction(formData: unknown): Promise<Result<Task>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "task:create");
  if (denied) return err(denied);
  if (!admin.data) return err("Accès non autorisé");

  const parsed = taskSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await createTask(parsed.data, admin.data.userId);
  if (result.error) return result;

  // Notification si la tâche est assignée à quelqu'un d'autre
  const task = result.data!;
  if (task.assignedTo && task.assignedTo !== admin.data.userId) {
    const profilesResult = await getAdminProfiles();
    if (profilesResult.data) {
      const assignee = profilesResult.data.find((p) => p.userId === task.assignedTo);
      if (assignee) {
        const profiles = profilesResult.data.map((p) => ({
          id: p.id,
          userId: p.userId,
          role: p.role,
          isActive: p.isActive,
        }));
        await createAdminNotifications({
          eventKey: "tache_assignee",
          title: `Nouvelle tâche assignée : ${task.title}`,
          body: `${admin.data.fullName} vous a assigné une tâche${task.dueDate ? ` (échéance : ${task.dueDate})` : ""}.`,
          entityType: "task",
          entityId: task.id,
          link: "/admin/taches",
          adminProfiles: profiles.filter((p) => p.userId === task.assignedTo),
        });
      }
    }
  }

  return result;
}

export async function updateTaskAction(
  id: string,
  formData: unknown
): Promise<Result<Task>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "task:edit");
  if (denied) return err(denied);

  const parsed = taskSchema.partial().safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  return updateTask(id, parsed.data);
}

export async function updateTaskStatusAction(formData: unknown): Promise<Result<Task>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "task:edit");
  if (denied) return err(denied);

  const parsed = updateTaskStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  return updateTaskStatus(parsed.data.id, parsed.data.status);
}

export async function deleteTaskAction(id: string): Promise<Result<null>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "task:delete");
  if (denied) return err(denied);

  return deleteTask(id);
}
