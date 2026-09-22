import { buildSitemapXml } from "@/lib/sitemap";

/** ISR so the CDN can cache a full body (with Content-Length) for GSC. */
export const revalidate = 3600;
export const dynamic = "force-static";

function xmlHeaders(byteLength: number): HeadersInit {
  return {
    "Content-Type": "application/xml; charset=utf-8",
    "Content-Length": String(byteLength),
    // Edge cache: GSC should hit CDN, not a chunked serverless stream.
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    "X-Content-Type-Options": "nosniff",
  };
}

async function sitemapXml(): Promise<{ text: string; byteLength: number }> {
  const text = await buildSitemapXml();
  return { text, byteLength: new TextEncoder().encode(text).byteLength };
}

export async function GET() {
  const { text, byteLength } = await sitemapXml();
  return new Response(text, {
    status: 200,
    headers: xmlHeaders(byteLength),
  });
}

/** GSC often probes with HEAD before GET — must advertise Content-Length. */
export async function HEAD() {
  const { byteLength } = await sitemapXml();
  return new Response(null, {
    status: 200,
    headers: xmlHeaders(byteLength),
  });
}
