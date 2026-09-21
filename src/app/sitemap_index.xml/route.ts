import { getSiteUrl } from "@/lib/site";

export const revalidate = 60;

/**
 * Fresh GSC entry URL. When /sitemap.xml is stuck on "Couldn't fetch"
 * even though Live Test is green, submit this path instead.
 */
export async function GET() {
  const site = getSiteUrl().replace(/\/+$/, "");
  const lastmod = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap>
<loc>${site}/sitemap.xml</loc>
<lastmod>${lastmod}</lastmod>
</sitemap>
</sitemapindex>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Disposition": 'inline; filename="sitemap_index.xml"',
      "Access-Control-Allow-Origin": "*",
    },
  });
}
