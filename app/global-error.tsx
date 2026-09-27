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
    <html lang="cs">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface-page)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p
            className="label"
            style={{ color: "var(--accent-primary)", marginBottom: 16 }}
          >
            critical error
          </p>
          <h1 style={{ margin: "0 0 16px" }}>500</h1>
          <p style={{ color: "var(--text-tertiary)", marginBottom: 24 }}>
            Couldn’t load the magazine. Reload, or come back in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            className="label"
            style={{
              background: "transparent",
              color: "var(--accent-primary)",
              border: "1px solid var(--border-subtle)",
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
