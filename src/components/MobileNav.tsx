"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getNavTopics } from "@/lib/topic-config";

export default function MobileNav({
  currentTopicSlug,
}: {
  currentTopicSlug?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navTopics = getNavTopics();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const panel = open && mounted
    ? createPortal(
        <div className="mnav-root" role="dialog" aria-modal="true" aria-label="Site menu">
          <button
            type="button"
            className="mnav-backdrop"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="mnav-panel">
            <div className="mnav-panel-head">
              <span className="mnav-panel-title">Browse</span>
              <button
                type="button"
                className="mnav-close"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav className="mnav-links">
              <Link href="/" className="mnav-link" onClick={() => setOpen(false)}>
                Home
              </Link>
              {navTopics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/topic/${topic.slug}`}
                  className={`mnav-link${
                    currentTopicSlug === topic.slug ? " active" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {topic.navLabel}
                </Link>
              ))}
              <Link
                href="/resources"
                className="mnav-link"
                onClick={() => setOpen(false)}
              >
                Resources
              </Link>
              <Link
                href="/about"
                className="mnav-link"
                onClick={() => setOpen(false)}
              >
                About
              </Link>
              <Link
                href="/advertise"
                className="mnav-link"
                onClick={() => setOpen(false)}
              >
                Advertise
              </Link>
              <Link
                href="/contact"
                className="mnav-link"
                onClick={() => setOpen(false)}
              >
                Contact
              </Link>
            </nav>
            <Link
              href="/newsletters"
              className="mnav-cta"
              onClick={() => setOpen(false)}
            >
              Subscribe
            </Link>
          </aside>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className={`icon-btn hamburger${open ? " is-open" : ""}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" />
          )}
        </svg>
      </button>
      {panel}
    </div>
  );
}
