/**
 * Write a static public/sitemap.xml for Google Search Console.
 * Dynamic Next rewrites/routes often show GSC "Couldn't fetch" even when curl works.
 *
 * Usage: node scripts/generate-sitemap.mjs
 * Runs automatically before `next build`.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, "public", "sitemap.xml");
const SITE = "https://www.itmaticsnews.com";

const TOPIC_SLUGS = [
  "artificial-intelligence",
  "cloud",
  "security",
  "data-analytics",
  "it-leadership",
  "digital-transformation",
  "infrastructure",
];
const TOPIC_SET = new Set(TOPIC_SLUGS);

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(ROOT, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function abs(path) {
  return `${SITE}${path.startsWith("/") ? path : `/${path}`}`;
}

function cleanImage(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return url.split("#")[0].split("?")[0] || null;
}

function topicSlugOf(row) {
  const t = row.topic;
  if (!t) return null;
  if (Array.isArray(t)) return t[0]?.slug ?? null;
  return t.slug ?? null;
}

async function loadArticles() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    console.warn("[sitemap] Missing Supabase env — writing static pages only");
    return [];
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("articles")
    .select("slug, updated_at, published_at, cover_image_url, topic:topics(slug)")
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", nowIso)
    .order("published_at", { ascending: false });

  if (error) {
    console.warn("[sitemap] Supabase error:", error.message);
    return [];
  }

  return (data ?? []).filter((a) => {
    const slug = topicSlugOf(a);
    return Boolean(slug && TOPIC_SET.has(slug) && a.slug);
  });
}

function render(entries) {
  const hasImages = entries.some((e) => e.image);
  const imageNs = hasImages
    ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : "";
  const body = entries
    .map((e) => {
      let xml = `<url><loc>${escapeXml(e.loc)}</loc>`;
      if (e.lastmod) xml += `<lastmod>${escapeXml(e.lastmod)}</lastmod>`;
      if (e.changefreq) xml += `<changefreq>${e.changefreq}</changefreq>`;
      if (e.priority != null) xml += `<priority>${e.priority}</priority>`;
      if (e.image) {
        xml += `<image:image><image:loc>${escapeXml(e.image)}</image:loc></image:image>`;
      }
      xml += `</url>`;
      return xml;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNs}>${body}</urlset>\n`;
}

async function main() {
  loadEnv();
  const articles = await loadArticles();
  const newest =
    articles[0]?.updated_at || articles[0]?.published_at || new Date().toISOString();
  const now = new Date().toISOString();

  const staticPaths = [
    ["/", "hourly", 1, newest],
    ["/about", "monthly", 0.5, now],
    ["/advertise", "monthly", 0.5, now],
    ["/editorial-standards", "monthly", 0.4, now],
    ["/privacy", "yearly", 0.3, now],
    ["/terms", "yearly", 0.3, now],
    ["/newsletters", "monthly", 0.6, now],
    ["/contact", "monthly", 0.5, now],
    ["/resources", "weekly", 0.6, now],
  ];

  const entries = [
    ...staticPaths.map(([path, changefreq, priority, lastmod]) => ({
      loc: abs(path),
      lastmod,
      changefreq,
      priority,
    })),
    ...TOPIC_SLUGS.map((slug) => ({
      loc: abs(`/topic/${slug}`),
      lastmod: newest,
      changefreq: "daily",
      priority: 0.8,
    })),
    ...articles.map((a) => {
      const publishedAt = a.published_at;
      const age = publishedAt
        ? Date.now() - new Date(publishedAt).getTime()
        : Infinity;
      const fresh = age < 1000 * 60 * 60 * 24 * 3;
      return {
        loc: abs(`/article/${a.slug}`),
        lastmod: a.updated_at || a.published_at || newest,
        changefreq: fresh ? "daily" : "weekly",
        priority: fresh ? 0.9 : 0.7,
        image: cleanImage(a.cover_image_url),
      };
    }),
  ];

  mkdirSync(resolve(ROOT, "public"), { recursive: true });
  writeFileSync(OUT, render(entries), "utf8");
  console.log(`[sitemap] Wrote ${entries.length} URLs → public/sitemap.xml`);
}

main().catch((err) => {
  console.error("[sitemap] Fatal:", err);
  process.exit(1);
});
