"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Smooth circular loader on client navigations and form submits.
 */
export default function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const safetyTimer = useRef<number | null>(null);
  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;

  function clearTimers() {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    if (safetyTimer.current) window.clearTimeout(safetyTimer.current);
    hideTimer.current = null;
    safetyTimer.current = null;
  }

  function start() {
    clearTimers();
    setActive(true);
    // Small delay so instant navigations don't flash
    window.setTimeout(() => setVisible(true), 40);
    safetyTimer.current = window.setTimeout(() => stop(), 12000);
  }

  function stop() {
    clearTimers();
    setVisible(false);
    hideTimer.current = window.setTimeout(() => setActive(false), 220);
  }

  // Stop when the route finishes updating
  useEffect(() => {
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  useEffect(() => {
    function isModified(e: MouseEvent) {
      return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
    }

    function onClick(e: MouseEvent) {
      if (isModified(e)) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        const nextKey = `${url.pathname}?${url.searchParams.toString()}`;
        const currentKey = `${window.location.pathname}?${window.location.search.replace(/^\?/, "")}`;
        if (nextKey === currentKey || nextKey === `${window.location.pathname}?`) {
          // same path with empty vs no query - still navigate if hash-only skip
          if (url.pathname === window.location.pathname && url.search === window.location.search) {
            return;
          }
        }
        start();
      } catch {
        // ignore bad urls
      }
    }

    function onSubmit(e: Event) {
      const form = e.target as HTMLFormElement | null;
      if (!form) return;
      // Don't spin forever on client-handled subscribe forms
      if (form.classList.contains("js-fake-subscribe")) return;
      if (form.getAttribute("data-no-loader") != null) return;
      start();
    }

    function onPopState() {
      start();
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("popstate", onPopState);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!active) return null;

  return (
    <div
      className={`route-loader${visible ? " is-visible" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="route-loader-circle" aria-hidden>
        <span className="route-loader-ring" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
