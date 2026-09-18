"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SUBSCRIBED_KEY, submitSubscribe } from "@/lib/subscribe-client";

function dismissKey(slug?: string) {
  return slug
    ? `itmatics_subpop_dismissed:${slug}`
    : "itmatics_subpop_dismissed";
}

export default function SubscribePopup({
  articleId,
  articleSlug,
  articleTitle,
  topicId,
  topicSlug,
  topicName,
}: {
  articleId?: string;
  articleSlug?: string;
  articleTitle?: string;
  topicId?: string;
  topicSlug?: string;
  topicName?: string;
}) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Open on every article view unless already subscribed (or dismissed for THIS article).
  useEffect(() => {
    setMounted(true);
    setDone(false);
    setError("");
    setOpen(false);

    try {
      // One-time: clear stale subscribe/dismiss flags from earlier tests
      if (window.localStorage.getItem("itmatics_subpop_v2") !== "1") {
        window.localStorage.removeItem(SUBSCRIBED_KEY);
        window.sessionStorage.removeItem("itmatics_subpop_dismissed");
        window.localStorage.setItem("itmatics_subpop_v2", "1");
      }
      window.sessionStorage.removeItem("itmatics_subpop_dismissed");
      if (window.localStorage.getItem(SUBSCRIBED_KEY) === "1") return;
      if (window.sessionStorage.getItem(dismissKey(articleSlug)) === "1") {
        return;
      }
    } catch {
      // private mode - still show popup
    }

    const timer = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [articleSlug]);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, articleSlug]);

  function handleClose() {
    setOpen(false);
    try {
      window.sessionStorage.setItem(dismissKey(articleSlug), "1");
    } catch {
      // ignore
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = inputRef.current?.value.trim() ?? "";
    setError("");
    setPending(true);
    try {
      await submitSubscribe({
        email,
        source: "article-popup",
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
      window.setTimeout(() => setOpen(false), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not subscribe");
    } finally {
      setPending(false);
    }
  }

  if (!mounted || !open) return null;

  return (
    <div className="subpop" role="presentation">
      <button
        type="button"
        className="subpop-backdrop"
        aria-label="Close subscribe popup"
        onClick={handleClose}
      />
      <div
        className="subpop-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="subpop-close"
          aria-label="Close"
          onClick={handleClose}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <p className="subpop-kicker mono">The Download</p>
        <h2 id={titleId}>{done ? "You’re in" : "Subscribe now"}</h2>
        <p className="subpop-copy">
          {done
            ? "Watch your inbox - the next brief is on the way."
            : "Enterprise IT in five minutes - AI, cloud, security, and data for technology leaders."}
        </p>

        {!done ? (
          <form className="subpop-form" onSubmit={onSubmit} data-no-loader>
            <label htmlFor="article-sub-email" className="sr-only">
              Work email
            </label>
            <input
              ref={inputRef}
              id="article-sub-email"
              type="email"
              name="email"
              placeholder="Work email"
              required
              autoComplete="email"
              disabled={pending}
            />
            <button type="submit" className="subpop-btn" disabled={pending}>
              {pending ? "Saving…" : "Subscribe now"}
            </button>
          </form>
        ) : (
          <div className="subpop-success" aria-live="polite">
            <span className="subpop-check" aria-hidden>✓</span>
            Subscribed
          </div>
        )}

        {error ? (
          <p className="subpop-note subpop-note--error">{error}</p>
        ) : (
          !done && <p className="subpop-note">Free. Unsubscribe anytime.</p>
        )}
      </div>
    </div>
  );
}
