import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function requireSupabaseEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;

  // During `next build`, Vercel may evaluate routes before env is wired in CI
  // previews. Use a inert placeholder so the module graph can compile; real
  // requests still fail clearly when env is missing at runtime.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return name.includes("URL")
      ? "https://placeholder.supabase.co"
      : "placeholder-service-role-key";
  }

  throw new Error(
    `Missing ${name}. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.`,
  );
}

// Service-role client - bypasses RLS. Only for trusted server code that
// runs without a user session (the cron generation route). Never import
// this from a Server Component/Action that handles a user request.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    requireSupabaseEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireSupabaseEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
