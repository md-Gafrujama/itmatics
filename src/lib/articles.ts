import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isMissingSchemaError } from "@/lib/db-errors";
import { HR_TOPIC_SLUGS } from "@/lib/topic-config";
import { normalizeDashesDeep } from "@/lib/text";
import type { ArticleWithTopic } from "@/types/database";

const PUBLISHED_SELECT = "*, topic:topics(*)";

function sanitizeArticle(article: ArticleWithTopic): ArticleWithTopic {
  return normalizeDashesDeep(article);
}

/** Only IT navbar topics - drops legacy HR-era rows if any remain in the DB. */
function isHrArticle(article: ArticleWithTopic): boolean {
  return Boolean(article.topic?.slug && HR_TOPIC_SLUGS.has(article.topic.slug));
}

export const getLatestArticles = cache(
  async (limit = 20): Promise<ArticleWithTopic[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select(PUBLISHED_SELECT)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      if (!isMissingSchemaError(error)) {
        console.error("getLatestArticles failed:", error.message);
      }
      return [];
    }
    return ((data ?? []) as unknown as ArticleWithTopic[])
      .filter(isHrArticle)
      .map(sanitizeArticle);
  },
);

export const getArticlesByTopicSlug = cache(
  async (topicSlug: string, limit = 200): Promise<ArticleWithTopic[]> => {
    if (!HR_TOPIC_SLUGS.has(topicSlug)) return [];

    const supabase = await createClient();
    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .select("id")
      .eq("slug", topicSlug)
      .maybeSingle();

    if (topicError) {
      if (!isMissingSchemaError(topicError)) {
        console.error(
          "getArticlesByTopicSlug topic lookup failed:",
          topicError.message,
        );
      }
      return [];
    }
    if (!topic) return [];

    let query = supabase
      .from("articles")
      .select(PUBLISHED_SELECT)
      .eq("status", "published")
      .eq("topic_id", topic.id)
      .order("published_at", { ascending: false });

    if (limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      if (!isMissingSchemaError(error)) {
        console.error("getArticlesByTopicSlug failed:", error.message);
      }
      return [];
    }

    return ((data ?? []) as unknown as ArticleWithTopic[])
      .filter((a) => a.topic?.slug === topicSlug)
      .map(sanitizeArticle);
  },
);

/** Fill a homepage/topic row to `count` cards, topic stories first. */
export function fillArticleRow(
  primary: ArticleWithTopic[],
  pool: ArticleWithTopic[],
  count = 3,
  excludeIds: Iterable<string> = [],
): ArticleWithTopic[] {
  const out: ArticleWithTopic[] = [];
  const used = new Set(excludeIds);
  for (const list of [primary, pool]) {
    for (const article of list) {
      if (out.length >= count) return out;
      if (used.has(article.id)) continue;
      out.push(article);
      used.add(article.id);
    }
  }
  return out;
}

export const getArticleBySlug = cache(
  async (slug: string): Promise<ArticleWithTopic | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select(PUBLISHED_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      if (!isMissingSchemaError(error)) {
        console.error("getArticleBySlug failed:", error.message);
      }
      return null;
    }
    if (!data) return null;
    const article = sanitizeArticle(data as unknown as ArticleWithTopic);
    return isHrArticle(article) ? article : null;
  },
);

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
