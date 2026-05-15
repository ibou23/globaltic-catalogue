import { getActiveAdminProfiles } from "@/lib/db/admin-users";
import { createAdminNotifications } from "@/lib/db/notifications";
import type { Prospect } from "@/lib/types/domain";

export async function notifyNewProspect(prospect: Prospect): Promise<void> {
  const profiles = await getActiveAdminProfiles();

  await createAdminNotifications({
    eventKey: "prospect_recu",
    title: "Nouveau prospect",
    body: `${prospect.fullName} — ${prospect.requestedProducts.join(", ") || "Demande générale"}`,
    entityType: "prospect",
    entityId: prospect.id,
    link: `/admin/prospects/${prospect.id}`,
    adminProfiles: profiles,
  });
}
