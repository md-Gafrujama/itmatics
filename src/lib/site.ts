import { revalidatePath } from "next/cache";

/** Canonical production URL — sitemap/robots never trust env for this. */
export const PRODUCTION_SITE_URL = "https://www.itmaticsnews.com";

function isLocalhostUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * Public site origin for canonicals, sitemap, robots, JSON-LD.
 * Production always returns www.itmaticsnews.com (env cannot override).
 */
export function getSiteUrl(): string {
  // Hard lock: live site must never emit localhost or preview URLs in sitemap.
  if (
    process.env.VERCEL_ENV === "production" ||
    (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV)
  ) {
    return PRODUCTION_SITE_URL;
  }

  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  if (raw && !isLocalhostUrl(raw)) return raw;

  // Preview deployments on Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}

/** Bust cached sitemap after publish / unpublish / delete. */
export function revalidateSitemap() {
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
}
