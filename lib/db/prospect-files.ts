import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapProspectFile } from "./mappers";
import type { ProspectFile, ProspectFileType } from "@/lib/types/domain";

const BUCKET = "prospect-files";
const SIGNED_URL_TTL = 60 * 60;

export async function getProspectFiles(
  prospectId: string
): Promise<Result<ProspectFile[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prospect_files")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapProspectFile));
}

export async function uploadProspectFile(
  prospectId: string,
  prospectReference: string,
  file: File,
  fileType: ProspectFileType,
  uploadedBy: string | null
): Promise<Result<ProspectFile>> {
  const supabase = createAdminClient();

  const ext = file.name.split(".").pop() ?? "bin";
  const uniqueName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `prospects/${prospectReference}/${uniqueName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return err(uploadError.message);

  const { data, error: insertError } = await supabase
    .from("prospect_files")
    .insert({
      prospect_id: prospectId,
      file_type: fileType,
      file_url: storagePath,
      file_name: file.name,
      file_size: file.size,
      uploaded_by: uploadedBy,
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return err(insertError.message);
  }

  return ok(mapProspectFile(data as Record<string, unknown>));
}

export async function deleteProspectFile(id: string): Promise<Result<true>> {
  const supabase = await createClient();

  const { data: row, error: fetchError } = await supabase
    .from("prospect_files")
    .select("file_url")
    .eq("id", id)
    .single();

  if (fetchError) return err(fetchError.message);

  const storagePath = (row as Record<string, unknown>).file_url as string;

  const { error: deleteError } = await supabase
    .from("prospect_files")
    .delete()
    .eq("id", id);

  if (deleteError) return err(deleteError.message);

  await supabase.storage.from(BUCKET).remove([storagePath]);
  return ok(true);
}

export async function getProspectFileSignedUrl(
  storagePath: string
): Promise<Result<string>> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL);

  if (error) return err(error.message);
  return ok(data.signedUrl);
}

export async function getProspectFileDownloadUrl(
  storagePath: string,
  fileName: string | null
): Promise<Result<string>> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL, { download: fileName ?? true });

  if (error) return err(error.message);
  return ok(data.signedUrl);
}
