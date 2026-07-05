"use client";

import { useCallback, useEffect, useState } from "react";
import { useWindowEvent } from "@/lib/hooks/useWindowEvent";

export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  // Portion of the page scrolled, 0–100.
  const update = useCallback(() => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    setPct(
      scrollable > 0
        ? Math.min(100, Math.max(0, (doc.scrollTop / scrollable) * 100))
        : 0,
    );
  }, []);

  useWindowEvent(["scroll", "resize"], update, { passive: true });
  useEffect(update, [update]); // measure once on mount

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 11,
        pointerEvents: "none",
        background: "var(--color-stone)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "var(--color-blueprint-blue)",
          transition: "width 80ms linear",
        }}
      />
    </div>
  );
}
