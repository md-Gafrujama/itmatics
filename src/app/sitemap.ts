import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getNavTopics, HR_TOPIC_SLUGS } from "@/lib/topic-config";
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
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`.replace(/\s+/g, "");
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const nowIso = new Date().toISOString();
  const supabase = createPublicClient();

  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("slug, updated_at, published_at, cover_image_url, topic:topics(slug)")
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", nowIso)
    .order("published_at", { ascending: false });

  const published = (
    isMissingSchemaError(articlesError) ? [] : ((articles ?? []) as SitemapArticle[])
  ).filter((a) => {
    const slug = topicSlugOf(a);
    return Boolean(slug && HR_TOPIC_SLUGS.has(slug));
  });

  // Public topic URLs = navbar desks only (ignore legacy DB topics).
  const topicSlugs = getNavTopics().map((t) => t.slug);

  const newest = published[0]?.updated_at ?? published[0]?.published_at;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absUrl(site, "/"),
      lastModified: lastMod(newest) ?? new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: absUrl(site, "/about"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absUrl(site, "/advertise"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absUrl(site, "/editorial-standards"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absUrl(site, "/privacy"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absUrl(site, "/terms"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absUrl(site, "/newsletters"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absUrl(site, "/contact"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absUrl(site, "/resources"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const topicPages: MetadataRoute.Sitemap = topicSlugs.map((slug) => ({
    url: absUrl(site, `/topic/${slug}`),
    lastModified: lastMod(newest) ?? new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const articlePages: MetadataRoute.Sitemap = published.map((a) => {
    const publishedAt = lastMod(a.published_at);
    const ageMs = publishedAt ? Date.now() - publishedAt.getTime() : Infinity;
    const fresh = ageMs < 1000 * 60 * 60 * 24 * 3;
    const images =
      a.cover_image_url && /^https?:\/\//i.test(a.cover_image_url)
        ? [a.cover_image_url]
        : undefined;

    return {
      url: absUrl(site, `/article/${a.slug}`),
      lastModified: lastMod(a.updated_at) ?? publishedAt,
      changeFrequency: fresh ? "daily" : "weekly",
      priority: fresh ? 0.9 : 0.7,
      ...(images ? { images } : {}),
    };
  });

  return [...staticPages, ...topicPages, ...articlePages];
}
