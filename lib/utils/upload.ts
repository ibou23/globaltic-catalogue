import { createClient } from "@/lib/supabase/client";

export async function uploadImage(
  file: File,
  folder: "products" | "categories" | "realisations",
  slug: string
): Promise<{ url?: string; error?: string }> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  
  // Clean slug and generate unique filename
  const cleanSlug = slug || "new-item";
  const fileName = `${cleanSlug}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("catalog-images")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data } = supabase.storage
    .from("catalog-images")
    .getPublicUrl(filePath);

  return { url: data.publicUrl };
}
