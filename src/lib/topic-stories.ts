import type { ArticleWithTopic, Topic } from "@/types/database";
import type { TopicConfig } from "@/lib/topic-config";

export type TopicStory = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  category: string;
  readMinutes: number;
  authorName: string;
  topicSlug: string;
  topicName: string;
  trending?: boolean;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
};

export function articleToStory(article: ArticleWithTopic): TopicStory {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    category: article.topic?.name ?? "Story",
    readMinutes: article.read_time_minutes ?? 5,
    authorName: article.author_name,
    topicSlug: article.topic?.slug ?? "",
    topicName: article.topic?.name ?? "",
    coverImageUrl: article.cover_image_url,
    coverImageAlt: article.cover_image_alt,
  };
}

export function articlesToStories(articles: ArticleWithTopic[]): TopicStory[] {
  return articles.map(articleToStory);
}

export function syntheticTopic(config: TopicConfig): Topic {
  return {
    id: `config-${config.slug}`,
    slug: config.slug,
    name: config.navLabel,
    description: config.description,
    created_at: new Date().toISOString(),
  };
}
