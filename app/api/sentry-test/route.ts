import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  throw new Error("Sentry test error — safe to delete this route");
  return NextResponse.json({ ok: true });
}
