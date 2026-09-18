import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import UnsubscribeForm from "@/components/UnsubscribeForm";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Unsubscribe from The Download, the ITmatics News newsletter.",
  robots: { index: false, follow: false },
};

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const hasToken = Boolean(token?.trim());

  return (
    <>
      <SiteHeader />
      <main className="unsub-page">
        <div className="wrap unsub-shell">
          <aside className="unsub-intro">
            <p className="unsub-eyebrow mono">The Download</p>
            <h1>Leave the list</h1>
            <p className="unsub-lead">
              We hate to see you go. Confirm your email and tell us why - it
              helps us keep The Download useful for technology leaders.
            </p>
            <ul className="unsub-points">
              <li>Takes under a minute</li>
              <li>Stops weekday briefing emails</li>
              <li>You can resubscribe anytime</li>
            </ul>
            <Link href="/newsletters" className="unsub-stay">
              Prefer to stay? Keep The Download →
            </Link>
          </aside>

          <section className="unsub-panel" aria-label="Unsubscribe form">
            <div className="unsub-panel-head">
              <h2>Confirm unsubscribe</h2>
              <p>
                Select a reason so we know what to improve. Required fields are
                marked.
              </p>
            </div>
            <UnsubscribeForm token={hasToken ? token!.trim() : undefined} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
