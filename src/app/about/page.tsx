import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getNavTopics } from "@/lib/topic-config";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About ITmatics News - independent intelligence for CIOs, CISOs, and enterprise technology leaders. Editorial standards, coverage, and partnerships.",
};

const PRINCIPLES = [
  {
    title: "Independent newsroom",
    body: "Commercial partnerships never shape our reporting or conclusions. Sponsored work is labeled clearly.",
  },
  {
    title: "Practical by design",
    body: "Every story answers what happened, why it matters to an enterprise, and what a leader should do next.",
  },
  {
    title: "Depth over volume",
    body: "We would rather publish one useful analysis than five reactions. Attribution and corrections are non-negotiable.",
  },
  {
    title: "Built for operators",
    body: "We write for people who run technology organizations - not for gadget buyers or vendor marketing teams.",
  },
];

const STORY = [
  {
    label: "01",
    title: "Why we exist",
    body: "Enterprise IT leaders are flooded with vendor noise and commodity tech headlines. ITmatics News exists to cut through that - with reporting written for people who have to make the call.",
  },
  {
    label: "02",
    title: "Who we serve",
    body: "CIOs, CISOs, architects, platform owners, and the operators who turn strategy into systems. If you run technology for a living, this briefing is for you.",
  },
  {
    label: "03",
    title: "How we publish",
    body: "We favor clear analysis over volume. Stories are attributed, corrections are public, and sponsored work is labeled. Independence is the product.",
  },
];

export default function Page() {
  const topics = getNavTopics().slice(0, 6);

  return (
    <>
      <SiteHeader />
      <main className="about-page">
        <section className="about-hero" aria-label="About ITmatics News">
          <div className="about-hero-bg" aria-hidden />
          <div className="wrap about-hero-inner">
            <p className="about-brand-mark">
              <span className="about-brand-it">IT</span>
              <span className="about-brand-matics">matics</span>
              <span className="about-brand-news">News</span>
            </p>
            <h1>About us</h1>
            <p className="about-lead">
              Independent intelligence for the people who run enterprise
              technology - clear reporting, honest analysis, no vendor noise.
            </p>
            <div className="about-hero-actions">
              <Link href="/newsletters" className="btn btn-primary">
                Get The Download
              </Link>
              <Link href="#story" className="about-text-link">
                Our story
              </Link>
            </div>
            <dl className="about-hero-meta">
              <div>
                <dt>Audience</dt>
                <dd>CIOs, CISOs, IT directors</dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>AI · Cloud · Security · Data</dd>
              </div>
              <div>
                <dt>Publisher</dt>
                <dd>Quore B2B Marketing</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="about-section" id="story">
          <div className="wrap">
            <div className="about-section-head about-section-head--solo">
              <p className="about-eyebrow mono">Our story</p>
              <h2>A narrow brief, on purpose</h2>
              <p className="about-section-dek">
                ITmatics News is not a consumer gadget site and not a vendor
                blog. We write for technology leaders who need defensible
                decisions.
              </p>
            </div>
            <div className="about-story-grid">
              {STORY.map((item) => (
                <article key={item.label} className="about-story-item">
                  <span className="mono about-story-num">{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section about-section--soft" id="mission">
          <div className="wrap about-split">
            <div>
              <p className="about-eyebrow mono">Who we are</p>
              <h2>Written for operators, not spectators</h2>
            </div>
            <div className="about-copy">
              <p>
                We cover artificial intelligence, cloud, security, data, and IT
                leadership at the enterprise level. Every story is written to
                answer a practical question: what happened, why it matters, and
                what a leader should do about it.
              </p>
              <p>
                ITmatics News is published by Quore B2B Marketing. Our commercial
                partnerships never influence editorial coverage or the
                conclusions our journalists reach.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section" id="coverage">
          <div className="wrap">
            <div className="about-section-head">
              <div>
                <p className="about-eyebrow mono">What we cover</p>
                <h2>Desks that mirror how IT actually works</h2>
              </div>
              <p className="about-section-dek">
                From AI governance to infrastructure - topics organized the way
                enterprise teams organize work.
              </p>
            </div>
            <div className="about-topic-grid">
              {topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/topic/${topic.slug}`}
                  className="about-topic"
                >
                  <span className="mono">
                    {topic.cardKicker ?? topic.kicker}
                  </span>
                  <strong>{topic.navLabel}</strong>
                  <p>{topic.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section about-section--soft" id="standards">
          <div className="wrap">
            <div className="about-section-head">
              <div>
                <p className="about-eyebrow mono">Editorial standards</p>
                <h2>How we work</h2>
              </div>
            </div>
            <div className="about-principle-grid">
              {PRINCIPLES.map((item) => (
                <article key={item.title} className="about-principle">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-stats" aria-label="Audience snapshot">
          <div className="wrap about-stats-grid">
            <div>
              <div className="num">CIO</div>
              <div className="lab">Written for technology leadership teams</div>
            </div>
            <div>
              <div className="num">Daily</div>
              <div className="lab">The Download, every weekday morning</div>
            </div>
            <div>
              <div className="num">7</div>
              <div className="lab">Core topics from AI to infrastructure</div>
            </div>
            <div>
              <div className="num">1st-party</div>
              <div className="lab">Consented subscriber audience</div>
            </div>
          </div>
        </section>

        <section className="about-section" id="advertise">
          <div className="wrap">
            <div className="about-section-head">
              <div>
                <p className="about-eyebrow mono">Advertise &amp; partner</p>
                <h2>Reach decision-makers without the noise</h2>
              </div>
              <p className="about-section-dek">
                We work with a small number of partners each quarter. Programs
                are designed for genuine engagement, not empty impressions.
              </p>
            </div>
            <div className="about-offer-grid">
              <article className="about-offer">
                <span className="mono">01</span>
                <h3>Newsletter placements</h3>
                <p>
                  Native placements in The Download and topic briefings - sold by
                  share of voice, not by chasing volume.
                </p>
              </article>
              <article className="about-offer">
                <span className="mono">02</span>
                <h3>Custom research &amp; content</h3>
                <p>
                  Reports, buyer guides, and analysis produced to editorial
                  standards and clearly attributed.
                </p>
              </article>
              <article className="about-offer">
                <span className="mono">03</span>
                <h3>Demand programs</h3>
                <p>
                  Syndication and lead programs backed by Quore B2B Marketing,
                  with transparent sourcing and quality controls.
                </p>
              </article>
            </div>
            <div className="about-offer-cta">
              <Link href="/contact" className="btn btn-primary">
                Request the media kit
              </Link>
            </div>
          </div>
        </section>

        <section className="about-contact" id="contact">
          <div className="wrap about-contact-grid">
            <div>
              <p className="about-eyebrow mono">Get in touch</p>
              <h2>Request the ITmatics News media kit</h2>
              <p>
                Tell us about your goals. We will send rates, audience detail,
                and available placements for the current quarter.
              </p>
              <div className="about-contact-meta">
                <p>
                  <span className="mono">Editorial</span>
                  <a href="mailto:editorial@itmaticsnews.com">
                    editorial@itmaticsnews.com
                  </a>
                </p>
                <p>
                  <span className="mono">Partnerships</span>
                  <a href="mailto:partners@itmaticsnews.com">
                    partners@itmaticsnews.com
                  </a>
                </p>
              </div>
            </div>
            <form
              className="about-form js-fake-subscribe"
              data-source="about-media-kit"
            >
              <div className="row">
                <input
                  type="text"
                  name="firstname"
                  placeholder="Full name"
                  aria-label="Full name"
                />
                <input
                  type="text"
                  name="company"
                  placeholder="Company"
                  aria-label="Company"
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Work email"
                aria-label="Work email"
                required
              />
              <select name="interest" aria-label="Interest" defaultValue="">
                <option value="">What are you interested in?</option>
                <option>Newsletter placements</option>
                <option>Custom research &amp; content</option>
                <option>Demand generation programs</option>
                <option>Something else</option>
              </select>
              <button className="btn btn-primary" type="submit">
                Send request
              </button>
              <p className="about-form-note mono">
                We only use your details to respond to this request. See our{" "}
                <Link href="/privacy">privacy notice</Link>.
              </p>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
