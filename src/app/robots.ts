import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

/** One Sitemap line only — same as a clean healthmatics-style setup */
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
    // Fresh path for Search Console — avoid poisoned /sitemap.xml status.
    // /sitemap.xml still works for browsers/footer.
    sitemap: `${site}/sitemaps/sitemap.xml`,
    host,
  };
}
