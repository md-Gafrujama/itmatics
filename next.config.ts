import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GSC sometimes requests /sitemap.xml/ — don't 308 that away.
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24h
  },
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/(favicon.ico|favicon-32x32.png|icon-192.png|brand/mark.svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:path(sitemap.xml|sc-sitemap.xml|sitemap.txt|sitemap/sitemap.xml)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=300, must-revalidate",
          },
          { key: "Content-Disposition", value: "inline" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/:path(sitemap.xml|sc-sitemap.xml|sitemap/sitemap.xml)",
        headers: [
          { key: "Content-Type", value: "text/xml; charset=utf-8" },
        ],
      },
      {
        source: "/sitemap.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;
