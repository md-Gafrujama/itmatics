import "server-only";
import { getNavTopics } from "@/lib/topic-config";
import { getLatestArticles } from "@/lib/articles";
import { articlesToStories, type TopicStory } from "@/lib/topic-stories";
import type { TopicConfig } from "@/lib/topic-config";

export type HomePageData = {
  lead: TopicStory | null;
  railStories: TopicStory[];
  riverStories: TopicStory[];
  mostRead: TopicStory[];
  featureStories: TopicStory[];
  topicCards: TopicConfig[];
};

/** Organize homepage stories for the ITmatics News layout. */
export async function getHomePageData(): Promise<HomePageData> {
  const navTopics = getNavTopics();
  const allArticles = await getLatestArticles(60);
  const allStories = articlesToStories(allArticles);

  const lead = allStories[0] ?? null;
  const rest = allStories.slice(lead ? 1 : 0);

  return {
    lead,
    // Under-hero Top stories strip
    railStories: rest.slice(0, 3),
    // Main latest reporting river - keep this well stocked
    riverStories: rest.slice(3, 9),
    mostRead: rest.slice(0, 5),
    featureStories: rest.slice(9, 12),
    topicCards: navTopics.slice(0, 4),
  };
}
