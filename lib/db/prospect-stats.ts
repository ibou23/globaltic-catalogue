import { createClient } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/lib/utils/result";

export interface ProspectStats {
  totalProspects: number;
  newToday: number;
  toProcess: number;
  urgent: number;
  toFollowUp: number;
  converted: number;
}

export async function getProspectStats(): Promise<Result<ProspectStats>> {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    totalRes,
    newTodayRes,
    toProcessRes,
    urgentRes,
    toFollowUpRes,
    convertedRes,
  ] = await Promise.all([
    supabase.from("prospects").select("id", { count: "exact", head: true }),
    supabase.from("prospects").select("id", { count: "exact", head: true }).gte("created_at", todayISO),
    supabase.from("prospects").select("id", { count: "exact", head: true }).eq("status", "nouveau").is("contacted_at", null),
    supabase.from("prospects").select("id", { count: "exact", head: true }).eq("priority", "urgent"),
    supabase.from("prospects").select("id", { count: "exact", head: true })
      .in("status", ["nouveau", "en_negociation"])
      .not("contacted_at", "is", null)
      .lt("contacted_at", yesterday),
    supabase.from("prospects").select("id", { count: "exact", head: true }).not("converted_customer_id", "is", null),
  ]);

  const anyError = [totalRes, newTodayRes, toProcessRes, urgentRes, toFollowUpRes, convertedRes].find(r => r.error);
  if (anyError?.error) return err(anyError.error.message);

  return ok({
    totalProspects: totalRes.count ?? 0,
    newToday: newTodayRes.count ?? 0,
    toProcess: toProcessRes.count ?? 0,
    urgent: urgentRes.count ?? 0,
    toFollowUp: toFollowUpRes.count ?? 0,
    converted: convertedRes.count ?? 0,
  });
}
