import { ReactNode } from "react";
import { Header } from "@/components/layout/header"; // On pourra créer un header spécifique admin plus tard
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  // Redirection gérée par le middleware normalement, mais sécurité supplémentaire ici
  if (!user) {
    // Si on n'est pas sur /admin/login, on redirige
    // Mais dans App Router, le layout s'applique à tous les enfants y compris /login
    // Sauf si on utilise des groupes de routes.
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* On n'affiche pas le header public sur l'admin */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>
    </div>
  );
}
