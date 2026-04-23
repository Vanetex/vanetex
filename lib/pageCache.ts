// Module-level cache. In Next.js App Router, client-side navigation does NOT
// reload JS modules — they stay in memory. This means data cached here on the
// first visit is available instantly on every return visit within the TTL,
// with zero network calls, in both dev and production.

type Entry = { data: unknown; at: number };
const store = new Map<string, Entry>();

export function readCache<T>(key: string, ttlMs = 60_000): T | undefined {
  const e = store.get(key);
  return e && Date.now() - e.at < ttlMs ? (e.data as T) : undefined;
}

export function writeCache(key: string, data: unknown): void {
  store.set(key, { data, at: Date.now() });
}

// Call after a mutation to force a fresh fetch on next visit
export function bustCache(...keys: string[]): void {
  keys.forEach((k) => store.delete(k));
}
