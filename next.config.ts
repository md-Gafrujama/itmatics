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
      // Do NOT force Content-Type / X-Robots-Tag on sitemap — Next MetadataRoute
      // already sets application/xml; overrides have caused GSC fetch issues.
      {
        source: "/robots.txt",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;
