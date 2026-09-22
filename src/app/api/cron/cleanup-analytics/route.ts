import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GDPR retention: delete analytics/consent rows older than ~180 days
 * (Postgres equivalent of Mongo TTL expireAfterSeconds ≈ 15552000).
 *
 * GET|POST /api/cron/cleanup-analytics
 * Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  return runCleanup(request);
}

export async function POST(request: Request) {
  return runCleanup(request);
}

async function runCleanup(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }

  const db = createAdminClient();
  const cutoff = new Date(Date.now() - 180 * 86400000).toISOString();

  const { error: aErr, count: analyticsDeleted } = await db
    .from("site_analytics_events")
    .delete({ count: "exact" })
    .lt("created_at", cutoff);

  if (aErr) {
    return NextResponse.json(
      { ok: false, error: aErr.message },
      { status: 503 },
    );
  }

  const { error: cErr, count: consentDeleted } = await db
    .from("consent_events")
    .delete({ count: "exact" })
    .lt("created_at", cutoff);

  if (cErr) {
    return NextResponse.json(
      { ok: false, error: cErr.message },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    cutoff,
    analyticsDeleted: analyticsDeleted ?? 0,
    consentDeleted: consentDeleted ?? 0,
  });
}
