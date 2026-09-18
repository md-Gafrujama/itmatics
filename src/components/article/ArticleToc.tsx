"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/article-toc";

export default function ArticleToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0, 0.25, 1],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="art-toc" aria-label="Table of contents">
      <div className="art-toc-head">
        <span className="art-toc-label">On this page</span>
        <h2>Contents</h2>
      </div>
      <ol className="art-toc-list">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={
                activeId === item.id ? "art-toc-link active" : "art-toc-link"
              }
              onClick={() => setActiveId(item.id)}
            >
              <span className="art-toc-num" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="art-toc-text">{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
