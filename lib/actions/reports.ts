"use server";

import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { getReportData } from "@/lib/db/reports";
import { err, type Result } from "@/lib/utils/result";
import type { ReportData } from "@/lib/types/reports";

export async function getReportDataAction(
  from: string,
  to: string
): Promise<Result<ReportData>> {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;
  if (!admin) return err("Non authentifié");
  if (!canAccessModule(admin.role, "rapports")) return err("Accès non autorisé");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return err("Dates invalides");
  }
  if (from > to) return err("La date de début doit être avant la date de fin");

  return getReportData({ from, to });
}
