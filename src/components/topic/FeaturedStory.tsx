import Link from "next/link";
import CoverImage from "@/components/CoverImage";
import { storyHref } from "@/lib/story-link";
import type { TopicStory } from "@/lib/topic-stories";

export default function FeaturedStory({ story }: { story: TopicStory }) {
  const href = storyHref(story);

  return (
    <article className="topic-lead">
      <Link href={href} className="topic-lead-media" aria-label={story.title}>
        <CoverImage
          src={story.coverImageUrl}
          alt={story.coverImageAlt}
          seed={story.slug}
          label={story.category}
          priority
        />
      </Link>
      <div className="topic-lead-copy">
        <span className="kicker">Lead story</span>
        <h2>
          <Link href={href}>{story.title}</Link>
        </h2>
        <p className="dek">{story.dek}</p>
        <div className="byline">
          <span>By {story.authorName}</span>
          <span className="dot" />
          <span>{story.readMinutes} min read</span>
        </div>
        <Link href={href} className="topic-lead-link">
          Read full story <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
