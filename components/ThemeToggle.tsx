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
        color: "var(--color-folio-black)",
        border: "0",
        padding: "0",
        cursor: "pointer",
        fontFamily: "var(--font-chrome)",
      }}
    >
      {ready ? (mode === "dark" ? "Dark" : "Light") : "·"}
    </button>
  );
}
