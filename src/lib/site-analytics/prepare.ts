import "server-only";
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

/** Avoid pruning the Map on every beacon — keeps hot path tiny. */
let prepareCount = 0;

/**
 * Validate + build row only. No DB / Supabase imports on this path.
 */
export function prepareSiteAnalyticsEvent(
  request: Request,
  body: Record<string, unknown>,
): IngestResult {
  if (++prepareCount % 64 === 0) pruneRateLimitBuckets();

  const ip = resolveClientIp(request);
  const limited = rateLimit(`analytics:${ip || "unknown"}`, {
    limit: 90,
    windowMs: 60_000,
  });
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

  return {
    ok: true,
    dualWriteConsent: kind === "consent",
    row: {
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
    },
  };
}
