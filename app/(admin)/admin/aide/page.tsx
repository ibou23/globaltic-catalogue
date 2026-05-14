import { readFile } from "fs/promises";
import path from "path";
import { getCurrentAdmin } from "@/lib/db/admin";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { AideClient } from "@/components/admin/AideClient";

export const dynamic = "force-dynamic";

export default async function AdminAidePage() {
  const adminResult = await getCurrentAdmin();
  if (!adminResult.data) {
    redirect("/login");
  }

  const filePath = path.join(process.cwd(), "docs", "GUIDE_ADMIN_GLOBAL_TIC.md");
  const content = await readFile(filePath, "utf-8");

  return (
    <div className="max-w-6xl mx-auto">
      {/* En-tête de page */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Guide d'utilisation</h1>
            <p className="text-sm text-slate-500">Documentation interne GLOBAL TIC — v1.0</p>
          </div>
        </div>
      </div>

      <AideClient content={content} />
    </div>
  );
}
