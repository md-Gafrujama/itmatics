"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import CoverImage from "@/components/CoverImage";
import { SUBSCRIBED_KEY, submitSubscribe } from "@/lib/subscribe-client";
import type { ArticleWithTopic } from "@/types/database";

export default function ArticleSidebar({
  topicName,
  topicSlug,
  stories,
  sameTopic = true,
  articleId,
  articleSlug,
  articleTitle,
  topicId,
}: {
  topicName?: string;
  topicSlug?: string;
  stories?: ArticleWithTopic[];
  sameTopic?: boolean;
  articleId?: string;
  articleSlug?: string;
  articleTitle?: string;
  topicId?: string;
}) {
  const related = stories ?? [];
  const heading =
    sameTopic && topicName ? `More in ${topicName}` : "Latest stories";
  const emailId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = inputRef.current?.value.trim() ?? "";
    if (!email) return;
    setError("");
    setPending(true);
    try {
      await submitSubscribe({
        email,
        source: "article-sidebar",
        articleId,
        articleSlug,
        articleTitle,
        topicId,
        topicSlug,
        topicName,
      });
      try {
        window.localStorage.setItem(SUBSCRIBED_KEY, "1");
      } catch {
        // ignore
      }
      setDone(true);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not subscribe");
    } finally {
      setPending(false);
    }
  }

  return (
    <aside className="art-rail" aria-label={heading}>
      <div className="art-rail-block">
        <div className="art-rail-head">
          <h2>{heading}</h2>
          {topicSlug && sameTopic && (
            <Link href={`/topic/${topicSlug}`} className="art-rail-all">
              View all
            </Link>
          )}
        </div>

        {related.length > 0 ? (
          <ul className="art-rail-list">
            {related.map((story) => (
              <li key={story.id}>
                <Link
                  href={`/article/${story.slug}`}
                  className="art-rail-item"
                >
                  <span className="art-rail-thumb" aria-hidden>
                    <CoverImage
                      src={story.cover_image_url}
                      alt=""
                      seed={story.slug}
                      label={story.topic?.name}
                      sizes="96px"
                    />
                  </span>
                  <span className="art-rail-copy">
                    <span className="art-rail-meta mono">
                      {story.read_time_minutes ?? 5} min read
                    </span>
                    <span className="art-rail-title">{story.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="art-rail-empty">
            More coverage is on the way. Check back soon.
          </p>
        )}
      </div>

      <div className="art-rail-sub">
        <p className="art-rail-sub-kicker mono">The Download</p>
        <h3>Subscribe now</h3>
        <p>
          Enterprise IT in five minutes - AI, cloud, security, and data for
          technology leaders.
        </p>

        {done ? (
          <p className="art-rail-sub-done" aria-live="polite">
            You’re subscribed. Check your inbox.
          </p>
        ) : (
          <form className="art-rail-sub-form" onSubmit={onSubmit} data-no-loader>
            <label htmlFor={emailId} className="sr-only">
              Work email
            </label>
            <input
              ref={inputRef}
              id={emailId}
              type="email"
              name="email"
              placeholder="Work email"
              required
              autoComplete="email"
              disabled={pending}
            />
            <button
              type="submit"
              className="btn btn-primary art-rail-sub-btn"
              disabled={pending}
            >
              {pending ? "Saving…" : "Subscribe now"}
            </button>
            {error ? (
              <p className="art-rail-sub-error">{error}</p>
            ) : (
              <p className="art-rail-sub-note mono">Free. Unsubscribe anytime.</p>
            )}
          </form>
        )}
      </div>
    </aside>
  );
}
