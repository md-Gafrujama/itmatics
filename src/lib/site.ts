import { revalidatePath } from "next/cache";

const PRODUCTION_SITE_URL = "https://itmaticsnews.com";

function isLocalhostUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(url);
}

export function getSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");

  // NEXT_PUBLIC_* is inlined at build time. Never emit localhost in prod.
  if (process.env.VERCEL_ENV === "production") {
    if (raw && !isLocalhostUrl(raw)) return raw;
    return PRODUCTION_SITE_URL;
  }

  if (raw) return raw;

  // Preview deployments on Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  if (process.env.NODE_ENV === "production") return PRODUCTION_SITE_URL;
  return "http://localhost:3000";
}

/** Bust cached sitemap after publish / unpublish / delete. */
export function revalidateSitemap() {
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
}
