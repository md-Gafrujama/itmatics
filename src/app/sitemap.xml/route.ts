import { getSiteUrl } from "@/lib/site";
import {
  buildSitemapEntries,
  renderSitemapIndexXml,
  sitemapResponseHeaders,
} from "@/lib/sitemap-xml";

/** Rebuild every 5 minutes; publish paths also call revalidateSitemap(). */
export const revalidate = 300;

/**
 * Sitemap index → /sitemap/sitemap.xml
 * Keeps the classic /sitemap.xml URL working for GSC resubmits.
 */
export async function GET() {
  const site = getSiteUrl().replace(/\/+$/, "");
  const entries = await buildSitemapEntries();
  const lastmod = entries[0]?.lastmod ?? new Date().toISOString();
  const xml = renderSitemapIndexXml(`${site}/sitemap/sitemap.xml`, lastmod);
  return new Response(xml, {
    status: 200,
    headers: sitemapResponseHeaders(),
  });
}
