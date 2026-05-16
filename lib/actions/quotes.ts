"use server";

import { createQuoteSchema, updateQuoteStatusSchema, updateQuoteSchema } from "@/lib/validators/quote";
import { createQuote, updateQuote, updateQuoteStatus } from "@/lib/db/quotes";
import { generateReference } from "@/lib/services/reference";
import { getCurrentAdmin } from "@/lib/db/admin";
import { requireActionDynamic } from "@/lib/auth/check-access";
import { getActiveAdminProfiles } from "@/lib/db/admin-users";
import { createAdminNotifications } from "@/lib/db/notifications";
import { err, type Result } from "@/lib/utils/result";
import type { Quote } from "@/lib/types/domain";

export async function createQuoteAction(
  formData: unknown
): Promise<Result<Quote>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "devis:create");
  if (denied) return err(denied);

  const parsed = createQuoteSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const reference = await generateReference("DEV");
  const result = await createQuote(parsed.data, reference);

  if (result.data) {
    const profiles = await getActiveAdminProfiles();
    await createAdminNotifications({
      eventKey: "devis_cree",
      title: "Nouveau devis créé",
      body: `Devis ${result.data.reference} créé par ${admin.data?.fullName ?? "un admin"}`,
      entityType: "quote",
      entityId: result.data.id,
      link: "/admin/devis",
      adminProfiles: profiles,
    });
  }

  return result;
}

export async function updateQuoteAction(
  id: string,
  formData: unknown
): Promise<Result<Quote>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "devis:edit");
  if (denied) return err(denied);

  if (!id) return err("Identifiant du devis manquant");
  const parsed = updateQuoteSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }
  return updateQuote(id, parsed.data);
}

export async function updateQuoteStatusAction(
  formData: unknown
): Promise<Result<Quote>> {
  const admin = await getCurrentAdmin();
  const denied = await requireActionDynamic(admin.data?.role, "devis:edit");
  if (denied) return err(denied);

  const parsed = updateQuoteStatusSchema.safeParse(formData);
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const result = await updateQuoteStatus(parsed.data.id, parsed.data.status);

  if (result.data && parsed.data.status === "accepte") {
    const profiles = await getActiveAdminProfiles();
    await createAdminNotifications({
      eventKey: "devis_accepte",
      title: "Devis accepté",
      body: `Le devis ${result.data.reference} a été accepté — à convertir en commande`,
      entityType: "quote",
      entityId: result.data.id,
      link: "/admin/devis",
      adminProfiles: profiles,
    });
  }

  return result;
}
