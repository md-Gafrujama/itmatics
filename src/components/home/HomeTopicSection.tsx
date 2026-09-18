import Link from "next/link";
import HomeStoryCard from "@/components/home/HomeStoryCard";
import type { TopicConfig } from "@/lib/topic-config";
import type { TopicStory } from "@/lib/topic-stories";

export default function HomeTopicSection({
  config,
  stories,
}: {
  config: TopicConfig;
  stories: TopicStory[];
}) {
  const row = stories.slice(0, 3);
  if (row.length === 0) return null;

  return (
    <section
      className="hr-desk"
      id={`topic-${config.slug}`}
      data-topic={config.slug}
    >
      <div className="wrap">
        <header className="hr-desk-head">
          <div className="hr-desk-head-top">
            <span className="hr-desk-kicker">{config.kicker}</span>
            <Link href={`/topic/${config.slug}`} className="hr-desk-more">
              All stories →
            </Link>
          </div>
          <h2>{config.navLabel}</h2>
          <p className="hr-desk-dek">{config.description}</p>
        </header>

        <div className="hr-story-grid">
          {row.map((story) => (
            <HomeStoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
}
