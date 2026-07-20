import { kv } from "@vercel/kv";

// Falls back to an in-process Map when KV env vars aren't configured
// (local dev, or before the KV store is connected in Vercel).
const local = new Map<string, { value: unknown; expires: number }>();

export async function kvGet<T>(key: string): Promise<T | null> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      return await kv.get<T>(key);
    } catch {
      // KV unavailable — fall through to local
    }
  }
  const entry = local.get(key);
  if (entry && entry.expires > Date.now()) return entry.value as T;
  local.delete(key);
  return null;
}

export async function kvSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await kv.set(key, value, { ex: ttlSeconds });
      return;
    } catch {
      // KV unavailable — fall through to local
    }
  }
  local.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
}

// Hash-field variants: use these instead of kvGet/kvSet whenever
// multiple concurrent callers may update *different subsets* of the
// same logical map (e.g. different serverless instances each
// refreshing a different batch of symbols). A plain get-merge-set on a
// JSON blob loses data under concurrency — whichever write lands last
// wins and silently drops the other writer's fields. HSET only ever
// touches the fields it's given, so concurrent partial updates never
// clobber each other.
const localHash = new Map<string, Map<string, unknown>>();

export async function kvHashSetFields<T>(key: string, fields: Record<string, T>, ttlSeconds: number): Promise<void> {
  if (Object.keys(fields).length === 0) return;
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await kv.hset(key, fields);
      await kv.expire(key, ttlSeconds);
      return;
    } catch (err) {
      // Log rather than swallow silently — a real KV error here (e.g.
      // WRONGTYPE from reusing a key that used to hold a plain string)
      // previously fell through to the ephemeral local map without a
      // trace, which made a real bug look like a caching quirk.
      console.error(`[kvCache] hset failed for key "${key}":`, err);
    }
  }
  const h = localHash.get(key) ?? new Map<string, unknown>();
  for (const [f, v] of Object.entries(fields)) h.set(f, v);
  localHash.set(key, h);
}

export async function kvHashGetAll<T>(key: string): Promise<Record<string, T>> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const all = await kv.hgetall<Record<string, T>>(key);
      return all ?? {};
    } catch (err) {
      console.error(`[kvCache] hgetall failed for key "${key}":`, err);
    }
  }
  const h = localHash.get(key);
  return h ? (Object.fromEntries(h) as Record<string, T>) : {};
}
