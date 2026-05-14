import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Client service_role — ne jamais importer depuis du code "use client"
// Uniquement utilisable dans des Server Actions ou des Route Handlers côté serveur
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY manquant — vérifier les variables d'environnement serveur");
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
