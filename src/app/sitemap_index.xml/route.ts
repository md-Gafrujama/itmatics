import { getSiteUrl } from "@/lib/site";

/**
 * Points at the fresh GSC path so any index fetch stays consistent with robots.txt.
 */
export async function GET() {
  const site = getSiteUrl();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap>
<loc>${site}/sitemap-itmatics.xml</loc>
</sitemap>
</sitemapindex>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Disposition": "inline",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
