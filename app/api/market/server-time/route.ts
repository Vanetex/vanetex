import { NextResponse } from "next/server";

export const runtime = "nodejs";

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
