// Shared between app/api/cron/refresh-screener and app/api/stock/screener.
// Next.js's route-file export whitelist rejects extra named exports from
// a route.ts (confirmed live: a production build failed on
// "SCREENER_HASH_KEY is not a valid Route export field" when these lived
// in the cron route directly) — this is why they're split out here
// instead.

export const SCREENER_HASH_KEY = "screener:fundamentals:v1";
// Outlasts several rotation cycles (see ROTATION_SIZE in the cron route)
// so a symbol refreshed early in a cycle is still on file by the time
// the next cycle reaches it again — fundamentals don't need to be
// fresher than this.
export const SCREENER_FIELD_TTL_S = 10 * 24 * 60 * 60;

export type ScreenerFields = {
  marketCap: number | null;
  peTTM: number | null;
  forwardPE: number | null;
  revenueGrowthYoy: number | null;
  beta: number | null;
  dividendYield: number | null;
  priceReturn52W: number | null;
};
