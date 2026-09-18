import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Advertise",
  description:
    "Advertise with ITmatics News - reach CIOs, CISOs, and enterprise IT leaders through newsletter placements, custom research, and demand programs.",
};

const OFFERS = [
  {
    num: "01",
    title: "Newsletter placements",
    body: "Native placements in The Download and topic briefings. Sold by share of voice - not empty impressions.",
  },
  {
    num: "02",
    title: "Custom research & content",
    body: "Reports, buyer guides, and analysis produced to editorial standards and clearly attributed to partners.",
  },
  {
    num: "03",
    title: "Demand programs",
    body: "Syndication and lead programs backed by Quore B2B Marketing, with transparent sourcing and quality controls.",
  },
];

const WHY = [
  {
    title: "Decision-makers, not browsers",
    body: "Our audience is CIOs, CISOs, architects, and platform leaders who buy and govern enterprise technology.",
  },
  {
    title: "Context that converts",
    body: "Placements sit next to reporting people actually read - so your message arrives with credibility intact.",
  },
  {
    title: "Fewer partners, better work",
    body: "We limit commercial partners each quarter so every program gets attention and clean measurement.",
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
            <p className="spage-eyebrow mono">Advertise &amp; partner</p>
            <h1>Reach the people who run enterprise IT</h1>
            <p className="spage-lead">
              ITmatics News works with a small number of partners each quarter.
              Programs are built for genuine engagement with technology leaders -
              not vanity metrics.
            </p>
            <div className="spage-actions">
              <Link href="/contact" className="btn btn-primary">
                Request the media kit
              </Link>
              <Link href="/about" className="spage-text-link">
                About ITmatics News
              </Link>
            </div>
          </div>
        </section>

        <section className="spage-section">
          <div className="wrap">
            <div className="spage-head">
              <div>
                <p className="spage-eyebrow mono">Why partners choose us</p>
                <h2>Built for decision-makers</h2>
              </div>
            </div>
            <div className="spage-split-3">
              {WHY.map((item) => (
                <article key={item.title} className="spage-rule-card">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="spage-section spage-section--soft">
          <div className="wrap">
            <div className="spage-head">
              <div>
                <p className="spage-eyebrow mono">Programs</p>
                <h2>How brands work with us</h2>
              </div>
              <p className="spage-dek">
                From newsletter sponsorships to custom research - every format
                is designed to respect the reader and the brand.
              </p>
            </div>
            <div className="spage-offer-grid">
              {OFFERS.map((item) => (
                <article key={item.num} className="spage-offer">
                  <span className="mono">{item.num}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="spage-band">
          <div className="wrap spage-band-inner">
            <div>
              <p className="spage-eyebrow mono">Next step</p>
              <h2>Get rates, audience detail, and availability</h2>
              <p>
                Tell us your goals. We will send the current media kit and
                available placements for this quarter.
              </p>
            </div>
            <Link href="/contact" className="btn btn-primary">
              Contact partnerships
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
