import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import BrandLogo from "@/components/BrandLogo";
import MobileNav from "@/components/MobileNav";
import FlagTicker from "@/components/FlagTicker";
import { getNavTopics } from "@/lib/topic-config";

function todayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date());
}

export default function SiteHeader({
  currentTopicSlug,
  homeActive = false,
}: {
  currentTopicSlug?: string;
  homeActive?: boolean;
} = {}) {
  const navTopics = getNavTopics();

  return (
    <div className="site-chrome">
      <div className="ticker">
        <div className="wrap">
          <div className="feed">
            <span className="live mono">
              <span className="dot" />
              Live
            </span>
            <span className="ticker-sep" aria-hidden />
            <span className="mono ticker-date">{todayLabel()}</span>
            <span className="ticker-sep hide-sm" aria-hidden />
            <span className="mono ticker-copy">
              <FlagTicker />
            </span>
          </div>
          <div className="util mono">
            <Link href="/newsletters" className="hide-sm">
              Newsletters
            </Link>
            <Link href="/advertise" className="hide-sm">
              Advertise
            </Link>
            <span className="hide-sm util-edition">US Edition</span>
          </div>
        </div>
      </div>

      <header className="masthead">
        <div className="wrap masthead-inner">
          <BrandLogo showTagline={false} />
          <div className="mh-actions">
            <SearchBar />
            <Link className="mh-link hide-sm" href="/about">
              About
            </Link>
            <Link className="btn btn-primary btn-subscribe" href="/newsletters">
              Subscribe
            </Link>
            <MobileNav currentTopicSlug={currentTopicSlug} />
          </div>
        </div>
      </header>

      <nav className="nav" aria-label="Primary">
        <div className="wrap nav-inner">
          <Link href="/" className={homeActive ? "active" : undefined}>
            Home
          </Link>
          {navTopics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/topic/${topic.slug}`}
              className={
                currentTopicSlug === topic.slug ? "active" : undefined
              }
            >
              {topic.navLabel}
            </Link>
          ))}
          <Link href="/about" className="more">
            All topics
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </nav>
    </div>
  );
}
