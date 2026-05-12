import { createClient } from "@/lib/supabase/server";

type ReferencePrefix = "DEV" | "CMD" | "FAC";

export async function generateReference(
  prefix: ReferencePrefix
): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const table =
    prefix === "DEV"
      ? "quotes"
      : prefix === "CMD"
        ? "orders"
        : "orders";

  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01`)
    .lt("created_at", `${year + 1}-01-01`);

  const number = (count ?? 0) + 1;
  const padded = String(number).padStart(4, "0");

  return `${prefix}-${year}-${padded}`;
}
