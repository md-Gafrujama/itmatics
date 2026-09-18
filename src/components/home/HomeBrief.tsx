import Link from "next/link";
import { storyHref } from "@/lib/story-link";
import type { TopicStory } from "@/lib/topic-stories";

export default function HomeBrief({ stories }: { stories: TopicStory[] }) {
  if (stories.length === 0) return null;

  return (
    <section className="hr-brief">
      <div className="wrap">
        <header className="hr-brief-head">
          <span className="hr-brief-label">The Download</span>
          <h2>Today in enterprise IT</h2>
        </header>
        <ol className="hr-brief-list">
          {stories.map((story) => (
            <li className="hr-brief-item" key={story.id}>
              <span className="hr-brief-tag">{story.topicName}</span>
              <h3>
                <Link href={storyHref(story)}>{story.title}</Link>
              </h3>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
