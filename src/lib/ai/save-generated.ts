import "server-only";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/articles";
import {
  findUniquePhoto,
  isCoverConflict,
  usedCoverKeys,
  type PexelsPick,
} from "@/lib/ai/pexels";
import {
  researchTitle,
  researchTopic,
  withGenerationDeadline,
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

/** A concurrent run can take the chosen photo before this insert lands. */
const COVER_ATTEMPTS = 3;

export async function persistGeneratedArticle(
  supabase: CmsClient,
  args: {
    generated: GeneratedArticle;
    topic: NavbarTopic;
    status?: ArticleStatus;
    source?: ArticleSource;
  },
): Promise<{ id: string; slug: string; title: string }> {
  const generated = normalizeDashesDeep(clampGeneratedSeoFields(args.generated));
  const status = args.status ?? "published";
  const slug = await uniqueSlug(
    supabase,
    generated.slug || generated.title,
  );
  const coverQueries = [
    generated.image_search_query,
    `${args.topic.name} enterprise IT`,
    `data center ${args.topic.slug}`,
    "modern enterprise technology office",
  ];

  const insertArticle = (image: PexelsPick | null) =>
    supabase
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

  const rejectedKeys = new Set<string>();
  let result: Awaited<ReturnType<typeof insertArticle>> | undefined;

  for (let attempt = 0; attempt < COVER_ATTEMPTS; attempt++) {
    // Read just before choosing: generation takes minutes, and a list from the
    // start of the run could miss a photo another run has since used.
    const excludeKeys = await usedCoverKeys(supabase);
    for (const key of rejectedKeys) excludeKeys.add(key);

    const { image, lastError } = await findUniquePhoto(coverQueries, {
      excludeKeys,
      pageSalt: slug,
    });
    if (!image) {
      console.error(
        "No unique Pexels cover found; saving article without cover:",
        lastError instanceof Error ? lastError.message : lastError,
      );
    }

    result = await insertArticle(image);
    if (!image || !result.error || !isCoverConflict(result.error)) break;

    rejectedKeys.add(String(image.photoId));
  }

  const { data: inserted, error: insertError } = result!;

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
    // After the response, so slow email can't turn a saved article into a
    // timed-out run that gets logged as failed.
    after(() => notifySubscribersOfArticle(inserted.id));
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
  const saved = await withGenerationDeadline(async (signal) => {
    const researchBrief = await researchTitle(
      title,
      recentTitles,
      topic,
      topics,
      signal,
    );
    const generated = await writeArticleFromBrief(
      researchBrief,
      topics.map((t) => t.slug),
      topic.slug,
      { forcedTitle: title, signal },
    );
    signal.throwIfAborted();

    return persistGeneratedArticle(supabase, {
      generated,
      topic,
      status: input.status,
      source: "ai",
    });
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

  const { data: recentArticles } = await supabase
    .from("articles")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(50);

  const recentTitles = (recentArticles ?? []).map((a) => a.title);
  const saved = await withGenerationDeadline(async (signal) => {
    const researchBrief = await researchTopic(
      recentTitles,
      topic,
      topics,
      signal,
    );
    const generated = await writeArticleFromBrief(
      researchBrief,
      topics.map((t) => t.slug),
      topic.slug,
      { signal },
    );
    signal.throwIfAborted();

    return persistGeneratedArticle(supabase, {
      generated,
      topic,
      status: input.status,
      source: "ai",
    });
  });

  return { ...saved, topic: topic.slug };
}
