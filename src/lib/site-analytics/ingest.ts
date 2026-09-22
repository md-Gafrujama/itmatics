import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  pseudonymizeIp,
  resolveClientIp,
  resolveGeo,
} from "@/lib/site-analytics/ip";
import {
  pruneRateLimitBuckets,
  rateLimit,
} from "@/lib/site-analytics/rate-limit";
import {
  deriveConsentStatus,
  isValidKind,
  isValidSessionId,
  sanitizeCustomMeta,
  sanitizeMarketingMeta,
  sanitizePath,
  sanitizeReferrer,
  sanitizeString,
} from "@/lib/site-analytics/sanitize";

export type IngestResult =
  | { ok: true; row: Record<string, unknown>; dualWriteConsent?: boolean }
  | { ok: false; status: number; detail: string };

/** Reuse one service-role client per process — avoids TLS/handshake per beacon. */
let adminSingleton: ReturnType<typeof createAdminClient> | null = null;
function db() {
  if (!adminSingleton) adminSingleton = createAdminClient();
  return adminSingleton;
}

/**
 * Fast path: validate + build row only. Caller can respond immediately
 * then persist via persistSiteAnalyticsRow().
 */
export function prepareSiteAnalyticsEvent(
  request: Request,
  body: Record<string, unknown>,
): IngestResult {
  pruneRateLimitBuckets();

  const ip = resolveClientIp(request);
  const rateKey = `analytics:${ip || "unknown"}`;
  const limited = rateLimit(rateKey, { limit: 90, windowMs: 60_000 });
  if (!limited.ok) {
    return { ok: false, status: 429, detail: "Rate limit exceeded" };
  }

  const kind = body.kind;
  if (!isValidKind(kind)) {
    return { ok: false, status: 400, detail: "Invalid kind" };
  }

  const sessionId = body.sessionId;
  if (!isValidSessionId(sessionId)) {
    return { ok: false, status: 400, detail: "Invalid sessionId" };
  }

  const consentIn =
    body.consent && typeof body.consent === "object"
      ? (body.consent as Record<string, unknown>)
      : {};
  const analytics = !!consentIn.analytics;
  const marketing = !!consentIn.marketing;

  if ((kind === "page_view" || kind === "custom") && !analytics) {
    return { ok: false, status: 403, detail: "Analytics consent required" };
  }

  const path = sanitizePath(body.path);
  const referrer = sanitizeReferrer(body.referrer);
  const userAgent = sanitizeString(request.headers.get("user-agent") || "", 400);
  const geo = resolveGeo(request);
  const pseudoIp = pseudonymizeIp(ip);
  const consentStatus = deriveConsentStatus(analytics, marketing);

  const marketingMeta = sanitizeMarketingMeta(body.marketing);
  if (geo.country) marketingMeta.country = geo.country;
  if (geo.city) marketingMeta.city = geo.city;
  if (geo.region) marketingMeta.region = geo.region;
  if (pseudoIp) marketingMeta.pseudonymizedIp = pseudoIp;

  const consentSnapshot = {
    necessary: true,
    analytics,
    marketing,
    consentId:
      sanitizeString(marketingMeta.consentId || body.consentId, 80) ||
      undefined,
    consentStatus,
    consentedDomain: sanitizeString(
      body.consentedDomain ||
        request.headers.get("host") ||
        "www.itmaticsnews.com",
      120,
    ),
    pseudonymizedIp: pseudoIp,
    choice: sanitizeString(marketingMeta.choice, 40) || undefined,
  };

  const customMeta =
    kind === "custom"
      ? sanitizeCustomMeta(body.customMeta || body.custom)
      : {};

  const row = {
    kind,
    session_id: sessionId,
    path,
    referrer: referrer || null,
    user_agent: userAgent || null,
    consent_snapshot: consentSnapshot,
    marketing_meta: marketingMeta,
    custom_meta: customMeta,
    _geo_country: geo.country || null,
    _pseudo_ip: pseudoIp,
    _consent_status: consentStatus,
    _analytics: analytics,
    _marketing: marketing,
  };

  return {
    ok: true,
    row,
    dualWriteConsent: kind === "consent",
  };
}

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

  const client = db();
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

/** Sync helper (tests / fallback). Prefer prepare + after(persist). */
export async function ingestSiteAnalyticsEvent(
  request: Request,
  body: Record<string, unknown>,
): Promise<Exclude<IngestResult, { ok: true }> | { ok: true }> {
  const prepared = prepareSiteAnalyticsEvent(request, body);
  if (!prepared.ok) return prepared;
  await persistSiteAnalyticsRow(prepared);
  return { ok: true };
}
