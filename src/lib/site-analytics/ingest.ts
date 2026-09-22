import "server-only";

/**
 * Barrel for tests / legacy callers.
 * Hot route imports prepare + dynamic-imports persist separately.
 */
export {
  prepareSiteAnalyticsEvent,
  type IngestResult,
} from "@/lib/site-analytics/prepare";
export { persistSiteAnalyticsRow } from "@/lib/site-analytics/persist";

import { prepareSiteAnalyticsEvent } from "@/lib/site-analytics/prepare";
import { persistSiteAnalyticsRow } from "@/lib/site-analytics/persist";

export async function ingestSiteAnalyticsEvent(
  request: Request,
  body: Record<string, unknown>,
) {
  const prepared = prepareSiteAnalyticsEvent(request, body);
  if (!prepared.ok) return prepared;
  await persistSiteAnalyticsRow(prepared);
  return { ok: true as const };
}
