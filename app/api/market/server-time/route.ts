import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Without this, Next.js statically optimizes this handler at build time
// (nothing here reads cookies/headers/params, so it looks eligible) and
// freezes Date.now() as whatever it was during the last build — the
// Cache-Control header below doesn't prevent that, since the handler
// stops re-running per request before it ever gets a chance to matter.
// Confirmed live: a fresh curl straight to the deployed route kept
// returning the exact same ~19-hour-stale timestamp across multiple
// unrelated requests, which is what actually broke isMarketOpen() below
// (the client-side clock-offset correction inherited the staleness and
// pushed etParts() onto the wrong weekday). Same fix already used in
// app/api/ticker/route.ts for the same reason.
export const dynamic = "force-dynamic";

// Lets the client correct for its own system clock being wrong (common on
// phones/VMs with bad auto-time) before deciding whether the market is
// open — a skewed local clock was making isMarketOpen() return the wrong
// answer regardless of how correct its ET-timezone math was.
export async function GET() {
  return NextResponse.json(
    { now: Date.now() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
