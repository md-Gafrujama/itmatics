import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CoverImage from "@/components/CoverImage";
import SubscribeBand from "@/components/SubscribeBand";
import { getTopicConfig, getNavTopics } from "@/lib/topic-config";
import { getTopicBySlug } from "@/lib/topics";
import { getArticlesByTopicSlug } from "@/lib/articles";
import { articlesToStories, syntheticTopic } from "@/lib/topic-stories";
import { storyHref } from "@/lib/story-link";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getTopicConfig(slug);
  if (!config) return {};

  return {
    title: config.title,
    description: config.description,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getTopicConfig(slug);
  if (!config) notFound();

  const dbTopic = await getTopicBySlug(slug);
  const topic = dbTopic ?? syntheticTopic(config);
  const articles = await getArticlesByTopicSlug(slug);
  const stories = articlesToStories(articles);
  const [lead, ...moreStories] = stories;
  const allTopics = getNavTopics();
  const otherTopics = allTopics.filter((t) => t.slug !== slug);
  const description = dbTopic?.description ?? config.description;
  const deskNumber = String(config.navOrder).padStart(2, "0");
  const storyLabel =
    stories.length === 1 ? "1 story" : `${stories.length} stories`;

  return (
    <>
      <SiteHeader currentTopicSlug={slug} />
      <main className="tp">
        <section className="tp-hero">
          <div className="tp-hero-bg" aria-hidden />
          <div className="wrap tp-hero-grid">
            <div className="tp-hero-copy">
              <nav className="tp-crumbs mono" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden>/</span>
                <span>Topics</span>
                <span aria-hidden>/</span>
                <span>{config.crumb}</span>
              </nav>

              <p className="tp-eyebrow mono">
                Desk {deskNumber} of 07 · {config.edition}
              </p>
              <h1>{config.title}</h1>
              <p className="tp-lead">{description}</p>

              <div className="tp-hero-meta">
                <p className="tp-focus mono" aria-label="Focus areas">
                  {config.chips.join(" · ")}
                </p>
                <p className="tp-count mono">{storyLabel} on this desk</p>
              </div>

              <div className="tp-hero-actions">
                <a href="#topic-stories" className="btn btn-primary">
                  Browse coverage
                </a>
                <a href="#subscribe" className="tp-text-link">
                  Get this desk in your inbox
                </a>
              </div>
            </div>

            {lead ? (
              <Link
                href={storyHref(lead)}
                className="tp-hero-visual"
                aria-label={lead.title}
              >
                <CoverImage
                  src={lead.coverImageUrl}
                  alt={lead.coverImageAlt}
                  seed={lead.slug}
                  label={config.navLabel}
                  priority
                  sizes="(min-width: 960px) 520px, 100vw"
                />
                <span className="tp-hero-visual-cap">
                  <span className="mono">Lead story</span>
                  <strong>{lead.title}</strong>
                </span>
              </Link>
            ) : (
              <div className="tp-hero-visual tp-hero-visual--empty" aria-hidden>
                <span className="mono">{config.cardKicker ?? config.kicker}</span>
                <strong>{config.navLabel}</strong>
                <p>Coverage launching on this desk</p>
              </div>
            )}
          </div>
        </section>

        <nav className="tp-desk-rail" aria-label="All desks">
          <div className="wrap tp-desk-rail-inner">
            {allTopics.map((t) => (
              <Link
                key={t.slug}
                href={`/topic/${t.slug}`}
                className={
                  t.slug === slug ? "tp-desk-rail-link active" : "tp-desk-rail-link"
                }
              >
                {t.navLabel}
              </Link>
            ))}
          </div>
        </nav>

        <section className="tp-section" id="topic-stories">
          <div className="wrap">
            {lead ? (
              <>
                <article className="tp-featured">
                  <div className="tp-featured-copy">
                    <span className="tp-label mono">Lead story</span>
                    <h2>
                      <Link href={storyHref(lead)}>{lead.title}</Link>
                    </h2>
                    <p>{lead.dek}</p>
                    <p className="tp-meta mono">
                      By {lead.authorName}
                      {" · "}
                      {lead.readMinutes} min read
                    </p>
                    <Link href={storyHref(lead)} className="tp-read">
                      Read full story
                    </Link>
                  </div>
                  <Link
                    href={storyHref(lead)}
                    className="tp-featured-media"
                    aria-label={lead.title}
                    tabIndex={-1}
                  >
                    <CoverImage
                      src={lead.coverImageUrl}
                      alt={lead.coverImageAlt}
                      seed={lead.slug}
                      label={lead.category}
                      sizes="(min-width: 900px) 560px, 100vw"
                    />
                  </Link>
                </article>

                {moreStories.length > 0 && (
                  <div className="tp-more">
                    <div className="tp-more-head">
                      <h2>All coverage on {config.navLabel}</h2>
                      <p className="mono">
                        {moreStories.length} more{" "}
                        {moreStories.length === 1 ? "story" : "stories"}
                      </p>
                    </div>
                    <ul className="tp-story-list tp-story-list--all">
                      {moreStories.map((story) => (
                        <li key={story.id}>
                          <Link
                            href={storyHref(story)}
                            className="tp-story-media"
                            aria-label={story.title}
                          >
                            <CoverImage
                              src={story.coverImageUrl}
                              alt={story.coverImageAlt}
                              seed={story.slug}
                              label={story.category}
                              sizes="180px"
                            />
                          </Link>
                          <div className="tp-story-copy">
                            <h3>
                              <Link href={storyHref(story)}>{story.title}</Link>
                            </h3>
                            <p>{story.dek}</p>
                            <p className="tp-meta mono">
                              By {story.authorName}
                              {" · "}
                              {story.readMinutes} min read
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {stories.length === 1 && (
                  <p className="tp-only mono">
                    Showing all {storyLabel} published on this desk.
                  </p>
                )}
              </>
            ) : (
              <div className="tp-empty">
                <p className="tp-label mono">Desk</p>
                <h2>No stories yet on {config.navLabel}</h2>
                <p>
                  Reporting is coming on{" "}
                  {config.chips.slice(0, 3).join(", ").toLowerCase()}, and more.
                  Subscribe to get the first briefing when it publishes.
                </p>
                <a href="#subscribe" className="btn btn-primary">
                  Subscribe free
                </a>
              </div>
            )}

            {otherTopics.length > 0 && (
              <aside className="tp-desks" aria-label="Other desks">
                <div className="tp-more-head">
                  <h2>Explore other desks</h2>
                  <p className="mono">6 more desks</p>
                </div>
                <ul className="tp-desks-list">
                  {otherTopics.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/topic/${t.slug}`}>
                        <span className="tp-desk-n mono">
                          {String(t.navOrder).padStart(2, "0")}
                        </span>
                        <span className="tp-desk-body">
                          <span className="tp-desk-name">{t.navLabel}</span>
                          <span className="tp-desk-desc">{t.description}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </section>

        <SubscribeBand
          source={`topic-${topic.slug}`}
          kicker={`${config.edition.toUpperCase()} - FROM ITMATICS NEWS`}
          title={`Get ${config.navLabel} in your inbox`}
          description={config.description}
        />
      </main>
      <SiteFooter />
    </>
  );
}
