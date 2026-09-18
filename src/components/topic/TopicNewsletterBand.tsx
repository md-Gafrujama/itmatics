import type { Topic } from "@/types/database";
import type { TopicConfig } from "@/lib/topic-config";

export default function TopicNewsletterBand({
  topic,
  config,
}: {
  topic: Topic;
  config: TopicConfig;
}) {
  return (
    <section className="news" id="topicNews">
      <div className="wrap news-grid">
        <div className="news-copy">
          <span className="kicker k-forest">Free newsletter</span>
          <h2 style={{ marginTop: 10 }}>
            Get the {config.edition} edition
          </h2>
          <p>
            The stories on this page, distilled into one email for IT leaders.
            Free, every week.
          </p>
          <div className="news-editions">
            <span className="chip">Daily Brief</span>
            <span className="chip">{config.edition}</span>
          </div>
        </div>
        <div>
          <form
            className="news-form js-fake-subscribe"
            data-source="topic"
            data-topic-id={topic.id}
            data-topic-slug={topic.slug}
            data-topic-name={topic.name}
          >
            <input
              type="email"
              name="email"
              placeholder="Your work email"
              aria-label="Work email"
              required
            />
            <button className="btn-sub" type="submit">
              Subscribe
            </button>
          </form>
          <p className="news-note">
            Unsubscribe anytime. We treat your data under a documented consent
            and outreach model.
          </p>
        </div>
      </div>
    </section>
  );
}
