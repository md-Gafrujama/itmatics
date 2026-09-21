import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
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
        // Match working healthmatics.net sitemap response shape
        source: "/:path(sitemap.xml|sitemap_index.xml)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Content-Type", value: "application/xml" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Disposition",
            value: 'inline; filename="sitemap.xml"',
          },
        ],
      },
      {
        source: "/sitemap_index.xml",
        headers: [
          {
            key: "Content-Disposition",
            value: 'inline; filename="sitemap_index.xml"',
          },
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
