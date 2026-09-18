import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Resource Library - ITmatics News",
  description:
    "Whitepapers, research reports, and webinars for CIOs, CISOs, and enterprise IT leaders. Free with registration.",
};

const RESOURCES = [
  {
    type: "Whitepaper",
    title: "A practical guide to enterprise AI governance",
    dek: "How IT leaders sequence policy, model risk controls, and operating models before agents hit production.",
    spon: "ITmatics News Research",
  },
  {
    type: "Report",
    title: "2026 CIO priorities benchmark",
    dek: "Where technology leaders are allocating budget across cloud, security, data, and AI this year.",
    spon: "ITmatics News Research",
  },
  {
    type: "Webinar",
    title: "FinOps after the repatriation wave",
    dek: "On-demand session on hybrid cost control, sovereign regions, and when to bring workloads back.",
    spon: "On demand · 45 min",
  },
  {
    type: "Infographic",
    title: "The state of zero-trust identity",
    dek: "Key data points on identity sprawl, agentic access, and resilience investments.",
    spon: "ITmatics News Research",
  },
  {
    type: "Report",
    title: "Data platform benchmarks: lakehouse to decisions",
    dek: "How analytics teams are restructuring platforms, governance, and time-to-insight SLAs.",
    spon: "ITmatics News Research",
  },
  {
    type: "Whitepaper",
    title: "A practical framework for IT operating models",
    dek: "What a product-aligned IT organization looks like - and how to migrate without a big-bang rewrite.",
    spon: "ITmatics News Research",
  },
] as const;

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="spage">
        <section className="spage-hero">
          <div className="spage-hero-bg" aria-hidden />
          <div className="wrap spage-hero-inner">
            <p className="spage-eyebrow mono">Resource library</p>
            <h1>Research, guides &amp; tools for IT leaders</h1>
            <p className="spage-lead">
              Reports and on-demand sessions from the ITmatics News studio -
              free with a quick registration.
            </p>
            <div className="spage-actions">
              <Link href="/newsletters" className="btn btn-primary">
                Subscribe free
              </Link>
            </div>
          </div>
        </section>

        <section className="spage-section">
          <div className="wrap">
            <div className="spage-offer-grid">
              {RESOURCES.map((item) => (
                <article key={item.title} className="spage-offer">
                  <span className="mono">{item.type}</span>
                  <h3>{item.title}</h3>
                  <p>{item.dek}</p>
                  <p style={{ marginTop: 12, fontSize: 12.5, color: "#8a94a0" }}>
                    {item.spon}
                  </p>
                  <Link
                    href="/newsletters"
                    className="spage-text-link spage-text-link--ink"
                    style={{ marginTop: 14, alignSelf: "flex-start" }}
                  >
                    Unlock free
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
