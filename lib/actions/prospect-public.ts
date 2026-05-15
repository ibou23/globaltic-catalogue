"use server";

import { prospectPublicSchema } from "@/lib/validators/prospect";
import { createProspect } from "@/lib/db/prospects";
import { uploadProspectFile } from "@/lib/db/prospect-files";
import { generateReference } from "@/lib/services/reference";
import { checkRateLimitSafe } from "@/lib/security/rate-limit";
import { headers } from "next/headers";
import { err, type Result } from "@/lib/utils/result";
import type { Prospect, ProspectFileType } from "@/lib/types/domain";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function submitProspectFormAction(
  formData: unknown,
  files?: FormData
): Promise<Result<Prospect>> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  const blocked = await checkRateLimitSafe("prospect_form", `ip:${ip}`);
  if (blocked) return err(blocked);

  const parsed = prospectPublicSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const reference = await generateReference("PRO");
  const result = await createProspect(parsed.data, reference);

  if (!result.data) return result;

  if (files) {
    const prospect = result.data;
    const fileEntries = files.getAll("files");

    for (const entry of fileEntries) {
      if (!(entry instanceof File) || entry.size === 0) continue;
      if (!ALLOWED_TYPES.includes(entry.type)) continue;
      if (entry.size > MAX_FILE_SIZE) continue;

      const fileType: ProspectFileType = entry.type.startsWith("image/") ? "logo" : "document";
      await uploadProspectFile(
        prospect.id,
        prospect.reference,
        entry,
        fileType,
        null
      );
    }
  }

  return result;
}
