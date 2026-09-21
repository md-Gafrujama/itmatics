import sitemap from "@/app/sitemap";

export const revalidate = 60;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Fresh GSC URL — never submitted before. Submit only this in Search Console. */
export async function GET() {
  const entries = await sitemap();
  const body = entries
    .map((e) => {
      const lastmod =
        e.lastModified instanceof Date
          ? e.lastModified.toISOString()
          : e.lastModified
            ? new Date(e.lastModified).toISOString()
            : undefined;
      const parts = [`<url><loc>${escapeXml(e.url)}</loc>`];
      if (lastmod) parts.push(`<lastmod>${escapeXml(lastmod)}</lastmod>`);
      if (e.changeFrequency) {
        parts.push(`<changefreq>${e.changeFrequency}</changefreq>`);
      }
      if (typeof e.priority === "number") {
        parts.push(`<priority>${e.priority}</priority>`);
      }
      parts.push(`</url>`);
      return parts.join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>\n`;

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
