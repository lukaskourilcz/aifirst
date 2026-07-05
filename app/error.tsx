"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = dict(DEFAULT_LOCALE).error;
  useEffect(() => {
    // Surface in browser devtools; in production, hook a real logger here.
    console.error("[route-error]", error);
  }, [error]);

  return (
    <section
      className="container"
      style={{ padding: "96px 24px", textAlign: "center" }}
    >
      <p
        className="label label--accent"
        style={{ letterSpacing: "0.4em", color: "var(--color-blueprint-blue)" }}
      >
        {t.kicker}
      </p>
      <h1
        style={{
          fontSize: "clamp(2.5rem, 8vw, 5rem)",
          marginTop: "0.5em",
          color: "var(--color-blueprint-blue)",
        }}
      >
        500
      </h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "1.5em" }}>
        {t.body}
      </p>
      {error.digest && (
        <p
          className="label"
          style={{ color: "var(--ink-dim)", marginBottom: "2em" }}
        >
          ref · {error.digest}
        </p>
      )}
      <div
        style={{
          display: "inline-flex",
          gap: 16,
          alignItems: "baseline",
        }}
      >
        <button
          type="button"
          onClick={reset}
          className="label"
          style={{
            background: "transparent",
            color: "var(--color-blueprint-blue)",
            border: "1px solid var(--color-fog)",
            padding: "8px 16px",
            cursor: "pointer",
            fontFamily: "var(--font-display)",
          }}
        >
          {t.retry}
        </button>
        <Link href="/" className="label">
          ⟵ {t.home}
        </Link>
      </div>
    </section>
  );
}
