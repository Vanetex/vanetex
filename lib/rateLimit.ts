/**
 * Lightweight in-memory rate limiter for API routes.
 * One store per route — pass a unique storeKey per route.
 */

type Entry = { count: number; resetAt: number };

const stores = new Map<string, Map<string, Entry>>();

function getStore(storeKey: string): Map<string, Entry> {
  if (!stores.has(storeKey)) stores.set(storeKey, new Map());
  return stores.get(storeKey)!;
}

export function checkRateLimit(
  storeKey: string,
  clientId: string,
  max: number,
  windowMs: number,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const store = getStore(storeKey);

  // Evict expired entries
  for (const [k, v] of store.entries()) {
    if (v.resetAt <= now) store.delete(k);
  }

  const entry = store.get(clientId);
  if (!entry) {
    store.set(clientId, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientIdFromRequest(req: Request): string {
  const headers = new Headers((req as unknown as { headers: Headers }).headers ?? {});
  // x-real-ip is set by Vercel's edge and cannot be spoofed by the client
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  // Fall back to the rightmost entry in x-forwarded-for (appended by the
  // trusted proxy), not the leftmost (which the client can spoof)
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    return ips[ips.length - 1] ?? "local";
  }
  return "local";
}
