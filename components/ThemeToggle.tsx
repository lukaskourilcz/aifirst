"use client";

import { useEffect, useState } from "react";

type Mode = "night" | "term";

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("night");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current =
      (document.documentElement.dataset.mode as Mode) || "night";
    setMode(current);
    setReady(true);
  }, []);

  function cycle() {
    const next: Mode = mode === "night" ? "term" : "night";
    document.documentElement.dataset.mode = next;
    try {
      localStorage.setItem("mode", next);
    } catch {}
    setMode(next);
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`switch to ${mode === "night" ? "term" : "night"} mode`}
      title={`switch to ${mode === "night" ? "term" : "night"} mode`}
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
      {ready ? (mode === "term" ? "term ✸" : "night ◐") : "◐"}
    </button>
  );
}
