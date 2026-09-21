import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function requireSupabaseEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return name.includes("URL")
      ? "https://placeholder.supabase.co"
      : "placeholder-anon-key";
  }

  throw new Error(
    `Missing ${name}. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.`,
  );
}

/** Cookie-less anon client. Respects RLS. Safe for ISR routes like sitemap. */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    requireSupabaseEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireSupabaseEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
