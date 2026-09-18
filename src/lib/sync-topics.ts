import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HR_TOPICS } from "@/lib/topic-config";
import type { Database } from "@/types/database";

type CmsClient = SupabaseClient<Database>;

/** Upsert navbar topics from topic-config into Supabase (source of truth for CMS). */
export async function syncHrTopicsToDb(supabase: CmsClient) {
  const results: { slug: string; id: string; action: "inserted" | "updated" }[] =
    [];

  for (const topic of HR_TOPICS) {
    const { data: existing } = await supabase
      .from("topics")
      .select("id, slug, name, description")
      .eq("slug", topic.slug)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from("topics")
        .update({
          name: topic.navLabel,
          description: topic.description,
        })
        .eq("id", existing.id)
        .select("id, slug")
        .single();

      if (error) throw new Error(`Update topic ${topic.slug}: ${error.message}`);
      results.push({ slug: data.slug, id: data.id, action: "updated" });
    } else {
      const { data, error } = await supabase
        .from("topics")
        .insert({
          slug: topic.slug,
          name: topic.navLabel,
          description: topic.description,
        })
        .select("id, slug")
        .single();

      if (error) throw new Error(`Insert topic ${topic.slug}: ${error.message}`);
      results.push({ slug: data.slug, id: data.id, action: "inserted" });
    }
  }

  return results;
}

export async function getHrNavbarTopics(supabase: CmsClient) {
  const slugs = HR_TOPICS.map((t) => t.slug);
  const { data, error } = await supabase
    .from("topics")
    .select("id, slug, name")
    .in("slug", slugs);

  if (error) throw new Error(error.message);

  const order = new Map(HR_TOPICS.map((t, i) => [t.slug, t.navOrder]));
  return (data ?? []).sort(
    (a, b) => (order.get(a.slug) ?? 99) - (order.get(b.slug) ?? 99),
  );
}
