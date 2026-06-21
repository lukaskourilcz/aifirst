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
          background: "var(--bg-void)",
          color: "var(--ink-primary)",
          fontFamily: "var(--font-body)",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p
            className="label"
            style={{ color: "var(--accent-magenta)", marginBottom: 16 }}
          >
            kritická chyba
          </p>
          <h1 style={{ margin: "0 0 16px" }}>500</h1>
          <p style={{ color: "var(--ink-muted)", marginBottom: 24 }}>
            Magazín se nepodařilo načíst. Obnovte stránku nebo se vraťte později.
          </p>
          <button
            type="button"
            onClick={reset}
            className="label"
            style={{
              background: "transparent",
              color: "var(--accent-cyan)",
              border: "1px solid var(--hairline-strong)",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            zkusit znovu
          </button>
        </div>
      </body>
    </html>
  );
}
