"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        style={{ letterSpacing: "0.4em", color: "var(--accent-magenta)" }}
      >
        transmission interrupted
      </p>
      <h1
        style={{
          fontSize: "clamp(2.5rem, 8vw, 5rem)",
          marginTop: "0.5em",
          color: "var(--accent-magenta)",
        }}
      >
        500
      </h1>
      <p style={{ color: "var(--ink-muted)", marginBottom: "1.5em" }}>
        Something went wrong rendering this route.
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
            color: "var(--accent-cyan)",
            border: "1px solid var(--hairline)",
            padding: "8px 16px",
            cursor: "pointer",
            fontFamily: "var(--font-display)",
          }}
        >
          retry
        </button>
        <Link href="/" className="label">
          ⟵ home
        </Link>
      </div>
    </section>
  );
}
