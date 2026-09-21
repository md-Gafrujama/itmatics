import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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

// Server-side Supabase client bound to the current request's cookies.
// Use inside Server Components, Server Actions, and Route Handlers.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    requireSupabaseEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireSupabaseEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component with no response to write to
            // (e.g. rendering, not a Server Action) - session refresh is
            // handled by proxy.ts instead. Safe to ignore.
          }
        },
      },
    },
  );
}
