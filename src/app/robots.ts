import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/** Served at /robots.txt — single Sitemap line */
export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/unsubscribe", "/unsubscribe/"],
    },
    sitemap: `${site}/sitemap.xml`,
    host: new URL(site).host,
  };
}
