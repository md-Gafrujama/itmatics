import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/** Standard robots.txt — single canonical sitemap for Search Console */
export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  const host = new URL(site).host;

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
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin", "/api/", "/unsubscribe"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin", "/api/", "/unsubscribe"],
      },
    ],
    sitemap: [
      `${site}/sitemap.xml`,
      `${site}/sitemap.txt`,
      `${site}/sitemap_index.xml`,
    ],
    host,
  };
}
