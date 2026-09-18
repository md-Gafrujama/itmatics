import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Editorial standards",
  description:
    "ITmatics News editorial standards - independence, corrections, sourcing, and how we separate news from sponsored work.",
};

const STANDARDS = [
  {
    title: "Independence",
    body: "Commercial partnerships never shape our reporting or conclusions. Sponsored work is labeled clearly and kept separate from news judgment.",
  },
  {
    title: "Sourcing & attribution",
    body: "We attribute claims, name sources when possible, and note when information comes from briefings, filings, or on-background conversations.",
  },
  {
    title: "Corrections",
    body: "When we get something wrong, we correct it promptly and visibly. Substantive corrections are noted on the article.",
  },
  {
    title: "Conflicts of interest",
    body: "Writers and editors disclose relevant relationships. We do not accept payment for favorable coverage.",
  },
  {
    title: "Practical reporting",
    body: "Every story aims to answer what happened, why it matters to an enterprise, and what a leader should do next.",
  },
  {
    title: "Privacy",
    body: "We collect only what we need to deliver newsletters and respond to inquiries. Subscriber data is not sold. You can unsubscribe at any time.",
  },
];

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="spage">
        <section className="spage-hero">
          <div className="spage-hero-bg" aria-hidden />
          <div className="wrap spage-hero-inner">
            <p className="spage-eyebrow mono">Newsroom</p>
            <h1>Editorial standards</h1>
            <p className="spage-lead">
              How ITmatics News reports, corrects, and keeps commercial work
              from influencing the newsroom. Independence is the product.
            </p>
            <div className="spage-actions">
              <Link href="/contact" className="btn btn-primary">
                Contact the newsroom
              </Link>
              <Link href="/about" className="spage-text-link">
                About us
              </Link>
            </div>
          </div>
        </section>

        <section className="spage-section">
          <div className="wrap spage-prose-wide">
            <p className="spage-intro">
              ITmatics News is an independent publication for enterprise
              technology leaders, published by Quore B2B Marketing. Our
              commercial partnerships support the business - they do not
              dictate coverage.
            </p>
          </div>
        </section>

        <section className="spage-section spage-section--soft">
          <div className="wrap">
            <div className="spage-head">
              <div>
                <p className="spage-eyebrow mono">Our principles</p>
                <h2>How we work</h2>
              </div>
            </div>
            <div className="spage-principle-grid">
              {STANDARDS.map((item) => (
                <article key={item.title} className="spage-principle">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="spage-section">
          <div className="wrap spage-two">
            <div>
              <p className="spage-eyebrow mono">Corrections</p>
              <h2>Report an error</h2>
              <p className="spage-copy">
                Found something that needs fixing? Email the newsroom with the
                article URL, what is wrong, and any source we should check.
              </p>
              <a
                className="spage-mail"
                href="mailto:editorial@itmaticsnews.com"
              >
                editorial@itmaticsnews.com
              </a>
            </div>
            <div>
              <p className="spage-eyebrow mono">Legal</p>
              <h2>Privacy &amp; terms</h2>
              <p className="spage-copy">
                How we handle subscriber data and the rules for using
                ITmatics News.
              </p>
              <p className="spage-actions" style={{ marginTop: 16 }}>
                <Link href="/privacy" className="spage-text-link spage-text-link--ink">
                  Privacy Policy
                </Link>
                <span aria-hidden style={{ margin: "0 10px", color: "#8a94a0" }}>
                  ·
                </span>
                <Link href="/terms" className="spage-text-link spage-text-link--ink">
                  Terms of Use
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
