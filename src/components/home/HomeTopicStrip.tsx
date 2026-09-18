import Link from "next/link";
import type { TopicConfig } from "@/lib/topic-config";

export default function HomeTopicStrip({ topics }: { topics: TopicConfig[] }) {
  if (topics.length === 0) return null;

  return (
    <section className="section topics-strip">
      <div className="wrap">
        <div className="sec-head">
          <h2>Explore by topic</h2>
          <span className="rule" />
        </div>
        <div className="topic-cards">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              className="topic-card"
              href={`/topic/${topic.slug}`}
            >
              <div className="k mono">
                {topic.cardKicker ?? topic.kicker.toUpperCase()}
              </div>
              <h3>{topic.navLabel}</h3>
              <p>{topic.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
