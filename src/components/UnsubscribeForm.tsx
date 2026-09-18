"use client";

import { useId, useState } from "react";
import Link from "next/link";

export const UNSUBSCRIBE_REASONS = [
  {
    id: "too-many",
    label: "Too many emails",
    hint: "The cadence is more than I need",
  },
  {
    id: "not-relevant",
    label: "Not relevant to my work",
    hint: "The topics don’t match my role",
  },
  {
    id: "mistake",
    label: "Signed up by mistake",
    hint: "I didn’t mean to join this list",
  },
  {
    id: "other-source",
    label: "I get this elsewhere",
    hint: "Another briefing already covers this",
  },
  {
    id: "other",
    label: "Something else",
    hint: "I’ll share a short note below",
  },
] as const;

export default function UnsubscribeForm({
  token,
  defaultEmail = "",
}: {
  token?: string;
  defaultEmail?: string;
}) {
  const formId = useId();
  const [email, setEmail] = useState(defaultEmail);
  const [reason, setReason] = useState("");
  const [otherNote, setOtherNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [doneMessage, setDoneMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!reason) {
      setError("Please select a reason");
      return;
    }
    if (!token && !email.trim()) {
      setError("Enter the email you used to subscribe");
      return;
    }

    const reasonLabel =
      UNSUBSCRIBE_REASONS.find((r) => r.id === reason)?.label ?? reason;
    const fullReason =
      reason === "other" && otherNote.trim()
        ? `${reasonLabel}: ${otherNote.trim()}`
        : reasonLabel;

    setPending(true);
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token: token || undefined,
          reason: fullReason,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Could not unsubscribe");
      }
      setDoneMessage(
        data.message || "You have been unsubscribed from The Download.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unsubscribe");
    } finally {
      setPending(false);
    }
  }

  if (doneMessage) {
    return (
      <div className="unsub-done">
        <p className="unsub-done-kicker mono">Confirmed</p>
        <h2>You’re off The Download</h2>
        <p>{doneMessage}</p>
        <div className="unsub-done-actions">
          <Link href="/" className="btn btn-primary">
            Back to ITmatics News
          </Link>
          <Link href="/newsletters" className="unsub-done-link">
            Resubscribe later
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="unsub-form" onSubmit={onSubmit} data-no-loader>
      {!token && (
        <div className="unsub-field">
          <label htmlFor={`${formId}-email`}>
            Email address <span aria-hidden>*</span>
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            autoComplete="email"
            disabled={pending}
          />
        </div>
      )}

      {token ? (
        <div className="unsub-secure">
          <span className="mono">Secure link</span>
          <p>
            This request came from your email. Choose a reason and confirm to
            stop The Download.
          </p>
        </div>
      ) : null}

      <fieldset className="unsub-reasons">
        <legend>
          Why are you unsubscribing? <span aria-hidden>*</span>
        </legend>
        <div className="unsub-reason-list">
          {UNSUBSCRIBE_REASONS.map((item) => (
            <label
              key={item.id}
              className={`unsub-reason${reason === item.id ? " is-selected" : ""}`}
            >
              <input
                type="radio"
                name="reason"
                value={item.id}
                checked={reason === item.id}
                onChange={() => setReason(item.id)}
                disabled={pending}
                required
              />
              <span className="unsub-reason-text">
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {reason === "other" && (
        <div className="unsub-field">
          <label htmlFor={`${formId}-other`}>Additional detail (optional)</label>
          <textarea
            id={`${formId}-other`}
            rows={3}
            value={otherNote}
            onChange={(e) => setOtherNote(e.target.value.slice(0, 240))}
            placeholder="What should we improve?"
            disabled={pending}
          />
        </div>
      )}

      {error ? <p className="unsub-error">{error}</p> : null}

      <button
        className="btn btn-primary unsub-submit"
        type="submit"
        disabled={pending}
      >
        {pending ? "Processing…" : "Confirm unsubscribe"}
      </button>
      <p className="unsub-fine mono">
        This only affects The Download newsletter. Site browsing stays open.
      </p>
    </form>
  );
}
