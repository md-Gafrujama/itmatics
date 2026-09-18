import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { generateAndSaveTrending } from "@/lib/ai/save-generated";
import type { ArticleStatus } from "@/types/database";

export const maxDuration = 300;

/** Auto-research a trending IT story for one navbar topic (Claude + Pexels). */
export async function POST(request: Request) {
  const auth = await requireAdminApi(request);
  if (auth.error || !auth.admin) {
    const status = auth.error === "Forbidden" ? 403 : 401;
    return NextResponse.json({ error: auth.error }, { status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const topicId =
    typeof body === "object" && body && "topic_id" in body
      ? String((body as { topic_id?: unknown }).topic_id ?? "")
      : "";
  const rawStatus =
    typeof body === "object" && body && "status" in body
      ? String((body as { status?: unknown }).status ?? "")
      : "published";
  const status: ArticleStatus =
    rawStatus === "draft" ? "draft" : "published";

  if (!topicId) {
    return NextResponse.json({ error: "Select a topic" }, { status: 400 });
  }

  let topicSearched: string | null = "Trending auto-generate";

  try {
    const saved = await generateAndSaveTrending(auth.admin, {
      topicId,
      status,
    });
    topicSearched = `${saved.topic}: ${saved.title}`;

    await auth.admin.from("generation_log").insert({
      topic_searched: topicSearched,
      status: "success",
      article_id: saved.id,
    });

    return NextResponse.json({
      ok: true,
      id: saved.id,
      slug: saved.slug,
      title: saved.title,
      topic: saved.topic,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await auth.admin.from("generation_log").insert({
      topic_searched: topicSearched,
      status: "failed",
      error_message: message,
    });
    console.error("admin generate-trending failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
