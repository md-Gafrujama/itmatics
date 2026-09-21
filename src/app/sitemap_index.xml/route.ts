import { getSiteUrl } from "@/lib/site";

/** Points at canonical /sitemap.xml */
export async function GET() {
  const site = getSiteUrl();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap>
<loc>${site}/sitemap.xml</loc>
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
