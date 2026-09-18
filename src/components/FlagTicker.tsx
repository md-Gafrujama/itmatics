"use client";

import { useEffect, useState } from "react";
import { FLAG_SIGNALS } from "@/lib/topic-config";

export default function FlagTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % FLAG_SIGNALS.length);
        setVisible(true);
      }, 250);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  const signal = FLAG_SIGNALS[index];

  return (
    <span
      className="flag-ticker-track"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity .25s ease",
      }}
    >
      <b>{signal.label}</b> {signal.text}
    </span>
  );
}
