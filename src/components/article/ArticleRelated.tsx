import Link from "next/link";
import CoverImage from "@/components/CoverImage";
import type { ArticleWithTopic } from "@/types/database";

export default function ArticleRelated({
  articles,
  topicName,
  topicSlug,
}: {
  articles: ArticleWithTopic[];
  topicName?: string;
  topicSlug?: string;
}) {
  if (articles.length === 0) return null;

  return (
    <section className="art-related" aria-label="Related articles">
      <div className="wrap">
        <header className="art-related-head">
          <div>
            <p className="art-related-kicker mono">Related</p>
            <h2>
              {topicName ? `More ${topicName} coverage` : "Keep reading"}
            </h2>
          </div>
          {topicSlug ? (
            <Link href={`/topic/${topicSlug}`} className="art-related-more">
              All in {topicName} →
            </Link>
          ) : (
            <Link href="/" className="art-related-more">
              All stories →
            </Link>
          )}
        </header>

        <div className="art-related-list">
          {articles.map((article) => (
            <article key={article.id} className="art-related-item">
              <Link
                href={`/article/${article.slug}`}
                className="art-related-media"
                aria-label={article.title}
              >
                <CoverImage
                  src={article.cover_image_url}
                  alt={article.cover_image_alt}
                  seed={article.slug}
                  label={article.topic?.name}
                  sizes="280px"
                />
              </Link>
              <div className="art-related-copy">
                <span className="art-related-meta mono">
                  {article.topic?.name ?? "News"}
                  {" · "}
                  {article.read_time_minutes ?? 5} min
                </span>
                <h3>
                  <Link href={`/article/${article.slug}`}>{article.title}</Link>
                </h3>
                <p>{article.dek}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
