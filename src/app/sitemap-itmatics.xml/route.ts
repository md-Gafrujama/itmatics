import { generateSitemapXml } from "@/lib/sitemap-generator";

export const revalidate = 60;

export async function GET() {
  const xml = await generateSitemapXml();

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
