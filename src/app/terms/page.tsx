import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms governing use of ITmatics News - site access, content, subscriptions, and acceptable use.",
};

const SECTIONS = [
  {
    title: "Agreement",
    body: "By accessing ITmatics News (itmaticsnews.com) or subscribing to our newsletters, you agree to these Terms of Use and our Privacy Policy. If you do not agree, please do not use the site.",
  },
  {
    title: "What we publish",
    body: "ITmatics News provides news, analysis, and commentary on enterprise technology for professional audiences. Content is for general information and does not constitute legal, financial, or technical advice for a specific organization.",
  },
  {
    title: "Intellectual property",
    body: "Articles, branding, design, and other materials on this site are owned by Quore B2B Marketing or our licensors. You may link to our pages and share headlines with attribution. You may not republish full articles, scrape content at scale, or present our work as your own without written permission.",
  },
  {
    title: "Accounts & subscriptions",
    body: "Newsletter signup requires accurate contact details. You are responsible for the email address you provide. We may suspend delivery if we detect abuse, bounce loops, or misuse of subscription forms.",
  },
  {
    title: "Acceptable use",
    body: "Do not attempt to disrupt the site, probe systems without authorization, submit malware, harvest emails, or use automated means to overload forms or APIs. We may block access that harms the service or other users.",
  },
  {
    title: "Third-party links",
    body: "We may link to external sites. We are not responsible for their content, policies, or practices. Visiting those sites is at your own risk.",
  },
  {
    title: "Disclaimers",
    body: "The site and newsletters are provided “as is.” We do not warrant uninterrupted availability, complete accuracy, or fitness for a particular purpose. Technology markets change quickly; verify critical decisions with primary sources.",
  },
  {
    title: "Limitation of liability",
    body: "To the fullest extent permitted by law, Quore B2B Marketing and ITmatics News are not liable for indirect, incidental, or consequential damages arising from use of the site or reliance on content.",
  },
  {
    title: "Changes",
    body: "We may update these terms from time to time. The “Last updated” date at the top of this page will change when we do. Continued use after updates means you accept the revised terms.",
  },
  {
    title: "Contact",
    body: "Questions about these terms: legal@itmaticsnews.com or via our contact page.",
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
            <h1>Terms of Use</h1>
            <p className="spage-lead">
              The rules for using ITmatics News - reading, sharing, and
              subscribing.
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
              <Link href="/privacy">Privacy Policy</Link>
              {" · "}
              <Link href="/editorial-standards">Editorial standards</Link>
              {" · "}
              <Link href="/contact">Contact</Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
