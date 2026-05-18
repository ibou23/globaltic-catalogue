import { readFile } from "fs/promises";
import path from "path";
import { getCurrentAdmin } from "@/lib/db/admin";
import { redirect } from "next/navigation";
import { Presentation } from "lucide-react";
import { PresentationClient } from "@/components/admin/PresentationClient";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { AccessDenied } from "@/components/admin/AccessDenied";

export const dynamic = "force-dynamic";

export default async function AdminPresentationPage() {
  const adminResult = await getCurrentAdmin();
  if (!adminResult.data) {
    redirect("/login");
  }

  if (!(await checkModuleAccess(adminResult.data.role, "presentation"))) {
    return <AccessDenied message="Vous n'avez pas accès à cette page." />;
  }

  const filePath = path.join(process.cwd(), "docs", "PRESENTATION_FONCTIONNALITES_GLOBAL_TIC_PRINTTECH.md");
  const content = await readFile(filePath, "utf-8");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <Presentation className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Présentation de la plateforme</h1>
            <p className="text-sm text-slate-500">GLOBAL TIC PrintTech — Fonctionnalités complètes</p>
          </div>
        </div>
      </div>

      <PresentationClient content={content} />
    </div>
  );
}
