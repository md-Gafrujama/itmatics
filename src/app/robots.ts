import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/** Same pattern as healthmatics.net robots.ts */
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
    // Only one sitemap — same as healthmatics (GSC property = www)
    sitemap: `${site}/sitemap.xml`,
    host,
  };
}
