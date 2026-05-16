import { getCurrentAdmin } from "@/lib/db/admin";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { canPerform } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { getCustomerById } from "@/lib/db/customers";
import { notFound } from "next/navigation";
import { ClientEditForm } from "@/components/admin/ClientEditForm";

export const dynamic = "force-dynamic";

export default async function AdminClientEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !(await checkModuleAccess(admin.role, "clients")) || !canPerform(admin.role, "client:edit")) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const customerResult = await getCustomerById(id);

  if (!customerResult.data) {
    notFound();
  }

  return <ClientEditForm customer={customerResult.data} />;
}
