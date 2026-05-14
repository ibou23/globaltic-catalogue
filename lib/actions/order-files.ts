"use server";

import {
  getOrderFiles,
  uploadOrderFile,
  deleteOrderFile,
  updateOrderFileStatus,
  getSignedUrl,
} from "@/lib/db/order-files";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { getOrderById } from "@/lib/db/orders";
import { logOrderEvent } from "@/lib/db/activity-log";
import { getActiveAdminProfiles } from "@/lib/db/admin-users";
import { createAdminNotifications } from "@/lib/db/notifications";
import { err, type Result } from "@/lib/utils/result";
import type { OrderFile, FileType, FileStatus } from "@/lib/types/domain";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

export async function getOrderFilesAction(
  orderId: string
): Promise<Result<OrderFile[]>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  return getOrderFiles(orderId);
}

export async function uploadOrderFileAction(
  orderId: string,
  fileType: FileType,
  formData: FormData
): Promise<Result<OrderFile>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  const deniedUpload = requireRole(admin.data.role, "commande:upload_file");
  if (deniedUpload) return err(deniedUpload);

  const orderResult = await getOrderById(orderId);
  if (!orderResult.data) return err("Commande introuvable");

  const file = formData.get("file");
  if (!(file instanceof File)) return err("Fichier manquant");
  if (!ALLOWED_TYPES.includes(file.type)) return err("Type de fichier non autorisé (PDF, PNG, JPG, WEBP uniquement)");
  if (file.size > MAX_SIZE) return err("Fichier trop volumineux (max 20 Mo)");
  if (file.size === 0) return err("Le fichier est vide");

  const result = await uploadOrderFile(
    orderId,
    orderResult.data.reference,
    file,
    fileType,
    admin.data.userId
  );

  if (result.data) {
    await logOrderEvent(admin.data.userId, orderId, "fichier_ajoute", {
      nom: file.name,
      type: fileType,
    });

    const profiles = await getActiveAdminProfiles();
    await createAdminNotifications({
      eventKey: "fichier_ajoute",
      title: "Fichier ajouté",
      body: `Fichier "${file.name}" ajouté à la commande ${orderResult.data.reference}`,
      entityType: "order",
      entityId: orderId,
      link: "/admin/commandes",
      adminProfiles: profiles,
    });
  }

  return result;
}

export async function deleteOrderFileAction(
  fileId: string,
  orderId?: string
): Promise<Result<true>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  const deniedDelete = requireRole(admin.data.role, "commande:delete_file");
  if (deniedDelete) return err(deniedDelete);

  const result = await deleteOrderFile(fileId);

  if (result.data && orderId) {
    await logOrderEvent(admin.data.userId, orderId, "fichier_supprime", { file_id: fileId });
  }

  return result;
}

export async function updateOrderFileStatusAction(
  fileId: string,
  status: FileStatus
): Promise<Result<OrderFile>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  return updateOrderFileStatus(fileId, status);
}

export async function getSignedUrlAction(
  storagePath: string
): Promise<Result<string>> {
  const admin = await getCurrentAdmin();
  if (!admin.data) return err("Accès non autorisé");
  return getSignedUrl(storagePath);
}
