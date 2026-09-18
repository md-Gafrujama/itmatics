import Link from "next/link";
import type { TopicConfig } from "@/lib/topic-config";

export default function TopicHero({
  config,
  description,
}: {
  config: TopicConfig;
  description: string;
}) {
  return (
    <section className="topic-hero">
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">ITmatics News</Link>
          &nbsp;/&nbsp; <span>{config.crumb}</span>
        </nav>
        <span className="kicker">{config.kicker}</span>
        <h1>{config.title}</h1>
        <p className="topic-desc">{description}</p>
        <div className="topic-chips">
          {config.chips.map((chip) => (
            <span key={chip} className="chip">
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
