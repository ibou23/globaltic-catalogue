import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";
import type { QualityCheck, QCChecklist, QCStatus } from "@/lib/types/domain";

function mapQC(row: Record<string, unknown>): QualityCheck {
  return {
    id:          row.id as string,
    orderId:     row.order_id as string,
    status:      row.status as QCStatus,
    checklist:   (row.checklist as QCChecklist) ?? {},
    notes:       (row.notes as string) ?? null,
    validatedBy: (row.validated_by as string) ?? null,
    validatedAt: (row.validated_at as string) ?? null,
    createdAt:   row.created_at as string,
    updatedAt:   row.updated_at as string,
  };
}

export async function getQualityCheckByOrderId(orderId: string): Promise<Result<QualityCheck | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quality_checks")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) return err(error.message);
  return ok(data ? mapQC(data as Record<string, unknown>) : null);
}

export async function getQualityChecksByOrderIds(
  orderIds: string[]
): Promise<Result<Map<string, QualityCheck>>> {
  if (orderIds.length === 0) return ok(new Map());
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quality_checks")
    .select("*")
    .in("order_id", orderIds);
  if (error) return err(error.message);
  const map = new Map<string, QualityCheck>();
  for (const row of (data ?? []) as Record<string, unknown>[]) {
    const qc = mapQC(row);
    map.set(qc.orderId, qc);
  }
  return ok(map);
}

export async function upsertQualityCheck(
  orderId: string,
  input: {
    status: QCStatus;
    checklist: QCChecklist;
    notes: string | null;
    validatedBy: string | null;
    validatedAt: string | null;
  }
): Promise<Result<QualityCheck>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quality_checks")
    .upsert(
      {
        order_id:     orderId,
        status:       input.status,
        checklist:    input.checklist,
        notes:        input.notes ?? null,
        validated_by: input.validatedBy ?? null,
        validated_at: input.validatedAt ?? null,
      },
      { onConflict: "order_id" }
    )
    .select()
    .single();
  if (error) return err(error.message);
  return ok(mapQC(data as Record<string, unknown>));
}
