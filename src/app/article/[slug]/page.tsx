import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ArticleBody from "@/components/ArticleBody";
import CoverImage from "@/components/CoverImage";
import JsonLd from "@/components/JsonLd";
import SubscribeBand from "@/components/SubscribeBand";
import SubscribePopup from "@/components/SubscribePopup";
import ArticleSidebar from "@/components/article/ArticleSidebar";
import ArticleRelated from "@/components/article/ArticleRelated";
import {
  getArticleBySlug,
  getArticlesByTopicSlug,
  getLatestArticles,
} from "@/lib/articles";
import { parseKeywordList, hydrateArticleSeo } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const seo = hydrateArticleSeo(article, article.topic?.name);
  const title = seo.metaTitle || article.title;
  const description = seo.metaDescription || article.dek;
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/article/${article.slug}`;
  const ogTitle = seo.ogTitle || article.title || title;
  const keywordList = [
    ...parseKeywordList(seo.keywords),
    seo.focusKeyword,
    article.topic?.name,
  ].filter((k, i, arr): k is string => Boolean(k) && arr.indexOf(k) === i);

  return {
    title,
    description,
    keywords: keywordList.length ? keywordList : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: "ITmatics News",
      locale: "en_US",
      type: "article",
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
      authors: [article.author_name],
      section: article.topic?.name,
      tags: keywordList.length ? keywordList : undefined,
      images: article.cover_image_url
        ? [
            {
              url: article.cover_image_url,
              alt: article.cover_image_alt || article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  };
}

function formatDateLong(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [topicArticles, latest] = await Promise.all([
    article.topic
      ? getArticlesByTopicSlug(article.topic.slug)
      : Promise.resolve([]),
    getLatestArticles(12),
  ]);

  const moreInTopic = topicArticles.filter((a) => a.id !== article.id);
  const latestOthers = latest.filter((a) => a.id !== article.id);
  // Sidebar: all same-topic stories first; fill with latest only if thin
  const sidebarStories = (
    moreInTopic.length > 0 ? moreInTopic : latestOthers
  ).slice(0, 8);
  const relatedPool = (
    moreInTopic.length > 0
      ? moreInTopic.filter((a) => !sidebarStories.some((s) => s.id === a.id))
      : latestOthers.filter((a) => !sidebarStories.some((s) => s.id === a.id))
  ).slice(0, 6);

  const siteUrl = getSiteUrl();
  const seo = hydrateArticleSeo(article, article.topic?.name);
  const topicSlug = article.topic?.slug ?? "";
  const takeaways = article.body_json.takeaways ?? [];

  return (
    <>
      <SiteHeader currentTopicSlug={topicSlug || undefined} />
      <SubscribePopup
        articleId={article.id}
        articleSlug={article.slug}
        articleTitle={article.title}
        topicId={article.topic?.id}
        topicSlug={article.topic?.slug}
        topicName={article.topic?.name}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: seo.metaDescription || article.dek,
          abstract: seo.geoSummary || article.dek,
          keywords: seo.keywords,
          image: article.cover_image_url ? [article.cover_image_url] : undefined,
          datePublished: article.published_at,
          dateModified: article.updated_at,
          author: { "@type": "Organization", name: article.author_name },
          publisher: {
            "@type": "Organization",
            name: "ITmatics News",
          },
          mainEntityOfPage: `${siteUrl}/article/${article.slug}`,
        }}
      />

      <main className="article-page">
        <div className="wrap">
          <nav className="crumbs mono" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden> / </span>
            {article.topic && (
              <>
                <Link href={`/topic/${article.topic.slug}`}>
                  {article.topic.name}
                </Link>
                <span aria-hidden> / </span>
              </>
            )}
            <span>Article</span>
          </nav>

          <div className="article-wrap">
            <article className="article">
              <header className="article-head">
                {article.topic && (
                  <Link
                    href={`/topic/${article.topic.slug}`}
                    className="article-topic mono"
                  >
                    {article.topic.name}
                  </Link>
                )}
                <h1>{article.title}</h1>
                <p className="standfirst">{article.dek}</p>

                <div className="meta">
                  <div className="av" aria-hidden>
                    {article.author_name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase() ?? "")
                      .join("")}
                  </div>
                  <div className="who">
                    <b>{article.author_name}</b>
                    <span className="byline mono">
                      {formatDateLong(article.published_at)}
                      {" · "}
                      {article.read_time_minutes ?? 5} min read
                    </span>
                  </div>
                </div>
              </header>

              <figure className="article-figure">
                <div className="lede-img">
                  <CoverImage
                    src={article.cover_image_url}
                    alt={article.cover_image_alt}
                    seed={article.slug}
                    label={article.topic?.name}
                    priority
                    sizes="(min-width: 1000px) 760px, 100vw"
                  />
                </div>
                {(article.cover_image_credit || article.cover_image_alt) && (
                  <figcaption className="mono">
                    {article.cover_image_credit
                      ? `Photo: ${article.cover_image_credit}`
                      : article.cover_image_alt}
                  </figcaption>
                )}
              </figure>

              {takeaways.length > 0 && (
                <div className="keytakeaways">
                  <h4>Key takeaways</h4>
                  <ul>
                    {takeaways.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              <ArticleBody body={article.body_json} hideTakeaways />
            </article>

            <ArticleSidebar
              topicName={article.topic?.name}
              topicSlug={article.topic?.slug}
              stories={sidebarStories}
              sameTopic={moreInTopic.length > 0}
              articleId={article.id}
              articleSlug={article.slug}
              articleTitle={article.title}
              topicId={article.topic?.id}
            />
          </div>
        </div>

        <ArticleRelated
          articles={
            relatedPool.length > 0 ? relatedPool : sidebarStories.slice(0, 3)
          }
          topicName={article.topic?.name}
          topicSlug={article.topic?.slug}
        />
      </main>

      <SubscribeBand
        source="article"
        title="Keep reading the stories behind the decisions"
        description="Reporting and analysis on AI, cloud, security, and data, written for the people who have to make the call. One email each weekday."
      />
      <SiteFooter />
    </>
  );
}
