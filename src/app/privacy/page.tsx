import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ITmatics News collects, uses, and protects personal information for newsletters, contact forms, and site analytics.",
};

const SECTIONS = [
  {
    title: "Who we are",
    body: "ITmatics News is published by Quore B2B Marketing. This policy explains how we handle personal information when you visit itmaticsnews.com, subscribe to The Download, or contact us.",
  },
  {
    title: "Information we collect",
    body: "We may collect your name, work email, company, role, and message content when you subscribe or contact us. We also collect standard technical data such as browser type, approximate location, and pages viewed through analytics tools.",
  },
  {
    title: "How we use information",
    body: "We use your details to deliver newsletters, respond to inquiries, improve the site, and maintain security. We do not sell subscriber lists or personal contact data.",
  },
  {
    title: "Newsletters & unsubscribe",
    body: "If you subscribe to The Download, we email you according to the frequency described at signup. You can unsubscribe at any time via the link in each email or on our unsubscribe page. We may keep a minimal record so we do not email you again by mistake.",
  },
  {
    title: "Cookies & analytics",
    body: "We may use cookies or similar technologies for essential site functions and to understand aggregate traffic. You can control cookies through your browser settings.",
  },
  {
    title: "Sharing",
    body: "We share data with service providers who help us operate email delivery, hosting, and analytics - only as needed to provide those services. We may disclose information if required by law.",
  },
  {
    title: "Retention & security",
    body: "We keep personal data only as long as needed for the purposes above, then delete or anonymize it. We use reasonable administrative and technical safeguards; no method of transmission is fully secure.",
  },
  {
    title: "Your choices",
    body: "You may request access, correction, or deletion of your subscriber information by contacting us. If you are in a region with additional privacy rights, we will honor applicable requests.",
  },
  {
    title: "Contact",
    body: "Questions about this policy: privacy@itmaticsnews.com or use our contact page.",
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
            <p className="spage-eyebrow mono">Legal</p>
            <h1>Privacy Policy</h1>
            <p className="spage-lead">
              How ITmatics News collects and uses information - written in plain
              language for readers and subscribers.
            </p>
            <p className="spage-meta mono">Last updated: March 15, 2026</p>
          </div>
        </section>

        <section className="spage-section">
          <div className="wrap legal-doc">
            {SECTIONS.map((item) => (
              <article key={item.title} className="legal-block">
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </article>
            ))}
            <p className="legal-related">
              See also our{" "}
              <Link href="/terms">Terms of Use</Link>
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
