"use client";

import { useEffect, useState } from "react";

function PulseIcon({ live = false }: { live?: boolean }) {
  return (
    <span className={`pulse${live ? " live" : ""}`} aria-hidden>
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export default function SubscribeModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("Get the resource");
  const [description, setDescription] = useState(
    "Tell us where to send it. You will also get The Download, our weekday newsletter for enterprise IT leaders.",
  );

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ title?: string }>).detail;
      if (detail?.title) {
        setTitle(detail.title);
        setDescription(
          "Tell us where to send it. You will also get The Download, our weekday newsletter for enterprise IT leaders.",
        );
      } else {
        setTitle("Sign up for The Download");
        setDescription(
          "The weekday newsletter IT leaders read before the first meeting. Free.",
        );
      }
      setOpen(true);
    };

    window.addEventListener("itmatics:open-modal", onOpen);
    return () => window.removeEventListener("itmatics:open-modal", onOpen);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (
      form.elements.namedItem("email") as HTMLInputElement
    ).value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      window.alert("Enter a valid work email");
      return;
    }
    form.reset();
    setOpen(false);
    window.dispatchEvent(
      new CustomEvent("itmatics:toast", {
        detail: { message: "Sent. Watch your inbox in the next few minutes." },
      }),
    );
  };

  if (!open) return null;

  return (
    <div
      className="modal-scrim open"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
      >
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="modal-brand" aria-hidden>
          <PulseIcon />
        </div>
        <span className="kicker">ITmatics News</span>
        <h3 id="modalTitle">{title}</h3>
        <p>{description}</p>
        <form className="modal-form" onSubmit={submit}>
          <input
            type="email"
            name="email"
            placeholder="Work email"
            aria-label="Work email"
            required
            autoComplete="email"
          />
          <button className="modal-submit" type="submit">
            Subscribe free
          </button>
          <p className="modal-fine">
            Free. Unsubscribe anytime. We only send the weekday brief.
          </p>
        </form>
      </div>
    </div>
  );
}

export function Toast() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string }>).detail;
      setMessage(detail.message);
      setVisible(true);
      window.setTimeout(() => setVisible(false), 3400);
    };

    window.addEventListener("itmatics:toast", handler);
    return () => window.removeEventListener("itmatics:toast", handler);
  }, []);

  return visible ? (
    <div className="toast show" role="status">
      <PulseIcon /> <span>{message}</span>
    </div>
  ) : null;
}
