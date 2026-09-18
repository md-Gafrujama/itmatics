/**
 * Apply supabase/schema.sql via Supabase Management API.
 * Requires a personal access token with access to the project in .env.local:
 *   https://supabase.com/dashboard/account/tokens
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run db:schema
 *
 * If the token cannot access the project, open the SQL Editor and paste
 * supabase/schema.sql instead (one-time).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  try {
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
  } catch {
    // optional
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const token = process.env.SUPABASE_ACCESS_TOKEN ?? "";
const ref = url.match(/https?:\/\/([^.]+)\.supabase\.co/i)?.[1];

if (!ref) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}

if (!token) {
  console.error(`
No SUPABASE_ACCESS_TOKEN set.

Easiest fix (one-time):
  1. Open https://supabase.com/dashboard/project/${ref}/sql/new
  2. Paste the contents of supabase/schema.sql
  3. Click Run
  4. Then: npm run bootstrap

Or create a personal access token at:
  https://supabase.com/dashboard/account/tokens
then:
  SUPABASE_ACCESS_TOKEN=sbp_... npm run db:schema
`);
  process.exit(1);
}

const sql = readFileSync(resolve(process.cwd(), "supabase/schema.sql"), "utf8");

const res = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  },
);

const text = await res.text();
if (!res.ok) {
  console.error(`Schema apply failed (${res.status}):`, text.slice(0, 500));
  console.error(`\nFallback: paste supabase/schema.sql in\n  https://supabase.com/dashboard/project/${ref}/sql/new`);
  process.exit(1);
}

console.log("✓ schema.sql applied to", ref);
console.log("Next: npm run bootstrap");
