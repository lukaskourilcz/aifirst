"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-canvas)",
          color: "var(--ink-primary)",
          fontFamily: "var(--font-body)",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p
            className="label"
            style={{ color: "var(--color-blueprint-blue)", marginBottom: 16 }}
          >
            critical error
          </p>
          <h1 style={{ margin: "0 0 16px" }}>500</h1>
          <p style={{ color: "var(--ink-muted)", marginBottom: 24 }}>
            Couldn’t load the magazine. Reload, or come back in a moment.
          </p>
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
            }}
          >
            try again
          </button>
        </div>
      </body>
    </html>
  );
}
