/**
 * Generate AI articles per IT news topic via the cron API.
 * Requires: npm run dev (or next start) and CRON_SECRET in .env.local
 *
 * Usage:
 *   npm run generate:topics
 *   npm run generate:topics -- cloud security
 *   PER_TOPIC=2 npm run generate:topics
 *   GENERATE_BASE_URL=http://localhost:3000 PER_TOPIC=2 npm run generate:topics
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Agent, setGlobalDispatcher } from "undici";

// Article generation can take 5-10+ minutes (research + write + Pexels).
setGlobalDispatcher(
  new Agent({
    headersTimeout: 15 * 60 * 1000,
    bodyTimeout: 15 * 60 * 1000,
    connectTimeout: 60 * 1000,
  }),
);

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split("\n")) {
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

/** Keep in sync with src/lib/topic-config.ts IT_TOPICS */
const DEFAULT_TOPICS = [
  "artificial-intelligence",
  "cloud",
  "security",
  "data-analytics",
  "it-leadership",
  "digital-transformation",
  "infrastructure",
];

const TOPICS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : DEFAULT_TOPICS;

loadEnv();

const PER_TOPIC = Math.max(1, Number(process.env.PER_TOPIC || "1") || 1);

const BASE =
  process.env.GENERATE_BASE_URL ||
  "http://localhost:3000";

const secret = process.env.CRON_SECRET;
if (!secret) {
  console.error("Missing CRON_SECRET in .env.local");
  process.exit(1);
}

async function generateForTopic(slug) {
  const url = `${BASE.replace(/\/$/, "")}/api/cron/generate-article`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ topic_slug: slug }),
  });
  const data = await res.json().catch(() => ({}));
  return { slug, status: res.status, data };
}

async function main() {
  console.log(
    `ITmatics News generate - ${TOPICS.length} topics × ${PER_TOPIC} via ${BASE}\n`,
  );
  let ok = 0;
  let failed = 0;

  for (const slug of TOPICS) {
    for (let n = 1; n <= PER_TOPIC; n++) {
      console.log(`→ ${slug} [${n}/${PER_TOPIC}] (1-10 min)...`);
      try {
        const result = await generateForTopic(slug);
        if (
          result.status >= 200 &&
          result.status < 300 &&
          result.data?.ok !== false
        ) {
          const created = result.data.articles ?? result.data.created ?? [];
          for (const row of created) {
            console.log(`  ✓ ${row.topic}: /article/${row.slug}`);
          }
          if (created.length === 0) {
            console.log("  ✓ done (no new rows in response)");
          }
          ok += 1;
        } else {
          console.error(
            `  ✗ failed (${result.status}):`,
            result.data?.error ?? result.data,
          );
          failed += 1;
        }
      } catch (err) {
        console.error(`  ✗ failed:`, err instanceof Error ? err.message : err);
        failed += 1;
      }
      console.log("");
    }
  }

  console.log(`Finished. ok=${ok} failed=${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
