import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CookiePreferencesTrigger from "@/components/CookiePreferencesTrigger";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ITmatics News collects, uses, and protects information — including cookies, first-party analytics, and your privacy choices.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="spage">
        <section className="spage-hero">
          <div className="spage-hero-bg" aria-hidden />
          <div className="wrap spage-hero-inner">
            <p className="spage-eyebrow mono">Legal</p>
            <h1>Privacy Policy</h1>
            <p className="spage-lead">
              How ITmatics News collects and uses information — written in plain
              language for readers and subscribers.
            </p>
            <p className="spage-meta mono">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </section>

        <section className="spage-section">
          <div className="wrap legal-doc">
            <article className="legal-block" id="overview">
              <h2>Overview</h2>
              <p>
                ITmatics News is published by Quore B2B Marketing. We publish
                independent intelligence for enterprise technology leaders. This
                policy explains how we process limited technical and preference
                data when you visit{" "}
                <a href="https://www.itmaticsnews.com">www.itmaticsnews.com</a>,
                subscribe to The Download, or contact us.
              </p>
            </article>

            <article className="legal-block" id="cookies">
              <h2>Cookies and similar technologies</h2>
              <p>
                We use first-party cookies. You can change your choices anytime
                via{" "}
                <CookiePreferencesTrigger className="cookie-inline-link" /> in
                the site footer. Browsing is never blocked behind the consent
                bar.
              </p>
              <h3>Strictly necessary</h3>
              <p>
                Always on. These cookies store your consent decision (
                <code>itm_consent</code>, ~180 days), keep the site secure, and
                support basic navigation. They cannot be disabled through the
                preferences panel.
              </p>
              <h3>Analytics (optional)</h3>
              <p>
                When you opt in, we set an anonymous visitor id (
                <code>itm_vid</code>, ~400 days) and send first-party page-view
                events to our own servers. If Google Analytics is configured, we
                load it only under Google Consent Mode with{" "}
                <code>analytics_storage</code> (and related advertising signals)
                defaulting to <strong>denied</strong> until you grant analytics
                consent. We do not send GA hits before that grant.
              </p>
              <h3>Marketing / attribution (optional)</h3>
              <p>
                When you opt in, we may store a first-touch attribution cookie (
                <code>itm_attr</code>, ~90 days) with landing path, timestamp,
                and UTM parameters. Turning marketing off deletes this cookie
                immediately. Campaign measurement uses this category; it is
                never enabled without your choice.
              </p>
            </article>

            <article className="legal-block" id="analytics">
              <h2>First-party analytics and geo</h2>
              <p>
                With analytics consent, we record approximate page views for
                product and editorial improvement. Events may include path,
                referrer host, device/viewport hints, browser time zone,
                language, and truncated UTMs. We resolve approximate
                country/city/region from edge/CDN headers when available. Client
                IPs used for consent audit are{" "}
                <strong>pseudonymized</strong> (IPv4 last octet zeroed; IPv6
                truncated). We do not store full email addresses in cookies or
                analytics — if an email appears in a URL, we keep the domain
                only.
              </p>
              <p>
                Analytics event retention is minimized to about{" "}
                <strong>180 days</strong>. Older rows are deleted by a scheduled
                cleanup job (equivalent to a TTL of ~15,552,000 seconds).
              </p>
            </article>

            <article className="legal-block" id="newsletter">
              <h2>Newsletters and forms</h2>
              <p>
                If you subscribe or contact us, we process the email and related
                context you provide to deliver The Download or respond to your
                request. You can{" "}
                <Link href="/unsubscribe">unsubscribe</Link> at any time.
              </p>
            </article>

            <article className="legal-block" id="sharing">
              <h2>Sharing and processors</h2>
              <p>
                We use infrastructure providers (for example hosting and
                database services) to operate the site. Optional Google Analytics
                runs only with analytics consent. We do not sell personal
                information. US and other cross-border processing may occur where
                our processors operate; we apply appropriate safeguards for
                transfers.
              </p>
            </article>

            <article className="legal-block" id="rights">
              <h2>Your rights and choices</h2>
              <p>
                Depending on your location, you may have rights to access,
                correct, delete, or restrict certain processing, and to object to
                marketing. Use{" "}
                <CookiePreferencesTrigger className="cookie-inline-link" /> to
                update cookie categories. For privacy requests contact{" "}
                <a href="mailto:privacy@itmaticsnews.com">
                  privacy@itmaticsnews.com
                </a>
                .
              </p>
            </article>

            <article className="legal-block" id="contact">
              <h2>Contact</h2>
              <p>
                ITmatics News · Published by Quore B2B Marketing
                <br />
                Privacy:{" "}
                <a href="mailto:privacy@itmaticsnews.com">
                  privacy@itmaticsnews.com
                </a>
                <br />
                Or use our <Link href="/contact">contact page</Link>.
              </p>
            </article>

            <p className="legal-related">
              See also our <Link href="/terms">Terms of Use</Link>
              {" · "}
              <Link href="/editorial-standards">Editorial standards</Link>
              {" · "}
              <Link href="/unsubscribe">Unsubscribe</Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
