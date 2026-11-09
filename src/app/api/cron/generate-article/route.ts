import { NextResponse } from "next/server";
import { hasValidCronSecret, isCronSecretConfigured } from "@/lib/cron-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  researchTopic,
  withGenerationDeadline,
  writeArticleFromBrief,
} from "@/lib/ai/generate-article";
import { persistGeneratedArticle } from "@/lib/ai/save-generated";
import { getHrNavbarTopics, syncHrTopicsToDb } from "@/lib/sync-topics";
import { HR_NEWS_TOPIC_SLUGS } from "@/lib/topic-config";
import type { Database } from "@/types/database";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * An article can take minutes, so each invocation makes only one to stay inside
 * maxDuration. vercel.json fires this route more than once per scheduled date,
 * and two Vercel projects share this database, so the target is enforced by
 * counting what was already published in the window.
 */
const ARTICLES_PER_SCHEDULED_DATE = 2;
const SCHEDULED_WINDOW_MS = 6 * 60 * 60 * 1000;

type NavbarTopic = { id: string; slug: string; name: string };
type AdminClient = ReturnType<typeof createAdminClient>;

/** A lost log row would hide the run, so the failure must reach the server log. */
async function logRun(
  supabase: AdminClient,
  row: Database["public"]["Tables"]["generation_log"]["Insert"],
) {
  const { error } = await supabase.from("generation_log").insert(row);
  if (error) {
    console.error("generate-article cron: could not write log:", error.message);
  }
}

/** Prefer navbar topics that have fewer published articles (coverage balance). */
function pickNavbarTopic(
  topics: NavbarTopic[],
  articleCounts: Map<string, number>,
  requestedSlug?: string,
): NavbarTopic {
  if (requestedSlug) {
    const hit = topics.find((t) => t.slug === requestedSlug);
    if (!hit) throw new Error(`Unknown topic_slug: ${requestedSlug}`);
    return hit;
  }

  const ranked = [...topics].sort((a, b) => {
    const ca = articleCounts.get(a.id) ?? 0;
    const cb = articleCounts.get(b.id) ?? 0;
    if (ca !== cb) return ca - cb;
    return a.name.localeCompare(b.name);
  });

  return ranked[0];
}

/** Vercel Cron sends GET. Manual/admin triggers may POST. */
export async function GET(request: Request) {
  return runGenerateCron(request);
}

export async function POST(request: Request) {
  return runGenerateCron(request);
}

async function runGenerateCron(request: Request) {
  // These exits happen before the database is reachable or trusted, so the
  // server log is the only place they can be recorded.
  if (!isCronSecretConfigured()) {
    console.error("generate-article cron: CRON_SECRET is not configured");
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (!hasValidCronSecret(request)) {
    console.warn(
      `generate-article cron: rejected request (authorization header ${request.headers.has("authorization") ? "did not match" : "missing"})`,
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let supabase: AdminClient;
  try {
    supabase = createAdminClient();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generate-article cron failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  let requestedTopicSlug: string | undefined;
  try {
    const body = await request.json();
    requestedTopicSlug =
      typeof body?.topic_slug === "string" ? body.topic_slug : undefined;
  } catch {
    // Scheduled cron often sends an empty body.
  }

  if (requestedTopicSlug && !HR_NEWS_TOPIC_SLUGS.has(requestedTopicSlug)) {
    return NextResponse.json(
      { ok: false, error: `Unknown topic_slug: ${requestedTopicSlug}` },
      { status: 400 },
    );
  }

  let topicSearched: string | null = null;
  try {
    // A manual topic_slug request is explicit, so only scheduled runs are capped.
    if (!requestedTopicSlug) {
      const { count, error } = await supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("source", "ai")
        .eq("status", "published")
        .gte(
          "created_at",
          new Date(Date.now() - SCHEDULED_WINDOW_MS).toISOString(),
        );
      if (error) throw new Error(`Count recent articles: ${error.message}`);
      if ((count ?? 0) >= ARTICLES_PER_SCHEDULED_DATE) {
        return NextResponse.json({
          ok: true,
          count: 0,
          articles: [],
          skipped: "Target for this scheduled date already met",
        });
      }
    }

    await syncHrTopicsToDb(supabase);

    const topics = (await getHrNavbarTopics(supabase)).filter((t) =>
      HR_NEWS_TOPIC_SLUGS.has(t.slug),
    );

    if (topics.length === 0) {
      throw new Error("No topics found - run supabase/schema.sql seed first");
    }

    const [{ data: recentArticles }, { data: topicCounts }] = await Promise.all([
      supabase
        .from("articles")
        .select("title")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("articles").select("topic_id").eq("status", "published"),
    ]);

    const counts = new Map<string, number>();
    for (const row of topicCounts ?? []) {
      if (!row.topic_id) continue;
      counts.set(row.topic_id, (counts.get(row.topic_id) ?? 0) + 1);
    }

    const recentTitles = (recentArticles ?? []).map((a) => a.title);
    const selectedTopic = pickNavbarTopic(topics, counts, requestedTopicSlug);
    topicSearched = `${selectedTopic.name}: researching trending coverage`;

    const inserted = await withGenerationDeadline(async (signal) => {
      const researchBrief = await researchTopic(
        recentTitles,
        selectedTopic,
        topics,
        signal,
      );
      const generated = await writeArticleFromBrief(
        researchBrief,
        topics.map((t) => t.slug),
        selectedTopic.slug,
        { signal },
      );
      topicSearched = `${selectedTopic.name}: ${generated.title}`;
      signal.throwIfAborted();

      return persistGeneratedArticle(supabase, {
        generated,
        topic: selectedTopic,
      });
    });

    await logRun(supabase, {
      topic_searched: topicSearched,
      status: "success",
      article_id: inserted.id,
    });

    return NextResponse.json({
      ok: true,
      count: 1,
      articles: [{ slug: inserted.slug, topic: selectedTopic.slug }],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logRun(supabase, {
      topic_searched: topicSearched,
      status: "failed",
      error_message: message,
    });
    console.error("generate-article cron failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
