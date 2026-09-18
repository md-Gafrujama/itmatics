/**
 * Push .env.local keys to Vercel (production + preview + development).
 *
 * Prerequisites:
 *   npx vercel login
 *   npx vercel link   (link this folder to the Vercel project)
 *
 * Usage:
 *   node scripts/push-vercel-env.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(process.cwd());
const ENV_FILE = resolve(ROOT, ".env.local");

const KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANTHROPIC_API_KEY",
  "PEXELS_API_KEY",
  "CRON_SECRET",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
];

const TARGETS = ["production", "preview", "development"];

function loadEnvLocal() {
  if (!existsSync(ENV_FILE)) {
    throw new Error("Missing .env.local");
  }
  const map = new Map();
  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
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
    map.set(key, val);
  }
  return map;
}

function runVercel(args, input) {
  const res = spawnSync("npx", ["--yes", "vercel@latest", ...args], {
    cwd: ROOT,
    input,
    encoding: "utf8",
    shell: true,
  });
  return res;
}

function main() {
  const env = loadEnvLocal();
  const missing = KEYS.filter((k) => !env.get(k));
  if (missing.length) {
    console.error("Missing keys in .env.local:", missing.join(", "));
    process.exit(1);
  }

  // Force canonical site URL for production deploys.
  env.set("NEXT_PUBLIC_SITE_URL", "https://itmaticsnews.com");

  console.log("Pushing env vars to Vercel for:", TARGETS.join(", "));
  console.log("Site URL:", env.get("NEXT_PUBLIC_SITE_URL"));

  for (const key of KEYS) {
    const value = env.get(key) ?? "";
    for (const target of TARGETS) {
      // Remove existing value (ignore errors if not present), then add.
      spawnSync(
        "npx",
        ["--yes", "vercel@latest", "env", "rm", key, target, "-y"],
        { cwd: ROOT, encoding: "utf8", shell: true, stdio: "ignore" },
      );

      const add = runVercel(["env", "add", key, target], `${value}\n`);
      if (add.status !== 0) {
        console.error(
          `Failed ${key} → ${target}:`,
          (add.stderr || add.stdout || "").slice(0, 400),
        );
        process.exit(1);
      }
      console.log(`  ✓ ${key} (${target})`);
    }
  }

  console.log("\nDone. Redeploy on Vercel for env changes to apply.");
}

main();
