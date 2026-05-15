import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const RATE_LIMIT_MSG = "Trop de tentatives. Réessayez dans quelques minutes.";

// Redis instance — lazy-initialized only when env vars are present
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

function makeLimiter(
  prefix: string,
  tokens: number,
  windowSeconds: number
): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;
  return new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(tokens, `${windowSeconds}s`),
    prefix: `rl:${prefix}`,
    analytics: false,
  });
}

// Limiteurs — instanciés à la demande, null si Redis non configuré

let _loginLimiter:        Ratelimit | null | undefined;
let _pdfLimiter:          Ratelimit | null | undefined;
let _searchLimiter:       Ratelimit | null | undefined;
let _importLimiter:       Ratelimit | null | undefined;
let _maintenanceLimiter:  Ratelimit | null | undefined;
let _prospectFormLimiter: Ratelimit | null | undefined;

function loginLimiter()       { return (_loginLimiter       ??= makeLimiter("login",       10,   600)); }
function pdfLimiter()         { return (_pdfLimiter         ??= makeLimiter("pdf",         30,   600)); }
function searchLimiter()      { return (_searchLimiter      ??= makeLimiter("search",      70,    60)); }
function importLimiter()      { return (_importLimiter      ??= makeLimiter("import",      30,  3600)); }
function maintenanceLimiter() { return (_maintenanceLimiter ??= makeLimiter("maintenance", 30,  3600)); }
function prospectFormLimiter(){ return (_prospectFormLimiter??= makeLimiter("prospect",     5,   600)); }

// ── Check helpers ─────────────────────────────────────────────────────────────

/**
 * Fail-safe: returns error string when blocked OR when Redis is down.
 * Used for: login, maintenance/delete.
 */
export async function checkRateLimitSafe(
  type: "login" | "maintenance" | "prospect_form",
  identifier: string
): Promise<string | null> {
  const limiter =
    type === "login"         ? loginLimiter() :
    type === "prospect_form" ? prospectFormLimiter() :
                               maintenanceLimiter();
  if (!limiter) return RATE_LIMIT_MSG; // Redis non configuré → bloquer par défaut
  try {
    const result = await limiter.limit(identifier);
    return result.success ? null : RATE_LIMIT_MSG;
  } catch {
    return RATE_LIMIT_MSG; // Redis down → bloquer
  }
}

/**
 * Fail-open: returns error string only when explicitly blocked.
 * Returns null (allow) when Redis is down or not configured.
 * Used for: PDF, search, import.
 */
export async function checkRateLimitOpen(
  type: "pdf" | "search" | "import",
  identifier: string
): Promise<string | null> {
  const limiter =
    type === "pdf"    ? pdfLimiter()    :
    type === "search" ? searchLimiter() :
                        importLimiter();
  if (!limiter) return null; // Redis non configuré → laisser passer
  try {
    const result = await limiter.limit(identifier);
    return result.success ? null : RATE_LIMIT_MSG;
  } catch {
    return null; // Redis down → laisser passer
  }
}
