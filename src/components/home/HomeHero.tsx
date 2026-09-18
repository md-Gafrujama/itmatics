import Link from "next/link";
import CoverImage from "@/components/CoverImage";
import { storyHref } from "@/lib/story-link";
import type { TopicStory } from "@/lib/topic-stories";

function formatByline(story: TopicStory, opts?: { short?: boolean }) {
  if (opts?.short) {
    return `By ${story.authorName}`;
  }
  return (
    <>
      By <b>{story.authorName}</b>
      {" · "}
      {story.readMinutes} min read
    </>
  );
}

function storyTag(story: TopicStory) {
  return story.category || "News";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function HomeHero({
  lead,
  railStories,
}: {
  lead: TopicStory;
  railStories: TopicStory[];
}) {
  const href = storyHref(lead);

  return (
    <section className="hero">
      <div className="hero-wash" aria-hidden />
      <div className="wrap">
        <div className="hero-stage">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="hero-kicker-tag">{storyTag(lead)}</span>
              {lead.topicName && (
                <Link
                  href={`/topic/${lead.topicSlug}`}
                  className="hero-kicker-desk"
                >
                  {lead.topicName}
                </Link>
              )}
            </div>

            <h1>
              <Link href={href}>{lead.title}</Link>
            </h1>

            <p className="dek">{lead.dek}</p>

            <div className="hero-actions">
              <div className="hero-author">
                <span className="lead-av" aria-hidden>
                  {initials(lead.authorName)}
                </span>
                <p className="byline mono">{formatByline(lead)}</p>
              </div>
              <Link href={href} className="btn btn-primary lead-cta">
                Read the story
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>

          <Link href={href} className="hero-visual" aria-label={lead.title}>
            <CoverImage
              src={lead.coverImageUrl}
              alt={lead.coverImageAlt}
              seed={lead.slug}
              label={lead.category}
              priority
              sizes="(min-width: 980px) 52vw, 100vw"
            />
            <span className="hero-visual-scrim" aria-hidden />
          </Link>
        </div>

        {railStories.length > 0 && (
          <div className="hero-rail" aria-label="Top stories">
            <div className="hero-rail-head">
              <h2 className="hero-rail-label">
                <span className="dot" aria-hidden />
                Top stories
              </h2>
            </div>
            <div className="hero-rail-track">
              {railStories.map((story) => (
                <Link
                  key={story.id}
                  href={storyHref(story)}
                  className="hero-rail-card"
                >
                  <span className="hero-rail-thumb" aria-hidden>
                    <CoverImage
                      src={story.coverImageUrl}
                      alt={story.coverImageAlt}
                      seed={story.slug}
                      label={story.category}
                      sizes="160px"
                    />
                  </span>
                  <span className="hero-rail-body">
                    <span className="tag news">{storyTag(story)}</span>
                    <span className="hero-rail-title">{story.title}</span>
                    <span className="byline mono">
                      {formatByline(story, { short: true })}
                      {" · "}
                      {story.readMinutes} min
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
