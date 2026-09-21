import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getNavTopics, IT_TOPIC_SLUGS } from "@/lib/topic-config";
import { createPublicClient } from "@/lib/supabase/public";
import { isMissingSchemaError } from "@/lib/db-errors";

/** Rebuild every 5 minutes; publish paths also call revalidateSitemap(). */
export const revalidate = 300;

function lastMod(iso: string | null | undefined): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function absUrl(site: string, path: string): string {
  const base = site.replace(/\/+$/, "");
  if (path === "/" || path === "") return base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

type SitemapArticle = {
  slug: string;
  updated_at: string | null;
  published_at: string | null;
  topic: { slug: string } | { slug: string }[] | null;
};

function topicSlugOf(row: SitemapArticle): string | null {
  const t = row.topic;
  if (!t) return null;
  if (Array.isArray(t)) return t[0]?.slug ?? null;
  return t.slug ?? null;
}

async function loadPublished(): Promise<SitemapArticle[]> {
  try {
    const nowIso = new Date().toISOString();
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("articles")
      .select("slug, updated_at, published_at, topic:topics(slug)")
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false });

    if (isMissingSchemaError(error)) return [];
    return ((data ?? []) as SitemapArticle[]).filter((a) => {
      const slug = topicSlugOf(a);
      return Boolean(slug && IT_TOPIC_SLUGS.has(slug) && a.slug);
    });
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl().replace(/\/+$/, "");
  const published = await loadPublished();
  const topicSlugs = getNavTopics().map((t) => t.slug);
  const newest = published[0]?.updated_at ?? published[0]?.published_at;
  const siteLastMod = lastMod(newest) ?? new Date();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absUrl(site, "/"),
      lastModified: siteLastMod,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: absUrl(site, "/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absUrl(site, "/advertise"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absUrl(site, "/editorial-standards"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absUrl(site, "/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absUrl(site, "/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absUrl(site, "/newsletters"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absUrl(site, "/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absUrl(site, "/resources"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const topicPages: MetadataRoute.Sitemap = topicSlugs.map((slug) => ({
    url: absUrl(site, `/topic/${slug}`),
    lastModified: siteLastMod,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = published.map((a) => {
    const publishedAt = lastMod(a.published_at);
    const ageMs = publishedAt ? Date.now() - publishedAt.getTime() : Infinity;
    const fresh = ageMs < 1000 * 60 * 60 * 24 * 3;
    return {
      url: absUrl(site, `/article/${a.slug}`),
      lastModified: lastMod(a.updated_at) ?? publishedAt ?? siteLastMod,
      changeFrequency: (fresh ? "daily" : "weekly") as "daily" | "weekly",
      priority: fresh ? 0.9 : 0.7,
    };
  });

  return [...staticPages, ...topicPages, ...articlePages];
}
