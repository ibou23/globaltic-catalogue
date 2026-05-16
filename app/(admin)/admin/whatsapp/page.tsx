import { getCurrentAdmin } from "@/lib/db/admin";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { getInboundMessages } from "@/lib/db/whatsapp-messages";
import { WhatsAppInboxClient } from "@/components/admin/WhatsAppInboxClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;
  if (!admin) return <AccessDenied message="Accès non autorisé." />;
  if (!(await checkModuleAccess(admin.role, "whatsapp"))) {
    return <AccessDenied message="Vous n'avez pas accès à la messagerie WhatsApp." />;
  }

  const messagesResult = await getInboundMessages(100);
  const messages = messagesResult.data ?? [];

  return <WhatsAppInboxClient messages={messages} />;
}
