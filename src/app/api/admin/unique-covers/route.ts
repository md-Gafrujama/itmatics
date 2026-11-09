import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin-auth";
import { hasValidCronSecret } from "@/lib/cron-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { findUniquePhoto, pexelsPhotoKey } from "@/lib/ai/pexels";
import { revalidateSitemap } from "@/lib/site";

export const maxDuration = 300;

/**
 * Body: { "force": true } regenerates EVERY article cover via Pexels.
 * Without force, only missing/duplicate covers are fixed.
 */
export async function POST(request: Request) {
  if (!hasValidCronSecret(request)) {
    const auth = await requireAdminApi(request);
    if (auth.error) {
      const status = auth.error === "Forbidden" ? 403 : 401;
      return NextResponse.json({ error: auth.error }, { status });
    }
  }

  let force = false;
  try {
    const body = await request.json();
    force = body?.force === true;
  } catch {
    // empty body = duplicates/missing only
  }

  const supabase = createAdminClient();
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, slug, title, dek, cover_image_url, topic:topics(name, slug)")
    .order("published_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const updates: { id: string; slug: string; reason: string }[] = [];
  const skipped: string[] = [];
  const failed: { slug: string; error: string }[] = [];

  // Every existing cover is off limits, including ones later in the walk, so a
  // replacement can't collide with a cover that hasn't been reached yet.
  const used = new Set<string>();
  for (const article of articles ?? []) {
    const key = pexelsPhotoKey(article.cover_image_url);
    if (key) used.add(key);
  }

  const seen = new Set<string>();
  for (const article of articles ?? []) {
    const key = pexelsPhotoKey(article.cover_image_url);
    const missing = !article.cover_image_url;
    const duplicate = !!(key && seen.has(key));
    const needsNew = force || missing || duplicate;
    if (key) seen.add(key);

    if (!needsNew && key) {
      skipped.push(article.slug);
      continue;
    }

    const topic = article.topic as { name?: string; slug?: string } | null;
    const topicName = topic?.name ?? "enterprise technology";
    const titleWords = article.title
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 4)
      .join(" ");

    const queries = [
      `${topicName} ${titleWords}`.trim(),
      `${titleWords} technology`.trim(),
      `${topicName} enterprise IT`,
      `data center ${topic?.slug ?? "cloud"}`,
      "modern enterprise technology office",
    ].filter((q) => q.length > 3);

    const { image, lastError: lastErr } = await findUniquePhoto(queries, {
      excludeKeys: used,
      pageSalt: article.slug,
    });

    if (!image) {
      // A Pexels outage says nothing about the current cover, so keep it.
      if ((force || duplicate) && !lastErr) {
        const { error: clearError } = await supabase
          .from("articles")
          .update({
            cover_image_url: null,
            cover_image_alt: article.title,
            cover_image_credit: null,
            cover_image_credit_url: null,
          })
          .eq("id", article.id);
        if (clearError) {
          failed.push({ slug: article.slug, error: clearError.message });
          continue;
        }
        updates.push({
          id: article.id,
          slug: article.slug,
          reason: "cleared-no-pexels",
        });
      }
      failed.push({
        slug: article.slug,
        error: lastErr instanceof Error ? lastErr.message : "no photo found",
      });
      continue;
    }

    const newKey = pexelsPhotoKey(image.url) ?? String(image.photoId);
    used.add(newKey);
    used.add(String(image.photoId));

    const { error: updateError } = await supabase
      .from("articles")
      .update({
        cover_image_url: image.url,
        cover_image_alt: image.alt || article.title,
        cover_image_credit: image.photographer,
        cover_image_credit_url: image.photographerUrl,
      })
      .eq("id", article.id);

    if (updateError) {
      failed.push({ slug: article.slug, error: updateError.message });
      continue;
    }

    updates.push({
      id: article.id,
      slug: article.slug,
      reason: force
        ? "force-regenerated"
        : missing
          ? "filled-missing"
          : "replaced-duplicate",
    });
    revalidatePath(`/article/${article.slug}`);
  }

  revalidatePath("/");
  revalidateSitemap();

  return NextResponse.json({
    ok: true,
    force,
    updated: updates.length,
    kept: skipped.length,
    failed: failed.length,
    updates,
    failedDetails: failed,
  });
}
