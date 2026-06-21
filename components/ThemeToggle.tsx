"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";

function readMode(): Mode {
  return document.documentElement.dataset.mode === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMode(readMode());
    setReady(true);
  }, []);

  function cycle() {
    const next: Mode = mode === "light" ? "dark" : "light";
    if (next === "dark") {
      document.documentElement.dataset.mode = "dark";
    } else {
      delete document.documentElement.dataset.mode;
    }
    try {
      localStorage.setItem("mode", next);
    } catch {}
    setMode(next);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`switch to ${mode === "light" ? "dark" : "light"} mode`}
      title={`switch to ${mode === "light" ? "dark" : "light"} mode`}
      className="label"
      style={{
        background: "transparent",
        color: "var(--ink-muted)",
        border: "1px solid var(--hairline)",
        padding: "6px 10px",
        cursor: "pointer",
        fontFamily: "var(--font-display)",
        minWidth: 64,
        textAlign: "center",
      }}
    >
      {ready ? (mode === "dark" ? "dark ☾" : "light ☀") : "◐"}
    </button>
  );
}
