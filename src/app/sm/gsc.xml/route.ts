import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Fresh GSC URL — same bytes as /sitemap.xml, no poisoned GSC history.
 * Submit ONLY: sm/gsc.xml
 */
export async function GET() {
  const xml = await readFile(join(process.cwd(), "public", "sm", "gsc.xml"), "utf8");

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
