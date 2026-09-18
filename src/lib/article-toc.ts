import { normalizeDashes } from "@/lib/text";
import type { ArticleBody } from "@/types/database";

export type TocItem = {
  id: string;
  label: string;
};

function slugifyHeading(text: string, index: number): string {
  const base = normalizeDashes(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
  return base || `section-${index + 1}`;
}

/** Build unique TOC anchors from article body headings (+ takeaways). */
export function getArticleToc(body: ArticleBody): TocItem[] {
  const used = new Set<string>();
  const items: TocItem[] = [];

  body.sections.forEach((section, i) => {
    const heading = section.heading?.trim();
    if (!heading) return;
    let id = slugifyHeading(heading, i);
    if (used.has(id)) id = `${id}-${i + 1}`;
    used.add(id);
    items.push({ id, label: normalizeDashes(heading) });
  });

  if (body.takeaways && body.takeaways.length > 0) {
    let id = "key-takeaways";
    if (used.has(id)) id = "key-takeaways-end";
    used.add(id);
    items.push({ id, label: "Key takeaways" });
  }

  return items;
}
