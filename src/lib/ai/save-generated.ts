import "server-only";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/articles";
import { pexelsPhotoKey, searchPexelsPhoto } from "@/lib/ai/pexels";
import {
  researchTitle,
  researchTopic,
  writeArticleFromBrief,
  type GeneratedArticle,
  type NavbarTopic,
} from "@/lib/ai/generate-article";
import { HR_NEWS_TOPIC_SLUGS } from "@/lib/topic-config";
import { SEO_LIMITS, clampGeneratedSeoFields, clampToLimit } from "@/lib/seo";
import { normalizeDashesDeep } from "@/lib/text";
import { revalidateSitemap } from "@/lib/site";
import { notifySubscribersOfArticle } from "@/lib/subscribers";
import { getHrNavbarTopics, syncHrTopicsToDb } from "@/lib/sync-topics";
import type {
  ArticleSource,
  ArticleStatus,
  Database,
} from "@/types/database";

type CmsClient = SupabaseClient<Database>;

export async function uniqueSlug(
  supabase: CmsClient,
  base: string,
): Promise<string> {
  const slug = slugify(base);
  const { data } = await supabase
    .from("articles")
    .select("slug")
    .like("slug", `${slug}%`);

  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(slug)) return slug;

  for (let i = 2; i < 50; i++) {
    const candidate = `${slug}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

export async function usedCoverKeys(
  supabase: CmsClient,
): Promise<Set<string>> {
  const { data } = await supabase
    .from("articles")
    .select("cover_image_url")
    .not("cover_image_url", "is", null);

  const keys = new Set<string>();
  for (const row of data ?? []) {
    const key = pexelsPhotoKey(row.cover_image_url);
    if (key) keys.add(key);
  }
  return keys;
}

export async function persistGeneratedArticle(
  supabase: CmsClient,
  args: {
    generated: GeneratedArticle;
    topic: NavbarTopic;
    status?: ArticleStatus;
    source?: ArticleSource;
    excludeKeys?: Set<string>;
  },
): Promise<{ id: string; slug: string; title: string }> {
  const generated = normalizeDashesDeep(clampGeneratedSeoFields(args.generated));
  const status = args.status ?? "published";
  const excludeKeys = args.excludeKeys ?? (await usedCoverKeys(supabase));
  const slug = await uniqueSlug(
    supabase,
    generated.slug || generated.title,
  );
  let image = null;
  try {
    image = await searchPexelsPhoto(generated.image_search_query, {
      excludeKeys,
      pageSalt: slug,
    });
  } catch (err) {
    console.error(
      "Pexels cover fetch failed; saving article without cover:",
      err instanceof Error ? err.message : err,
    );
  }

  const { data: inserted, error: insertError } = await supabase
    .from("articles")
    .insert({
      slug,
      title: generated.title,
      dek: generated.dek,
      body_json: {
        ...generated.body,
        seo: {
          focus_keyword: generated.focus_keyword,
          og_title: generated.og_title,
          keywords: generated.seo_keywords,
          aeo_answer: generated.aeo_answer,
          geo_summary: generated.geo_summary,
        },
      },
      topic_id: args.topic.id,
      status,
      cover_image_url: image?.url ?? null,
      cover_image_alt: image?.alt ?? generated.title,
      cover_image_credit: image?.photographer ?? null,
      cover_image_credit_url: image?.photographerUrl ?? null,
      meta_title: generated.meta_title,
      meta_description: generated.meta_description,
      read_time_minutes: generated.read_time_minutes,
      author_name: "The ITmatics News Desk",
      source: args.source ?? "ai",
      published_at: status === "published" ? new Date().toISOString() : null,
    })
    .select("id, slug, title")
    .single();

  if (insertError || !inserted) {
    throw new Error(insertError?.message ?? "Article insert returned no row");
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath(`/topic/${args.topic.slug}`);
  revalidatePath(`/article/${inserted.slug}`);
  revalidateSitemap();
  if (status === "published") {
    await notifySubscribersOfArticle(inserted.id);
  }

  return inserted;
}

/** Admin path: user picks a topic + title; we research, write, cover, and SEO. */
export async function generateAndSaveFromTitle(
  supabase: CmsClient,
  input: {
    topicId: string;
    title: string;
    status: ArticleStatus;
  },
): Promise<{ id: string; slug: string; title: string; topic: string }> {
  const title = clampToLimit(input.title.trim(), SEO_LIMITS.h1);
  if (title.length < 8) {
    throw new Error("Title is too short");
  }

  await syncHrTopicsToDb(supabase);

  const [{ data: recentArticles }] = await Promise.all([
    supabase
      .from("articles")
      .select("title")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const topics = await getHrNavbarTopics(supabase);

  if (!topics || topics.length === 0) {
    throw new Error("No topics found");
  }

  const topic = topics.find((t) => t.id === input.topicId);
  if (!topic) {
    throw new Error("Unknown topic");
  }

  const recentTitles = (recentArticles ?? []).map((a) => a.title);
  const researchBrief = await researchTitle(
    title,
    recentTitles,
    topic,
    topics,
  );
  const generated = await writeArticleFromBrief(
    researchBrief,
    topics.map((t) => t.slug),
    topic.slug,
    { forcedTitle: title },
  );

  const saved = await persistGeneratedArticle(supabase, {
    generated,
    topic,
    status: input.status,
    source: "ai",
  });

  return { ...saved, topic: topic.slug };
}

/** Admin/cron: pick a trending angle for the topic, write, cover image, SEO, publish. */
export async function generateAndSaveTrending(
  supabase: CmsClient,
  input: {
    topicId: string;
    status: ArticleStatus;
  },
): Promise<{ id: string; slug: string; title: string; topic: string }> {
  await syncHrTopicsToDb(supabase);

  const topics = (await getHrNavbarTopics(supabase)).filter((t) =>
    HR_NEWS_TOPIC_SLUGS.has(t.slug),
  );

  if (topics.length === 0) {
    throw new Error("No IT topics in database. Run npm run bootstrap first.");
  }

  const topic = topics.find((t) => t.id === input.topicId);
  if (!topic) {
    throw new Error("Unknown topic");
  }

  const [{ data: recentArticles }, excludeKeys] = await Promise.all([
    supabase
      .from("articles")
      .select("title")
      .order("created_at", { ascending: false })
      .limit(50),
    usedCoverKeys(supabase),
  ]);

  const recentTitles = (recentArticles ?? []).map((a) => a.title);
  const researchBrief = await researchTopic(recentTitles, topic, topics);
  const generated = await writeArticleFromBrief(
    researchBrief,
    topics.map((t) => t.slug),
    topic.slug,
  );

  const saved = await persistGeneratedArticle(supabase, {
    generated,
    topic,
    status: input.status,
    source: "ai",
    excludeKeys,
  });

  return { ...saved, topic: topic.slug };
}
