import { getSitemapEntries } from "@/lib/sitemap-generator";

export const revalidate = 60;

export async function GET() {
  const entries = await getSitemapEntries();
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
