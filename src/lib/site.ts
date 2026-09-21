import { revalidatePath } from "next/cache";

/**
 * Canonical production domain.
 * Vercel redirects apex → www, so sitemap/robots/OG must use www.
 * (Same pattern as healthmatics.net — this is what fixed GSC there.)
 */
export const PRODUCTION_SITE_URL = "https://www.itmaticsnews.com";

function isLocalhostUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/** Normalize to https origin without trailing slash. Prefer www.itmaticsnews.com. */
export function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return PRODUCTION_SITE_URL;

  let withProtocol = trimmed;
  if (!/^https?:\/\//i.test(withProtocol)) {
    withProtocol = `https://${withProtocol}`;
  }

  try {
    const u = new URL(withProtocol);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "itmaticsnews.com") {
      return PRODUCTION_SITE_URL;
    }
    u.hash = "";
    u.search = "";
    return `${u.protocol}//${u.host}`.replace(/\/+$/, "");
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

  if (process.env.VERCEL_ENV === "production") {
    if (raw && !isLocalhostUrl(raw)) return normalizeSiteUrl(raw);
    return PRODUCTION_SITE_URL;
  }

  if (raw && !isLocalhostUrl(raw) && process.env.NODE_ENV === "production") {
    return normalizeSiteUrl(raw);
  }

  if (raw) return raw.replace(/\/+$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  if (process.env.NODE_ENV === "production") return PRODUCTION_SITE_URL;
  return "http://localhost:3000";
}

/** Bust cached sitemap after publish / unpublish / delete. */
export function revalidateSitemap() {
  revalidatePath("/sitemap.xml");
  revalidatePath("/sitemaps/sitemap.xml");
  revalidatePath("/robots.txt");
}
