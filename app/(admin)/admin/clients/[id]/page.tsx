import { getCurrentAdmin, getAdminProfiles } from "@/lib/db/admin";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { canPerform } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ClientDetailClient } from "@/components/admin/ClientDetailClient";
import { getCustomerById } from "@/lib/db/customers";
import { getQuotesEnrichedByCustomer } from "@/lib/db/quotes";
import { getOrdersEnrichedByCustomer } from "@/lib/db/orders";
import { getTasksByCustomer } from "@/lib/db/tasks";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !(await checkModuleAccess(admin.role, "clients"))) {
    return <AccessDenied />;
  }

  const { id } = await params;

  const [customerResult, quotesResult, ordersResult, tasksResult, profilesResult] = await Promise.all([
    getCustomerById(id),
    getQuotesEnrichedByCustomer(id),
    getOrdersEnrichedByCustomer(id),
    getTasksByCustomer(id),
    getAdminProfiles(),
  ]);

  if (!customerResult.data) {
    notFound();
  }

  const customer     = customerResult.data;
  const quotes       = quotesResult.data ?? [];
  const orders       = ordersResult.data ?? [];
  const tasks        = tasksResult.data ?? [];
  const adminProfiles = profilesResult.data ?? [];

  const canEdit        = canPerform(admin.role, "client:edit");
  const canDelete      = canPerform(admin.role, "client:delete");
  const canSeeFinances = canPerform(admin.role, "commande:edit_payment") || canPerform(admin.role, "receipt:generate");
  const canCreateTask  = canPerform(admin.role, "task:create");

  return (
    <ClientDetailClient
      customer={customer}
      quotes={quotes}
      orders={orders}
      tasks={tasks}
      adminProfiles={adminProfiles}
      role={admin.role}
      canEdit={canEdit}
      canDelete={canDelete}
      canSeeFinances={canSeeFinances}
      canCreateTask={canCreateTask}
    />
  );
}
