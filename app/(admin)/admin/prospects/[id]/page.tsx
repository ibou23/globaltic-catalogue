import { getProspectById } from "@/lib/db/prospects";
import { getProspectFiles } from "@/lib/db/prospect-files";
import { getCurrentAdmin } from "@/lib/db/admin";
import { checkModuleAccess } from "@/lib/auth/check-access";
import { canPerform } from "@/lib/auth/permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ProspectDetailClient } from "@/components/admin/ProspectDetailClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const adminResult = await getCurrentAdmin();
  const admin = adminResult.data;

  if (!admin || !(await checkModuleAccess(admin.role, "prospects"))) {
    return <AccessDenied />;
  }

  const { id } = await params;
  const [prospectResult, filesResult] = await Promise.all([
    getProspectById(id),
    getProspectFiles(id),
  ]);

  if (!prospectResult.data) {
    notFound();
  }

  return (
    <ProspectDetailClient
      prospect={prospectResult.data}
      files={filesResult.data ?? []}
      canEdit={canPerform(admin.role, "prospect:edit")}
      canDelete={canPerform(admin.role, "prospect:delete")}
    />
  );
}
