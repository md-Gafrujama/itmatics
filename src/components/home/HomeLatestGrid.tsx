import Link from "next/link";
import CoverImage from "@/components/CoverImage";
import { storyHref } from "@/lib/story-link";
import type { TopicStory } from "@/lib/topic-stories";

export default function HomeLatestGrid({
  stories,
  mostRead,
}: {
  stories: TopicStory[];
  mostRead: TopicStory[];
}) {
  if (stories.length === 0 && mostRead.length === 0) return null;

  const [featured, ...rest] = stories;

  return (
    <section className="section home-latest">
      <div className="wrap">
        <div className="sec-head">
          <h2>Latest reporting</h2>
          <span className="rule" />
          <Link className="all" href="/topic/artificial-intelligence">
            Browse topics
          </Link>
        </div>

        <div className="river">
          <div className="col-main">
            {featured && (
              <article className="story story--featured">
                <Link
                  href={storyHref(featured)}
                  className="thumb"
                  aria-label={featured.title}
                >
                  <CoverImage
                    src={featured.coverImageUrl}
                    alt={featured.coverImageAlt}
                    seed={featured.slug}
                    label={featured.category}
                    sizes="(min-width: 900px) 420px, 100vw"
                  />
                </Link>
                <div>
                  <span className="tag news">
                    {featured.category || "News"}
                  </span>
                  <h3>
                    <Link href={storyHref(featured)}>{featured.title}</Link>
                  </h3>
                  <p className="dek">{featured.dek}</p>
                  <p className="byline mono">
                    By <b>{featured.authorName}</b> / {featured.readMinutes} min
                  </p>
                </div>
              </article>
            )}

            {rest.map((story) => (
              <article className="story" key={story.id}>
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
                    sizes="220px"
                  />
                </Link>
                <div>
                  <span className="tag news">{story.category || "News"}</span>
                  <h3>
                    <Link href={storyHref(story)}>{story.title}</Link>
                  </h3>
                  <p className="dek">{story.dek}</p>
                  <p className="byline mono">
                    By <b>{story.authorName}</b> / {story.readMinutes} min
                  </p>
                </div>
              </article>
            ))}
          </div>

          <aside className="col-side" aria-label="Most read and briefing">
            {mostRead.length > 0 && (
              <div className="side-box">
                <div className="hd">
                  Most read <span className="mono">7-DAY</span>
                </div>
                <ul className="mostread">
                  {mostRead.map((story, i) => (
                    <li key={story.id}>
                      <span className="n">{i + 1}</span>
                      <div>
                        <h4>
                          <Link href={storyHref(story)}>{story.title}</Link>
                        </h4>
                        <span className="byline mono">
                          By {story.authorName}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="side-box home-latest-cta">
              <div className="hd">
                The Download <span className="mono">DAILY</span>
              </div>
              <div className="home-latest-cta-body">
                <p className="dek">
                  One email each morning: the enterprise-IT stories that will
                  come up in your next leadership meeting, in five minutes.
                </p>
                <Link className="btn btn-primary" href="/newsletters">
                  Get the briefing
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
