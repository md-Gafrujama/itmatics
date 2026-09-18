import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncHrTopicsToDb } from "@/lib/sync-topics";
import { HR_TOPICS } from "@/lib/topic-config";

export const dynamic = "force-dynamic";

/**
 * Bootstrap the CMS: sync navbar topics from topic-config and optionally
 * create an admin auth user. Protected by CRON_SECRET.
 *
 * POST /api/admin/bootstrap
 * Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const steps: string[] = [];

  // Check tables exist
  const { error: tableCheck } = await supabase.from("topics").select("id").limit(1);
  if (tableCheck?.message?.includes("does not exist") || tableCheck?.code === "42P01") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Database tables missing. Run supabase/schema.sql in Supabase SQL Editor first.",
      },
      { status: 500 },
    );
  }

  const topicResults = await syncHrTopicsToDb(supabase);
  steps.push(`Synced ${topicResults.length} IT navbar topics`);

  let adminUser: { id: string; email: string; created: boolean } | null = null;
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (email && password) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );

    if (found) {
      await supabase
        .from("admin_users")
        .upsert({ user_id: found.id }, { onConflict: "user_id" });
      adminUser = { id: found.id, email, created: false };
      steps.push(`Admin user already exists: ${email}`);
    } else {
      const { data: created, error: createErr } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
      if (createErr || !created.user) {
        steps.push(`Admin user create failed: ${createErr?.message ?? "unknown"}`);
      } else {
        await supabase
          .from("admin_users")
          .upsert({ user_id: created.user.id }, { onConflict: "user_id" });
        adminUser = { id: created.user.id, email, created: true };
        steps.push(`Created admin user: ${email}`);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    steps,
    topics: topicResults,
    navbar: HR_TOPICS.map((t) => ({ slug: t.slug, label: t.navLabel })),
    admin: adminUser,
    loginUrl: "/admin/login",
  });
}
