import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getSitemapEntries } from "@/lib/sitemap";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Sitemap",
  description: "All public pages on ITmatics News.",
  robots: { index: true, follow: true },
};

export default async function HtmlSitemapPage() {
  const entries = await getSitemapEntries();

  return (
    <>
      <SiteHeader />
      <main className="wrap" style={{ padding: "48px 0 72px", maxWidth: 720 }}>
        <p className="k mono">Company</p>
        <h1 style={{ marginTop: 8 }}>Sitemap</h1>
        <p style={{ opacity: 0.75, marginBottom: 28 }}>
          Full list of public pages. XML feed:{" "}
          <Link href="/sitemap.xml">/sitemap.xml</Link>
        </p>
        <ul style={{ lineHeight: 1.9, paddingLeft: 18 }}>
          {entries.map((e) => {
            const path = e.url.replace(/^https?:\/\/[^/]+/, "") || "/";
            return (
              <li key={e.url}>
                <Link href={path}>{path === "/" ? "Home" : path}</Link>
              </li>
            );
          })}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
