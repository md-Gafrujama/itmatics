import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isMissingSchemaError } from "@/lib/db-errors";
import { HR_TOPIC_SLUGS } from "@/lib/topic-config";
import type { Topic } from "@/types/database";

export const getTopics = cache(async (): Promise<Topic[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    if (!isMissingSchemaError(error)) {
      console.error("getTopics failed:", error.message);
    }
    return [];
  }
  return (data ?? []).filter((t) => HR_TOPIC_SLUGS.has(t.slug));
});

export const getTopicBySlug = cache(
  async (slug: string): Promise<Topic | null> => {
    if (!HR_TOPIC_SLUGS.has(slug)) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      if (!isMissingSchemaError(error)) {
        console.error("getTopicBySlug failed:", error.message);
      }
      return null;
    }
    return data;
  },
);
