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
