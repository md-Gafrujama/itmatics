import {
  buildSitemapEntries,
  renderUrlsetXml,
  sitemapResponseHeaders,
} from "@/lib/sitemap-xml";

/** Rebuild every 5 minutes; publish paths also call revalidateSitemap(). */
export const revalidate = 300;

/**
 * Primary sitemap for Google Search Console.
 * Submit: sitemap/sitemap.xml
 */
export async function GET() {
  const entries = await buildSitemapEntries();
  const xml = renderUrlsetXml(entries);
  return new Response(xml, {
    status: 200,
    headers: sitemapResponseHeaders(),
  });
}
