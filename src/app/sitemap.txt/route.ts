import { getSiteUrl } from "@/lib/site";

/**
 * Plain-text sitemap (Google-supported).
 * Submit /sitemap.txt in GSC if XML path stays stuck.
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#text
 */
export async function GET() {
  const { default: sitemap } = await import("@/app/sitemap");
  const entries = await sitemap();
  const body = `${entries.map((e) => e.url).join("\n")}\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export const revalidate = 60;
