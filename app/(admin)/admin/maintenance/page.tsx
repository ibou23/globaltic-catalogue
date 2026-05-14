import { getCurrentAdmin } from "@/lib/db/admin";
import { canAccessModule } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { MaintenanceClient } from "@/components/admin/MaintenanceClient";
import { getQuotesEnriched } from "@/lib/db/quotes";
import { getOrdersEnriched } from "@/lib/db/orders";
import { getCustomers } from "@/lib/db/customers";
import { getMaintenanceStats } from "@/lib/db/activity-log";

export const dynamic = "force-dynamic";

export default async function AdminMaintenancePage() {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !canAccessModule(admin.role, "maintenance")) {
    return <AccessDenied message="Cette page est réservée au patron." />;
  }

  const [quotesResult, ordersResult, customersResult, statsResult] = await Promise.all([
    getQuotesEnriched(),
    getOrdersEnriched(),
    getCustomers(),
    getMaintenanceStats(),
  ]);

  const quotes = quotesResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const customers = customersResult.data ?? [];
  const statsData = statsResult.data ?? { readNotifications: 0, orphanQuotes: 0 };

  return (
    <MaintenanceClient
      stats={{
        readNotifications: statsData.readNotifications,
        totalQuotes: quotes.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
      }}
      quotes={quotes}
      orders={orders}
      customers={customers}
    />
  );
}
