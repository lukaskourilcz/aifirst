"use client";

// Catches errors thrown in the root layout itself. Must declare its
// own <html>/<body>; the regular layout is bypassed when this renders.
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
          background: "#05070d",
          color: "#e8ecff",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#ff4fd8",
              marginBottom: 16,
            }}
          >
            kritická chyba
          </p>
          <h1 style={{ fontSize: 64, margin: "0 0 16px", color: "#ff4fd8" }}>
            500
          </h1>
          <p style={{ color: "#8a93b8", marginBottom: 24 }}>
            Magazín se nepodařilo načíst. Obnovte stránku nebo se vraťte později.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#4c5680",
                marginBottom: 24,
              }}
            >
              ref · {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              background: "transparent",
              color: "#5cf0ff",
              border: "1px solid rgba(92, 240, 255, 0.18)",
              padding: "8px 16px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            zkusit znovu
          </button>
        </div>
      </body>
    </html>
  );
}
