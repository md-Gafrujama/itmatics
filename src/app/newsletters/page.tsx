import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CoverImage from "@/components/CoverImage";
import { getNavTopics } from "@/lib/topic-config";
import { getArticlesByTopicSlug } from "@/lib/articles";
import type { ArticleWithTopic } from "@/types/database";
import type { TopicConfig } from "@/lib/topic-config";

export const metadata: Metadata = {
  title: "Newsletters",
  description:
    "The Download - weekday ITmatics briefing across AI, Cloud, Security, Data & Analytics, IT Leadership, Digital Transformation, and Infrastructure. Free.",
};

export const revalidate = 300;

type DeskStory = {
  topic: TopicConfig;
  article: ArticleWithTopic | null;
};

async function getLatestPerTopic(): Promise<DeskStory[]> {
  const topics = getNavTopics();
  const rows = await Promise.all(
    topics.map(async (topic) => {
      const articles = await getArticlesByTopicSlug(topic.slug, 1);
      return { topic, article: articles[0] ?? null };
    }),
  );
  return rows;
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function Page() {
  const desks = await getLatestPerTopic();
  const withStories = desks.filter((d) => d.article);

  return (
    <>
      <SiteHeader />
      <main className="spage">
        <section className="spage-hero">
          <div className="spage-hero-bg" aria-hidden />
          <div className="wrap spage-hero-inner spage-hero-inner--split">
            <div>
              <p className="spage-eyebrow mono">The Download</p>
              <h1>Enterprise IT, five minutes a day</h1>
              <p className="spage-lead">
                One weekday email covering all seven ITmatics desks in short:
                Artificial Intelligence on adoption and governance; Cloud on
                hybrid strategy and cost; Security on identity and resilience;
                Data &amp; Analytics on platforms leaders can trust; IT
                Leadership on strategy and operating models; Digital
                Transformation on change that sticks; and Infrastructure on the
                systems that keep enterprise IT running.
              </p>
              <ul className="spage-checklist">
                <li>Weekday mornings, built for leadership calendars</li>
                <li>One latest story from each of our seven desks</li>
                <li>Unsubscribe anytime. We do not sell your address</li>
              </ul>
            </div>
            <form
              id="subscribe"
              className="spage-form js-fake-subscribe"
              data-source="newsletters"
            >
              <p className="spage-form-kicker mono">Subscribe free</p>
              <div className="row">
                <input
                  type="text"
                  name="firstname"
                  placeholder="First name"
                  aria-label="First name"
                />
                <input
                  type="text"
                  name="company"
                  placeholder="Company"
                  aria-label="Company"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Work email"
                aria-label="Work email"
                required
              />
              <select name="role" aria-label="Your role" defaultValue="">
                <option value="">Your role (optional)</option>
                <option>CIO / IT Director</option>
                <option>CISO / Security Leader</option>
                <option>Enterprise Architect</option>
                <option>Engineering / Platform Lead</option>
                <option>Data / Analytics Leader</option>
                <option>Other</option>
              </select>
              <button className="btn btn-primary" type="submit">
                Get The Download
              </button>
              <p className="spage-form-note mono">
                By subscribing you agree to receive The Download. See our{" "}
                <Link href="/privacy">privacy notice</Link>.
              </p>
            </form>
          </div>
        </section>

        <section className="spage-section nl-desks">
          <div className="wrap">
            <div className="spage-head">
              <div>
                <p className="spage-eyebrow mono">Sample briefing</p>
                <h2>Latest from all 7 desks</h2>
              </div>
              <p className="spage-dek">
                A live snapshot of the briefing: one clear story from each desk
                below - AI, Cloud, Security, Data, Leadership, Transformation,
                and Infrastructure.
              </p>
            </div>

            {withStories.length > 0 ? (
              <ol className="nl-desk-list">
                {desks.map(({ topic, article }, index) => {
                  if (!article) {
                    return (
                      <li
                        key={topic.slug}
                        className="nl-desk-item nl-desk-item--empty"
                      >
                        <div className="nl-desk-index mono">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="nl-desk-copy">
                          <span className="nl-desk-topic mono">
                            {topic.cardKicker ?? topic.kicker}
                          </span>
                          <h3>
                            <Link href={`/topic/${topic.slug}`}>
                              {topic.navLabel}
                            </Link>
                          </h3>
                          <p>{topic.description}</p>
                          <span className="nl-desk-meta mono">
                            Coverage coming soon
                            {" · "}
                            <Link href={`/topic/${topic.slug}`}>
                              Open desk
                            </Link>
                          </span>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={topic.slug} className="nl-desk-item">
                      <div className="nl-desk-index mono">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <Link
                        href={`/article/${article.slug}`}
                        className="nl-desk-media"
                        aria-label={article.title}
                      >
                        <CoverImage
                          src={article.cover_image_url}
                          alt={article.cover_image_alt}
                          seed={article.slug}
                          label={topic.navLabel}
                          sizes="280px"
                        />
                      </Link>
                      <div className="nl-desk-copy">
                        <span className="nl-desk-topic mono">
                          {topic.cardKicker ?? topic.kicker}
                        </span>
                        <h3>
                          <Link href={`/article/${article.slug}`}>
                            {article.title}
                          </Link>
                        </h3>
                        <p>{article.dek}</p>
                        <span className="nl-desk-meta mono">
                          {formatDate(article.published_at)}
                          {" · "}
                          {article.read_time_minutes ?? 5} min read
                          {" · "}
                          <Link href={`/topic/${topic.slug}`}>
                            {topic.navLabel}
                          </Link>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="nl-empty">
                Fresh desk stories will appear here once published.
              </p>
            )}
          </div>
        </section>

        <section className="spage-band">
          <div className="wrap spage-band-inner">
            <div>
              <p className="spage-eyebrow mono">Ready?</p>
              <h2>Get all seven desks in one email</h2>
              <p>
                From AI pilots to infrastructure uptime - The Download lands
                weekday mornings for the people who run enterprise technology.
              </p>
            </div>
            <a href="#subscribe" className="btn btn-primary">
              Subscribe free
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
