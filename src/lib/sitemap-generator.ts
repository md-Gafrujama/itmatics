import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { getNavTopics, IT_TOPIC_SLUGS } from "@/lib/topic-config";
import { createPublicClient } from "@/lib/supabase/public";
import { isMissingSchemaError } from "@/lib/db-errors";

function lastMod(iso: string | null | undefined): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const nowIso = new Date().toISOString();

  let published: {
    slug: string;
    updated_at: string | null;
    published_at: string | null;
    topic: { slug: string } | { slug: string }[] | null;
  }[] = [];

  try {
    const supabase = createPublicClient();
    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("slug, updated_at, published_at, topic:topics(slug)")
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false });

    const publishedRaw = isMissingSchemaError(articlesError)
      ? []
      : (articles ?? []);
    published = publishedRaw.filter((a) => {
      const topic = Array.isArray(a.topic) ? a.topic[0] : a.topic;
      const slug =
        topic && typeof topic === "object" && "slug" in topic
          ? String((topic as { slug?: string }).slug ?? "")
          : "";
      return Boolean(slug && IT_TOPIC_SLUGS.has(slug) && a.slug);
    }) as typeof published;
  } catch {
    published = [];
  }

  const topicRows = getNavTopics().map((t) => ({ slug: t.slug }));
  const newest =
    published[0]?.updated_at ?? published[0]?.published_at ?? nowIso;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: site,
      lastModified: lastMod(newest) ?? new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${site}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${site}/advertise`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${site}/editorial-standards`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${site}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${site}/newsletters`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${site}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${site}/resources`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  const topicPages: MetadataRoute.Sitemap = topicRows.map((t) => {
    const topicArticles = published.filter((a) => {
      const topic = Array.isArray(a.topic) ? a.topic[0] : a.topic;
      return (
        topic &&
        typeof topic === "object" &&
        "slug" in topic &&
        (topic as { slug?: string }).slug === t.slug
      );
    });
    const topicNewest =
      topicArticles[0]?.updated_at ??
      topicArticles[0]?.published_at ??
      newest;

    return {
      url: `${site}/topic/${t.slug}`,
      lastModified: lastMod(topicNewest) ?? new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    };
  });

  const articlePages: MetadataRoute.Sitemap = published.map((a) => {
    const publishedAt = lastMod(a.published_at);
    const ageMs = publishedAt ? Date.now() - publishedAt.getTime() : Infinity;
    const fresh = ageMs < 1000 * 60 * 60 * 24 * 7;

    return {
      url: `${site}/article/${a.slug}`,
      lastModified: lastMod(a.updated_at) ?? publishedAt ?? new Date(),
      changeFrequency: (fresh ? "daily" : "weekly") as "daily" | "weekly",
      priority: fresh ? 0.9 : 0.7,
    };
  });

  return [...staticPages, ...topicPages, ...articlePages];
}

export async function generateSitemapXml(): Promise<string> {
  const entries = await getSitemapEntries();
  const body = entries
    .map((e) => {
      const lastmod =
        e.lastModified instanceof Date
          ? e.lastModified.toISOString()
          : e.lastModified
            ? new Date(e.lastModified).toISOString()
            : undefined;
      const parts = [`<url><loc>${escapeXml(e.url)}</loc>`];
      if (lastmod) parts.push(`<lastmod>${escapeXml(lastmod)}</lastmod>`);
      if (e.changeFrequency) {
        parts.push(`<changefreq>${e.changeFrequency}</changefreq>`);
      }
      if (typeof e.priority === "number") {
        parts.push(`<priority>${e.priority.toFixed(1)}</priority>`);
      }
      parts.push(`</url>`);
      return parts.join("");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
