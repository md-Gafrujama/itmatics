import { after } from "next/server";
import { NextResponse } from "next/server";
import {
  persistSiteAnalyticsRow,
  prepareSiteAnalyticsEvent,
} from "@/lib/site-analytics/ingest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Respond in ~few ms after validation; DB write continues via after().
 * Client uses sendBeacon — does not wait for insert RTT.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400 });
  }

  const prepared = prepareSiteAnalyticsEvent(request, body);
  if (!prepared.ok) {
    return NextResponse.json(
      { detail: prepared.detail },
      { status: prepared.status },
    );
  }

  after(() => persistSiteAnalyticsRow(prepared));

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
