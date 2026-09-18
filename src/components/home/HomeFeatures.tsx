import Link from "next/link";
import CoverImage from "@/components/CoverImage";
import { storyHref } from "@/lib/story-link";
import type { TopicStory } from "@/lib/topic-stories";

export default function HomeFeatures({ stories }: { stories: TopicStory[] }) {
  if (stories.length === 0) return null;

  return (
    <section className="section">
      <div className="wrap">
        <div className="sec-head">
          <h2>Long reads</h2>
          <span className="rule" />
          <Link className="all" href="/topic/it-leadership">
            All features
          </Link>
        </div>
        <div className="threeup">
          {stories.map((story) => (
            <article className="feat" key={story.id}>
              <Link
                href={storyHref(story)}
                className="thumb"
                aria-label={story.title}
              >
                <CoverImage
                  src={story.coverImageUrl}
                  alt={story.coverImageAlt}
                  seed={story.slug}
                  label={story.category}
                  sizes="(min-width: 900px) 360px, 100vw"
                />
              </Link>
              <span className="tag feature">{story.category || "Feature"}</span>
              <h3>
                <Link href={storyHref(story)}>{story.title}</Link>
              </h3>
              <p className="dek">{story.dek}</p>
              <p className="byline mono" style={{ marginTop: 10 }}>
                By {story.authorName} / {story.readMinutes} min
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
