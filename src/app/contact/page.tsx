import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact ITmatics News - editorial tips, corrections, media kit requests, and partnership inquiries.",
};

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="spage">
        <section className="spage-hero">
          <div className="spage-hero-bg" aria-hidden />
          <div className="wrap spage-hero-inner">
            <p className="spage-eyebrow mono">Get in touch</p>
            <h1>Contact ITmatics News</h1>
            <p className="spage-lead">
              Editorial tips, corrections, media kit requests, and partnership
              inquiries - send a note and we will route it to the right desk.
            </p>
          </div>
        </section>

        <section className="spage-section">
          <div className="wrap spage-contact-grid">
            <div>
              <p className="spage-eyebrow mono">Direct lines</p>
              <h2>Who to email</h2>
              <div className="spage-contact-list">
                <div>
                  <span className="mono">Editorial</span>
                  <a href="mailto:editorial@itmaticsnews.com">
                    editorial@itmaticsnews.com
                  </a>
                  <p>Tips, corrections, interview requests, and story feedback.</p>
                </div>
                <div>
                  <span className="mono">Partnerships</span>
                  <a href="mailto:partners@itmaticsnews.com">
                    partners@itmaticsnews.com
                  </a>
                  <p>Media kits, newsletter placements, and custom programs.</p>
                </div>
                <div>
                  <span className="mono">Publisher</span>
                  <p className="spage-contact-pub">Quore B2B Marketing</p>
                  <p>ITmatics News is a Quore B2B media property.</p>
                </div>
              </div>
              <div className="spage-contact-links">
                <Link href="/advertise" className="spage-text-link spage-text-link--ink">
                  Advertise with us
                </Link>
                <Link
                  href="/editorial-standards"
                  className="spage-text-link spage-text-link--ink"
                >
                  Editorial standards
                </Link>
                <Link href="/newsletters" className="spage-text-link spage-text-link--ink">
                  Newsletters
                </Link>
              </div>
            </div>

            <form
              className="spage-form spage-form--light js-fake-subscribe"
              data-source="contact"
            >
              <p className="spage-form-kicker mono">Send a message</p>
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
              <select name="interest" aria-label="Topic" defaultValue="">
                <option value="">What is this about?</option>
                <option>Media kit / advertising</option>
                <option>Editorial tip or correction</option>
                <option>Interview or speaking request</option>
                <option>Something else</option>
              </select>
              <textarea
                name="message"
                rows={4}
                placeholder="Short message (optional)"
                aria-label="Message"
              />
              <button className="btn btn-primary" type="submit">
                Send request
              </button>
              <p className="spage-form-note mono">
                We only use your details to respond. See our{" "}
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
