export default function Loading() {
  return (
    <div className="route-loading-page" role="status" aria-label="Loading topic">
      <div className="route-loader-circle is-solo" aria-hidden>
        <span className="route-loader-ring" />
      </div>
      <span className="sr-only">Loading topic…</span>
    </div>
  );
}
