/**
 * One-time CMS bootstrap:
 * 1. Verifies Supabase connection
 * 2. Syncs IT navbar topics from topic-config
 * 3. Creates admin login user (ADMIN_EMAIL / ADMIN_PASSWORD in .env.local)
 *
 * Usage: npm run bootstrap
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
const IT_TOPICS = [
  {
    slug: "artificial-intelligence",
    navLabel: "Artificial Intelligence",
    description:
      "From pilots to production: adoption, governance, and the operating models that make AI stick in the enterprise.",
  },
  {
    slug: "cloud",
    navLabel: "Cloud",
    description:
      "Hybrid strategy, sovereign regions, and the economics of running modern workloads.",
  },
  {
    slug: "security",
    navLabel: "Security",
    description:
      "Identity, resilience, and the threat landscape facing enterprise security leaders.",
  },
  {
    slug: "data-analytics",
    navLabel: "Data & Analytics",
    description:
      "Platforms, governance, and turning data investment into decisions people trust.",
  },
  {
    slug: "it-leadership",
    navLabel: "IT Leadership",
    description:
      "Strategy, operating models, and the decisions CIOs and IT directors face every quarter.",
  },
  {
    slug: "digital-transformation",
    navLabel: "Digital Transformation",
    description:
      "How enterprises actually change: sequencing, product operating models, and what sticks.",
  },
  {
    slug: "infrastructure",
    navLabel: "Infrastructure",
    description:
      "Platforms, networking, and the boring systems that keep modern IT running.",
  },
];

/** Legacy HR slugs - soft-hide by renaming; articles stay but won't match IT nav */
const LEGACY_HR_SLUGS = [
  "compliance",
  "talent",
  "rewards",
  "analytics",
  "culture",
  "playbooks",
];

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log("ITmatics News bootstrap\n");

  const { error: ping } = await supabase.from("topics").select("id").limit(1);
  if (ping) {
    const grantsHint = ping.message?.includes("permission denied")
      ? "\n\nRun supabase/fix-grants.sql in Supabase SQL Editor (one-time grants fix)."
      : "";
    console.error(
      "Database not ready:",
      ping.message,
      `\n\nRun supabase/schema.sql once in the SQL Editor:\n  https://supabase.com/dashboard/project/${url.replace(/^https?:\/\//, "").split(".")[0]}/sql/new\nThen re-run: npm run bootstrap`,
      grantsHint,
    );
    process.exit(1);
  }

  console.log("✓ Connected to Supabase");

  for (const topic of IT_TOPICS) {
    const { data: existing } = await supabase
      .from("topics")
      .select("id")
      .eq("slug", topic.slug)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("topics")
        .update({ name: topic.navLabel, description: topic.description })
        .eq("id", existing.id);
      if (error) throw error;
      console.log(`  updated topic: ${topic.navLabel}`);
    } else {
      const { error } = await supabase.from("topics").insert({
        slug: topic.slug,
        name: topic.navLabel,
        description: topic.description,
      });
      if (error) throw error;
      console.log(`  inserted topic: ${topic.navLabel}`);
    }
  }

  console.log(`✓ Synced ${IT_TOPICS.length} IT navbar topics`);

  for (const slug of LEGACY_HR_SLUGS) {
    const { data: row } = await supabase
      .from("topics")
      .select("id, name")
      .eq("slug", slug)
      .maybeSingle();
    if (!row) continue;
    const archivedSlug = `archived-${slug}`;
    const { data: clash } = await supabase
      .from("topics")
      .select("id")
      .eq("slug", archivedSlug)
      .maybeSingle();
    if (clash) {
      console.log(`  skip archive ${slug} (already have ${archivedSlug})`);
      continue;
    }
    const { error } = await supabase
      .from("topics")
      .update({
        slug: archivedSlug,
        name: `[Archived] ${row.name}`,
        description: "Legacy HR topic - not used by ITmatics News nav.",
      })
      .eq("id", row.id);
    if (error) {
      console.warn(`  could not archive ${slug}:`, error.message);
    } else {
      console.log(`  archived legacy topic: ${slug} → ${archivedSlug}`);
    }
  }

  if (adminEmail && adminPassword) {
    const { data: list } = await supabase.auth.admin.listUsers();
    const found = list?.users?.find(
      (u) => u.email?.toLowerCase() === adminEmail.toLowerCase(),
    );

    let userId = found?.id;
    if (!userId) {
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });
      if (error) throw error;
      userId = created.user.id;
      console.log(`✓ Created admin user: ${adminEmail}`);
    } else {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: adminPassword,
        email_confirm: true,
      });
      if (error) throw error;
      console.log(`✓ Admin password refreshed: ${adminEmail}`);
    }

    const { error: adminErr } = await supabase
      .from("admin_users")
      .upsert({ user_id: userId }, { onConflict: "user_id" });
    if (adminErr) throw adminErr;
    console.log("✓ Admin access granted → /admin/login");
  } else {
    console.log(
      "⊘ Skipped admin user (set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local)",
    );
  }

  console.log("\nDone. Generate articles with:");
  console.log(
    '  curl -X POST http://localhost:3000/api/cron/generate-article -H "Authorization: Bearer <CRON_SECRET>" -H "Content-Type: application/json" -d "{\\"topic_slug\\":\\"artificial-intelligence\\"}"',
  );
  console.log("  or: npm run generate:topics");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
