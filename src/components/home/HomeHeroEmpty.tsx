import Link from "next/link";

/** Empty-state hero when no articles are published yet. */
export default function HomeHeroEmpty() {
  return (
    <section className="hero hero--empty">
      <div className="hero-wash" aria-hidden />
      <div className="wrap">
        <div className="hero-stage hero-stage--solo">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="hero-kicker-tag">ITmatics News</span>
              <span className="hero-kicker-sep" aria-hidden />
              <span className="mono hero-kicker-label">Getting started</span>
            </div>
            <h1>Intelligence for enterprise technology leaders</h1>
            <p className="dek">
              Generate your first story from the admin panel - AI research, full
              articles, and covers for CIOs, CISOs, and IT leaders.
            </p>
            <div className="hero-actions">
              <Link
                href="/admin/articles/new#generate"
                className="btn btn-primary lead-cta"
              >
                Generate content
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
