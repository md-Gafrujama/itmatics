import "server-only";
import type { IngestResult } from "@/lib/site-analytics/prepare";

/** Reuse one service-role client per isolate — no TLS handshake per beacon. */
let adminSingleton: Awaited<
  ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>
> | null = null;

async function db() {
  if (!adminSingleton) {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    adminSingleton = createAdminClient();
  }
  return adminSingleton;
}

/** DB write — only loaded after the 204 response is scheduled. */
export async function persistSiteAnalyticsRow(
  prepared: Extract<IngestResult, { ok: true }>,
): Promise<void> {
  const {
    _geo_country,
    _pseudo_ip,
    _consent_status,
    _analytics,
    _marketing,
    ...row
  } = prepared.row as Record<string, unknown> & {
    _geo_country?: string | null;
    _pseudo_ip?: string | null;
    _consent_status?: string | null;
    _analytics?: boolean;
    _marketing?: boolean;
  };

  const client = await db();
  const insertRow = {
    kind: row.kind as "page_view" | "consent" | "custom",
    session_id: String(row.session_id),
    path: (row.path as string | null) ?? null,
    referrer: (row.referrer as string | null) ?? null,
    user_agent: (row.user_agent as string | null) ?? null,
    consent_snapshot: (row.consent_snapshot as Record<string, unknown>) || {},
    marketing_meta: (row.marketing_meta as Record<string, unknown>) || {},
    custom_meta: (row.custom_meta as Record<string, unknown>) || {},
  };

  const { error } = await client.from("site_analytics_events").insert(insertRow);
  if (error) {
    console.warn("[site-analytics] insert failed:", error.message);
    return;
  }

  if (!prepared.dualWriteConsent) return;

  const snap = insertRow.consent_snapshot;
  const analytics = !!_analytics;
  const marketing = !!_marketing;
  const choice =
    snap.choice === "accept_all" ||
    snap.choice === "reject_all" ||
    snap.choice === "custom"
      ? snap.choice
      : analytics && marketing
        ? "accept_all"
        : !analytics && !marketing
          ? "reject_all"
          : "custom";

  const { error: e } = await client.from("consent_events").insert({
    choice,
    necessary: true,
    analytics,
    marketing,
    consent_version: 1,
    session_id: insertRow.session_id,
    path: insertRow.path,
    pseudonymized_ip: _pseudo_ip || null,
    consent_status: _consent_status || null,
    country: _geo_country || null,
  });
  if (e) console.warn("[consent_events] dual-write failed:", e.message);
}
