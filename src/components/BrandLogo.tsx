import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  variant?: "default" | "onDark" | "footer";
  showTagline?: boolean;
  className?: string;
};

export default function BrandLogo({
  href = "/",
  variant = "default",
  showTagline = true,
  className = "",
}: BrandLogoProps) {
  const isFooter = variant === "footer";

  const mark = <span className="mark" aria-hidden />;

  const wordmark = (
    <span className="brand-text">
      <span className="brand-row">
        <span className="it">IT</span>
        <span className="matics">matics</span>
        <span
          className="news"
          style={isFooter ? { color: "var(--cobalt)" } : undefined}
        >
          News
        </span>
      </span>
      {showTagline && !isFooter && (
        <small>INTELLIGENCE FOR ENTERPRISE IT</small>
      )}
    </span>
  );

  if (isFooter) {
    return (
      <Link
        href={href}
        className={`brand brand--footer ${className}`.trim()}
        aria-label="ITmatics News home"
      >
        {mark}
        {wordmark}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`brand ${className}`.trim()}
      aria-label="ITmatics News home"
    >
      {mark}
      {wordmark}
    </Link>
  );
}
