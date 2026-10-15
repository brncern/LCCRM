import { NextResponse, type NextRequest } from "next/server";
import { syncAll } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Vercel Cron her gün çağırır; Authorization: Bearer <CRON_SECRET> ister. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const results = await syncAll();
  const ok = results.every((r) => r.ok);
  return NextResponse.json({ ok, results }, { status: ok ? 200 : 500 });
}
