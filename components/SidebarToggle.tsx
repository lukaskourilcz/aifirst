"use client";

import { useEffect, useState } from "react";

// Collapses the sidebar to an icon-only rail. State is mirrored into a
// `data-sidebar` attribute on the <html> element so CSS can drive the
// collapse, and persisted to localStorage so the choice survives reloads.
// A pre-paint script in app/layout.tsx applies the saved value before
// React mounts, so there's no flash of the expanded sidebar on hard reload.
type Mode = "rail" | "open";

function readMode(): Mode {
  return document.documentElement.dataset.sidebar === "rail" ? "rail" : "open";
}

export function SidebarToggle() {
  const [mode, setMode] = useState<Mode>("open");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMode(readMode());
    setReady(true);
  }, []);

  function toggle() {
    const next: Mode = mode === "open" ? "rail" : "open";
    if (next === "rail") {
      document.documentElement.dataset.sidebar = "rail";
    } else {
      delete document.documentElement.dataset.sidebar;
    }
    try {
      localStorage.setItem("sidebar", next);
    } catch {}
    setMode(next);
  }

  const aria =
    mode === "open" ? "Collapse sidebar to icons" : "Expand sidebar";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={aria}
      title={aria}
      className="sidebar__toggle"
    >
      <span aria-hidden>{ready ? (mode === "open" ? "⟨" : "⟩") : "·"}</span>
    </button>
  );
}
