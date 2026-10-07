import Link from "next/link";

export default function SubscribeBand({
  id = "subscribe",
  kicker = "ITMATICS NEWS - DAILY NEWSLETTER",
  title = "The enterprise-IT briefing that respects your inbox",
  description = "Reporting and analysis on AI, cloud, security, and data, written for the people who have to make the decision. One email each weekday. No noise.",
  source = "home",
}: {
  id?: string;
  kicker?: string;
  title?: string;
  description?: string;
  source?: string;
}) {
  const inputId = `${id}-email`;

  return (
    <section className="subscribe" id={id}>
      <div className="wrap">
        <div>
          <div className="k mono">{kicker}</div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div>
          <form className="sub-form js-fake-subscribe" data-source={source}>
            <label className="sr-only" htmlFor={inputId}>
              Work email
            </label>
            <input
              id={inputId}
              type="email"
              name="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
            <button className="btn btn-primary" type="submit">
              Subscribe now
            </button>
            <p className="sub-note mono">
              Free, one email each weekday. Unsubscribe anytime. See our{" "}
              <Link href="/privacy">privacy notice</Link>.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
