"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { checkRateLimitSafe } from "@/lib/security/rate-limit";
import { err, ok, type Result } from "@/lib/utils/result";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInAction(
  email: string,
  password: string
): Promise<Result<null>> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  const blocked = await checkRateLimitSafe("login", `ip:${ip}`);
  if (blocked) return err(blocked);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return err("Identifiants invalides. Veuillez réessayer.");
  return ok(null);
}
