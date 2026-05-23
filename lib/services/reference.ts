import { createClient } from "@/lib/supabase/server";

type ReferencePrefix = "DEV" | "CMD" | "FAC" | "PRO";

export async function generateReference(
  prefix: ReferencePrefix
): Promise<string> {
  const supabase = await createClient();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const monthDay = `${month}${day}`;

  const table =
    prefix === "DEV"
      ? "quotes"
      : prefix === "CMD"
        ? "orders"
        : prefix === "PRO"
          ? "prospects"
          : "invoices";

  const dayPrefix = `${prefix}-${year}-${monthDay}-`;

  const { data } = await supabase
    .from(table)
    .select("reference")
    .like("reference", `${dayPrefix}%`)
    .order("created_at", { ascending: false })
    .limit(50);

  let maxNum = 0;
  if (data) {
    for (const row of data) {
      const suffix = (row.reference as string).slice(dayPrefix.length);
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }

  return `${dayPrefix}${maxNum + 1}`;
}
