import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapOrderFile } from "./mappers";
import type { OrderFile, FileType, FileStatus } from "@/lib/types/domain";

const BUCKET = "order-files";
const SIGNED_URL_TTL = 60 * 60; // 1 heure

export async function getOrderFiles(
  orderId: string
): Promise<Result<OrderFile[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_files")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapOrderFile));
}

export async function uploadOrderFile(
  orderId: string,
  orderReference: string,
  file: File,
  fileType: FileType,
  uploadedBy: string
): Promise<Result<OrderFile>> {
  const supabase = await createClient();

  const ext = file.name.split(".").pop() ?? "bin";
  const uniqueName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `orders/${orderReference}/${uniqueName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return err(uploadError.message);

  const { data, error: insertError } = await supabase
    .from("order_files")
    .insert({
      order_id: orderId,
      file_type: fileType,
      file_url: storagePath,
      file_name: file.name,
      uploaded_by: uploadedBy,
      status: "en_attente" as FileStatus,
    })
    .select()
    .single();

  if (insertError) {
    // Nettoyer le fichier uploadé si l'insertion échoue
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return err(insertError.message);
  }

  return ok(mapOrderFile(data as Record<string, unknown>));
}

export async function getSignedUrl(
  storagePath: string
): Promise<Result<string>> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);

  if (error) return err(error.message);
  return ok(data.signedUrl);
}

export async function updateOrderFileStatus(
  id: string,
  status: FileStatus
): Promise<Result<OrderFile>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_files")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(mapOrderFile(data as Record<string, unknown>));
}

export async function deleteOrderFile(id: string): Promise<Result<true>> {
  const supabase = await createClient();

  // Récupérer le chemin avant suppression
  const { data: row, error: fetchError } = await supabase
    .from("order_files")
    .select("file_url")
    .eq("id", id)
    .single();

  if (fetchError) return err(fetchError.message);

  const storagePath = (row as Record<string, unknown>).file_url as string;

  const { error: deleteError } = await supabase
    .from("order_files")
    .delete()
    .eq("id", id);

  if (deleteError) return err(deleteError.message);

  // Supprimer le fichier dans Storage (non bloquant si le fichier est déjà absent)
  await supabase.storage.from(BUCKET).remove([storagePath]);

  return ok(true);
}
