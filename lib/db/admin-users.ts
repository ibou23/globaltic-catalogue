import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { ok, err, type Result } from "@/lib/utils/result";
import { mapAdminProfile } from "./mappers";
import type { AdminProfile, AdminRole } from "@/lib/types/domain";
import type { UpdateAdminUserInput } from "@/lib/validators/admin-user";

// Retourne TOUS les profils (actifs + inactifs) pour la gestion
export async function getAllAdminProfiles(): Promise<Result<AdminProfile[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return err(error.message);
  return ok((data as Record<string, unknown>[]).map(mapAdminProfile));
}

export async function getAdminProfileById(
  id: string
): Promise<Result<AdminProfile | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message);
  return ok(data ? mapAdminProfile(data as Record<string, unknown>) : null);
}

// Compte combien de patrons actifs existent (protection dernier patron)
export async function countActivePatrons(): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("admin_profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "patron")
    .eq("is_active", true);

  return count ?? 0;
}

// Crée un compte Auth + profil admin via service_role
export async function createAdminUser(input: {
  fullName: string;
  email: string;
  password: string;
  role: AdminRole;
  isActive: boolean;
}): Promise<Result<AdminProfile>> {
  const adminClient = createAdminClient();

  // 1. Créer le compte Supabase Auth
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });

  if (authError || !authData.user) {
    return err(authError?.message ?? "Erreur lors de la création du compte Auth");
  }

  const userId = authData.user.id;

  // 2. Insérer le profil admin
  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .insert({
      user_id: userId,
      email: input.email,
      full_name: input.fullName,
      role: input.role,
      is_active: input.isActive,
    })
    .select("*")
    .single();

  if (profileError) {
    // Rollback Auth si l'insertion du profil échoue
    await adminClient.auth.admin.deleteUser(userId);
    return err(profileError.message);
  }

  return ok(mapAdminProfile(profile as Record<string, unknown>));
}

export async function updateAdminProfile(
  id: string,
  input: UpdateAdminUserInput
): Promise<Result<AdminProfile>> {
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (input.full_name !== undefined) updates.full_name = input.full_name;
  if (input.role !== undefined) updates.role = input.role;
  if (input.is_active !== undefined) updates.is_active = input.is_active;

  const { data, error } = await supabase
    .from("admin_profiles")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return err(error.message);
  return ok(mapAdminProfile(data as Record<string, unknown>));
}
