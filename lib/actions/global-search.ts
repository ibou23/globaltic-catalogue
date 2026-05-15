"use server";

import { getCurrentAdmin } from "@/lib/db/admin";
import { globalSearch, type SearchResult } from "@/lib/db/global-search";
import { checkRateLimitOpen } from "@/lib/security/rate-limit";
import { err, ok, type Result } from "@/lib/utils/result";

export async function globalSearchAction(query: string): Promise<Result<SearchResult[]>> {
  const adminResult = await getCurrentAdmin();
  if (!adminResult.data) return err("Non authentifié");

  const rateLimitError = await checkRateLimitOpen("search", adminResult.data.userId);
  if (rateLimitError) return err(rateLimitError);

  const results = await globalSearch(query, adminResult.data.role);
  return ok(results);
}
