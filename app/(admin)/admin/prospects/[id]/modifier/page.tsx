import { getProspectById } from "@/lib/db/prospects";
import { getCurrentAdmin, getAdminProfiles } from "@/lib/db/admin";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { canPerform } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ProspectEditForm } from "@/components/admin/ProspectEditForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProspectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !(await checkModuleAccess(admin.role, "prospects")) || !canPerform(admin.role, "prospect:edit")) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const [prospectResult, profilesResult] = await Promise.all([
    getProspectById(id),
    getAdminProfiles(),
  ]);

  if (!prospectResult.data) {
    notFound();
  }

  return (
    <ProspectEditForm
      prospect={prospectResult.data}
      adminProfiles={profilesResult.data ?? []}
    />
  );
}
