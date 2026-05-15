import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { getInboundMessages } from "@/lib/db/whatsapp-messages";
import { WhatsAppInboxClient } from "@/components/admin/WhatsAppInboxClient";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;
  if (!admin || !canAccessModule(admin.role, "whatsapp")) redirect("/admin");

  const messagesResult = await getInboundMessages(100);
  const messages = messagesResult.data ?? [];

  return <WhatsAppInboxClient messages={messages} />;
}
