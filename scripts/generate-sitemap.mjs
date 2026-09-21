/**
 * Build-time static public/sitemap.xml + public/robots.txt
 * No request-time DB — instant 200 for Google's sitemap fetcher.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
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
  if (path === "/" || path === "") return SITE;
  return `${SITE}${path.startsWith("/") ? path : `/${path}`}`;
}

function toLastmod(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
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
  if (!url || !key) return [];
  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("articles")
      .select("slug, updated_at, published_at, topic:topics(slug)")
      .eq("status", "published")
      .not("published_at", "is", null)
      .lte("published_at", nowIso)
      .order("published_at", { ascending: false });
    if (error) return [];
    return (data ?? []).filter((a) => {
      const slug = topicSlugOf(a);
      return Boolean(slug && TOPIC_SET.has(slug) && a.slug);
    });
  } catch {
    return [];
  }
}

function renderXml(entries) {
  const body = entries
    .map((e) => {
      const priority =
        typeof e.priority === "number" ? e.priority.toFixed(1) : e.priority;
      return `<url><loc>${escapeXml(e.loc)}</loc><lastmod>${escapeXml(e.lastmod)}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${priority}</priority></url>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>\n`;
}

async function main() {
  loadEnv();
  const articles = await loadArticles();
  const newest = toLastmod(
    articles[0]?.updated_at || articles[0]?.published_at || new Date(),
  );

  const entries = [
    { loc: abs("/"), lastmod: newest, changefreq: "daily", priority: 1 },
    { loc: abs("/about"), lastmod: newest, changefreq: "monthly", priority: 0.5 },
    {
      loc: abs("/advertise"),
      lastmod: newest,
      changefreq: "monthly",
      priority: 0.5,
    },
    {
      loc: abs("/editorial-standards"),
      lastmod: newest,
      changefreq: "monthly",
      priority: 0.4,
    },
    { loc: abs("/privacy"), lastmod: newest, changefreq: "yearly", priority: 0.3 },
    { loc: abs("/terms"), lastmod: newest, changefreq: "yearly", priority: 0.3 },
    {
      loc: abs("/newsletters"),
      lastmod: newest,
      changefreq: "monthly",
      priority: 0.6,
    },
    { loc: abs("/contact"), lastmod: newest, changefreq: "monthly", priority: 0.5 },
    {
      loc: abs("/resources"),
      lastmod: newest,
      changefreq: "weekly",
      priority: 0.6,
    },
    ...TOPIC_SLUGS.map((slug) => ({
      loc: abs(`/topic/${slug}`),
      lastmod: newest,
      changefreq: "daily",
      priority: 0.8,
    })),
    ...articles.map((a) => {
      const age = a.published_at
        ? Date.now() - new Date(a.published_at).getTime()
        : Infinity;
      const fresh = age < 1000 * 60 * 60 * 24 * 7;
      return {
        loc: abs(`/article/${a.slug}`),
        lastmod: toLastmod(a.updated_at || a.published_at || newest),
        changefreq: fresh ? "daily" : "weekly",
        priority: fresh ? 0.9 : 0.7,
      };
    }),
  ];

  const publicDir = resolve(ROOT, "public");
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(resolve(publicDir, "sitemap.xml"), renderXml(entries), "utf8");
  writeFileSync(
    resolve(publicDir, "robots.txt"),
    `User-Agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /unsubscribe\n\nHost: www.itmaticsnews.com\nSitemap: ${SITE}/sitemap.xml\n`,
    "utf8",
  );
  console.log(`[sitemap] ${entries.length} URLs → public/sitemap.xml`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
