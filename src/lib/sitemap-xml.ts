import "server-only";
import { getSiteUrl } from "@/lib/site";
import { getNavTopics, HR_TOPIC_SLUGS } from "@/lib/topic-config";
import { createPublicClient } from "@/lib/supabase/public";
import { isMissingSchemaError } from "@/lib/db-errors";

export type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
  images?: string[];
};

function absUrl(site: string, path: string): string {
  const base = site.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function isoDate(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Sitemap image URLs must be XML-safe (& → &amp;). */
function sitemapImageUrl(url: string | null | undefined): string | undefined {
  if (!url || !/^https?:\/\//i.test(url)) return undefined;
  const clean = url.split("#")[0].split("?")[0];
  return clean || undefined;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type SitemapArticle = {
  slug: string;
  updated_at: string | null;
  published_at: string | null;
  cover_image_url: string | null;
  topic: { slug: string } | { slug: string }[] | null;
};

function topicSlugOf(row: SitemapArticle): string | null {
  const t = row.topic;
  if (!t) return null;
  if (Array.isArray(t)) return t[0]?.slug ?? null;
  return t.slug ?? null;
}

async function loadPublishedArticles(): Promise<SitemapArticle[]> {
  try {
    const nowIso = new Date().toISOString();
    const supabase = createPublicClient();
    const { data: articles, error } = await supabase
      .from("articles")
      .select(
        "slug, updated_at, published_at, cover_image_url, topic:topics(slug)",
      )
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false });

    if (isMissingSchemaError(error)) return [];
    return ((articles ?? []) as SitemapArticle[]).filter((a) => {
      const slug = topicSlugOf(a);
      return Boolean(slug && HR_TOPIC_SLUGS.has(slug) && a.slug);
    });
  } catch {
    // Missing env / Supabase outage must not 500 the sitemap for Google.
    return [];
  }
}

/** Build all public URL entries for the sitemap. */
export async function buildSitemapEntries(): Promise<SitemapEntry[]> {
  const site = getSiteUrl().replace(/\/+$/, "");
  const published = await loadPublishedArticles();
  const topicSlugs = getNavTopics().map((t) => t.slug);
  const newest = published[0]?.updated_at ?? published[0]?.published_at;
  const siteLastMod = isoDate(newest) ?? new Date().toISOString();
  const now = new Date().toISOString();

  const staticPages: SitemapEntry[] = [
    {
      loc: absUrl(site, "/"),
      lastmod: siteLastMod,
      changefreq: "hourly",
      priority: 1,
    },
    {
      loc: absUrl(site, "/about"),
      lastmod: now,
      changefreq: "monthly",
      priority: 0.5,
    },
    {
      loc: absUrl(site, "/advertise"),
      lastmod: now,
      changefreq: "monthly",
      priority: 0.5,
    },
    {
      loc: absUrl(site, "/editorial-standards"),
      lastmod: now,
      changefreq: "monthly",
      priority: 0.4,
    },
    {
      loc: absUrl(site, "/privacy"),
      lastmod: now,
      changefreq: "yearly",
      priority: 0.3,
    },
    {
      loc: absUrl(site, "/terms"),
      lastmod: now,
      changefreq: "yearly",
      priority: 0.3,
    },
    {
      loc: absUrl(site, "/newsletters"),
      lastmod: now,
      changefreq: "monthly",
      priority: 0.6,
    },
    {
      loc: absUrl(site, "/contact"),
      lastmod: now,
      changefreq: "monthly",
      priority: 0.5,
    },
    {
      loc: absUrl(site, "/resources"),
      lastmod: now,
      changefreq: "weekly",
      priority: 0.6,
    },
  ];

  const topicPages: SitemapEntry[] = topicSlugs.map((slug) => ({
    loc: absUrl(site, `/topic/${slug}`),
    lastmod: siteLastMod,
    changefreq: "daily",
    priority: 0.8,
  }));

  const articlePages: SitemapEntry[] = published.map((a) => {
    const publishedAt = isoDate(a.published_at);
    const ageMs = publishedAt
      ? Date.now() - new Date(publishedAt).getTime()
      : Infinity;
    const fresh = ageMs < 1000 * 60 * 60 * 24 * 3;
    const img = sitemapImageUrl(a.cover_image_url);

    return {
      loc: absUrl(site, `/article/${a.slug}`),
      lastmod: isoDate(a.updated_at) ?? publishedAt ?? siteLastMod,
      changefreq: fresh ? "daily" : "weekly",
      priority: fresh ? 0.9 : 0.7,
      ...(img ? { images: [img] } : {}),
    };
  });

  return [...staticPages, ...topicPages, ...articlePages];
}

/** Serialize a urlset sitemap (with optional image:image nodes). */
export function renderUrlsetXml(entries: SitemapEntry[]): string {
  const hasImages = entries.some((e) => (e.images?.length ?? 0) > 0);
  const imageNs = hasImages
    ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : "";

  const body = entries
    .map((entry) => {
      const parts = [
        "<url>",
        `<loc>${escapeXml(entry.loc)}</loc>`,
      ];
      if (entry.lastmod) {
        parts.push(`<lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      }
      if (entry.changefreq) {
        parts.push(
          `<changefreq>${escapeXml(entry.changefreq)}</changefreq>`,
        );
      }
      if (typeof entry.priority === "number") {
        parts.push(`<priority>${entry.priority}</priority>`);
      }
      for (const image of entry.images ?? []) {
        parts.push(
          "<image:image>",
          `<image:loc>${escapeXml(image)}</image:loc>`,
          "</image:image>",
        );
      }
      parts.push("</url>");
      return parts.join("");
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNs}>${body}</urlset>\n`;
}

/** Sitemap index pointing at the real urlset. */
export function renderSitemapIndexXml(childLoc: string, lastmod?: string): string {
  const lm = lastmod
    ? `<lastmod>${escapeXml(lastmod)}</lastmod>`
    : `<lastmod>${escapeXml(new Date().toISOString())}</lastmod>`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${escapeXml(childLoc)}</loc>${lm}</sitemap></sitemapindex>\n`;
}

export function sitemapResponseHeaders(): HeadersInit {
  return {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    // Avoid Content-Disposition — some Google crawlers mishandle it on sitemaps.
  };
}
