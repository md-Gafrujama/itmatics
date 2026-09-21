import {
  buildSitemapEntries,
  renderUrlsetXml,
  sitemapResponseHeaders,
} from "@/lib/sitemap-xml";

/** Rebuild every 5 minutes; publish paths also call revalidateSitemap(). */
export const revalidate = 300;

/**
 * Canonical sitemap payload. Public URLs rewrite here.
 * Kept outside /api/ so robots.txt Disallow: /api/ never blocks Google.
 */
export async function GET() {
  try {
    const entries = await buildSitemapEntries();
    const xml = renderUrlsetXml(entries);
    return new Response(xml, {
      status: 200,
      headers: sitemapResponseHeaders(),
    });
  } catch (err) {
    console.error("[sitemap] failed, serving minimal fallback", err);
    const site = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.itmaticsnews.com"
    ).replace(/\/+$/, "");
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}/</loc><changefreq>hourly</changefreq><priority>1</priority></url></urlset>\n`;
    return new Response(fallback, {
      status: 200,
      headers: sitemapResponseHeaders(),
    });
  }
}
