import { getOrdersEnriched } from "@/lib/db/orders";
import { CommandesClient } from "@/components/admin/CommandesClient";

export default async function AdminCommandesPage() {
  const result = await getOrdersEnriched();
  const orders = result.data ?? [];

  return <CommandesClient orders={orders} />;
}
