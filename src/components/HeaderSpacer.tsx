"use client";

import { useEffect, useRef } from "react";

/** Reserves space under the fixed flag + masthead so content isn't covered. */
export default function HeaderSpacer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const flag = document.querySelector<HTMLElement>(".flag");
    const header = document.querySelector<HTMLElement>(".site-header");
    const spacer = ref.current;
    if (!header || !spacer) return;

    const sync = () => {
      const flagH = flag?.offsetHeight ?? 0;
      spacer.style.height = `${flagH + header.offsetHeight}px`;
    };

    sync();
    const ro = new ResizeObserver(sync);
    if (flag) ro.observe(flag);
    ro.observe(header);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return <div className="site-header-spacer" ref={ref} aria-hidden />;
}
