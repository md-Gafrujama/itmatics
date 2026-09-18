import Link from "next/link";
import CoverImage from "@/components/CoverImage";
import { storyHref } from "@/lib/story-link";
import type { TopicStory } from "@/lib/topic-stories";

export default function StoryCard({ story }: { story: TopicStory }) {
  const href = storyHref(story);

  return (
    <article className="home-story">
      <Link href={href} className="home-story-media" aria-label={story.title}>
        <CoverImage
          src={story.coverImageUrl}
          alt={story.coverImageAlt}
          seed={story.slug}
          label={story.category}
        />
      </Link>
      <div className="home-story-copy">
        <span className="home-story-meta">
          {story.topicName} &middot; {story.readMinutes} min read
        </span>
        <h3>
          <Link href={href}>{story.title}</Link>
        </h3>
        <p>{story.dek}</p>
      </div>
    </article>
  );
}
