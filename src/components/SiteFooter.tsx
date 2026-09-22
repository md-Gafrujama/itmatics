import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { getNavTopics } from "@/lib/topic-config";

export default function SiteFooter() {
  const navTopics = getNavTopics();
  const year = new Date().getFullYear();

  return (
    <footer className="foot">
      <div className="foot-cta-band">
        <div className="wrap foot-cta-inner">
          <div className="foot-cta-copy">
            <p className="k mono">The Download</p>
            <h3>Enterprise IT, five minutes a day</h3>
            <p>
              One weekday briefing across AI, cloud, security, data, leadership,
              transformation, and infrastructure.
            </p>
          </div>
          <form className="foot-cta-form js-fake-subscribe" data-source="footer">
            <label className="sr-only" htmlFor="foot-email">
              Work email
            </label>
            <input
              id="foot-email"
              type="email"
              name="email"
              placeholder="Work email"
              aria-label="Work email"
              required
            />
            <button type="submit" className="btn btn-primary">
              Subscribe free
            </button>
          </form>
        </div>
      </div>

      <div className="wrap foot-main">
        <div className="foot-top">
          <div className="foot-brand-col">
            <BrandLogo variant="footer" showTagline={false} href="/" />
            <p className="about">
              Independent intelligence for enterprise technology leaders -
              reporting on the decisions behind the tools.
            </p>
            <div className="foot-follow">
              <span className="mono">Follow</span>
              <div className="social">
                <a
                  href="https://www.linkedin.com"
                  aria-label="LinkedIn"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8h4V24h-4zM8 8h3.8v2.2h.05c.53-1 1.83-2.2 3.77-2.2 4.03 0 4.78 2.65 4.78 6.1V24h-4v-6.9c0-1.65-.03-3.77-2.3-3.77-2.3 0-2.65 1.8-2.65 3.65V24H8z" />
                  </svg>
                </a>
                <a
                  href="https://x.com"
                  aria-label="X"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M18.9 2H22l-7.3 8.3L23 22h-6.6l-5.2-6.8L5.3 22H2l7.8-8.9L1.5 2h6.8l4.7 6.2zm-1.1 18h1.8L7.3 3.8H5.4z" />
                  </svg>
                </a>
                <Link href="/site-map" aria-label="Sitemap">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <circle cx="5" cy="19" r="2.5" />
                    <path d="M3 10.5A10.5 10.5 0 0 1 13.5 21h3A13.5 13.5 0 0 0 3 7.5zM3 4a17 17 0 0 1 17 17h3A20 20 0 0 0 3 1z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <nav className="foot-nav" aria-label="Footer">
            <div className="foot-col">
              <h4>Topics</h4>
              <ul>
                {navTopics.map((topic) => (
                  <li key={topic.slug}>
                    <Link href={`/topic/${topic.slug}`}>{topic.navLabel}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="foot-col">
              <h4>Sections</h4>
              <ul>
                <li>
                  <Link href="/newsletters">Newsletters</Link>
                </li>
                <li>
                  <Link href="/resources">Resources</Link>
                </li>
                <li>
                  <Link href="/unsubscribe">Unsubscribe</Link>
                </li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>Company</h4>
              <ul>
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/advertise">Advertise</Link>
                </li>
                <li>
                  <Link href="/editorial-standards">Editorial standards</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="foot-bot">
          <div className="legal mono">
            © {year} ITmatics News. Published by Quore B2B Marketing.
            {" · "}
            <Link href="/privacy">Privacy</Link>
            {" · "}
            <Link href="/terms">Terms</Link>
          </div>
          <div className="foot-pub mono">A Quore B2B media property</div>
        </div>
      </div>
    </footer>
  );
}
