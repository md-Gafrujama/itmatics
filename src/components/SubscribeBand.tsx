import Link from "next/link";

export default function SubscribeBand({
  id = "subscribe",
  kicker = "THE DOWNLOAD - DAILY NEWSLETTER",
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
            <div className="row">
              <input
                type="text"
                name="firstname"
                placeholder="First name"
                aria-label="First name"
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
            <select name="role" aria-label="Your role" defaultValue="">
              <option value="">Your role (optional)</option>
              <option>CIO / IT Director</option>
              <option>CISO / Security Leader</option>
              <option>Enterprise Architect</option>
              <option>Engineering / Platform Lead</option>
              <option>Data / Analytics Leader</option>
              <option>Other</option>
            </select>
            <button className="btn btn-primary" type="submit">
              Subscribe free
            </button>
            <p className="sub-note mono">
              By subscribing you agree to receive The Download and occasional
              partner briefings. Unsubscribe anytime. See our{" "}
              <Link href="/privacy">privacy notice</Link>.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
