"use server";

import { getCurrentAdmin } from "@/lib/db/admin";
import { requireRole } from "@/lib/auth/permissions";
import { updateInvoiceStatus } from "@/lib/db/invoices";
import { err, type Result } from "@/lib/utils/result";
import type { Invoice, InvoiceStatus } from "@/lib/types/domain";

export async function updateInvoiceStatusAction(
  id: string,
  status: InvoiceStatus
): Promise<Result<Invoice>> {
  const admin = await getCurrentAdmin();
  const denied = requireRole(admin.data?.role, "facture:generate");
  if (denied) return err(denied);
  if (!id) return err("Identifiant manquant");

  const validStatuses: InvoiceStatus[] = [
    "brouillon", "emise", "payee", "partiellement_payee", "annulee",
  ];
  if (!validStatuses.includes(status)) return err("Statut invalide");

  return updateInvoiceStatus(id, status);
}
