import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapAdminProfile } from "./mappers";
import type { AdminProfile } from "@/lib/types/domain";

export async function getAdminProfile(
  userId: string
): Promise<Result<AdminProfile | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapAdminProfile(data) : null);
}

export async function getAdminProfiles(): Promise<Result<AdminProfile[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  if (error) return err(error.message);
  return ok(data.map(mapAdminProfile));
}

export async function getCurrentAdmin(): Promise<Result<AdminProfile | null>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return ok(null);
  return getAdminProfile(user.id);
}
