import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/**
 * Served at /robots.txt
 * Keep private admin/API/unsubscribe out of the public crawl.
 */
export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl().replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/unsubscribe",
          "/unsubscribe/",
        ],
      },
      // Allow major AI crawlers on public editorial content; keep admin/API closed.
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    // Advertise the public URL (rewritten to /api/seo/sitemap internally).
    sitemap: [`${site}/sitemap.xml`, `${site}/sitemap/sitemap.xml`],
  };
}
