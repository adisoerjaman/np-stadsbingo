/**
 * Lichtgewicht in-memory rate limiter (fixed window) voor de login-endpoints.
 *
 * Let op: in-memory werkt per server-instance. Bij meerdere instances/serverless
 * is een gedeelde store nodig (bv. Upstash Redis of Vercel KV). Voor één instance
 * en als basisbescherming tegen brute force volstaat dit.
 */
interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();

  // Verlopen entries opruimen zodat de map niet ongelimiteerd groeit.
  if (store.size > 5_000) {
    for (const [k, v] of store) {
      if (v.resetAt < now) store.delete(k);
    }
  }

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);

  if (entry.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  return {
    allowed: true,
    remaining: limit - entry.count,
    retryAfterSeconds,
  };
}

/** Best-effort client-IP uit de proxy-headers. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Alleen voor tests: reset de interne store. */
export function __resetRateLimitStore() {
  store.clear();
}
