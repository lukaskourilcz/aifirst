"use client";

import { useEffect, useState } from "react";
import { isEditableTarget } from "@/lib/helpers/dom";

type Shortcut = {
  keys: string[];
  label: string;
};

// The `g`-prefixed navigation chords. This list drives both the handler
// and the help overlay, so the two can't drift apart.
const NAV_CHORDS: Array<{ key: string; path: string; label: string }> = [
  { key: "h", path: "/", label: "go home" },
  { key: "a", path: "/archive", label: "go to archive" },
  { key: "t", path: "/tags", label: "go to tags" },
  { key: "s", path: "/sources", label: "go to sources" },
  { key: "r", path: "/trends", label: "go to trends" },
  { key: "g", path: "/glossary", label: "go to glossary" },
];

const SHORTCUTS: Shortcut[] = [
  { keys: ["⌘", "K"], label: "open search palette" },
  { keys: ["/"], label: "open search palette (no modifier)" },
  { keys: ["?"], label: "toggle this help overlay" },
  { keys: ["Esc"], label: "close any overlay" },
  ...NAV_CHORDS.map((c) => ({
    keys: ["G", c.key.toUpperCase()],
    label: c.label,
  })),
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);
  const [chord, setChord] = useState<string | null>(null);

  useEffect(() => {
    let chordTimer: ReturnType<typeof setTimeout> | null = null;

    function clearChord() {
      setChord(null);
      if (chordTimer) clearTimeout(chordTimer);
      chordTimer = null;
    }

    function onKey(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;

      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        return;
      }

      // `g` chord navigation
      if (chord === "g") {
        clearChord();
        const match = NAV_CHORDS.find((c) => c.key === e.key.toLowerCase());
        if (match) location.assign(match.path);
        return;
      }
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setChord("g");
        chordTimer = setTimeout(clearChord, 1500);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (chordTimer) clearTimeout(chordTimer);
    };
  }, [open, chord]);

  return (
    <>
      {chord && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            zIndex: 19,
            padding: "6px 10px",
            border: "1px solid var(--hairline-strong)",
            background: "var(--bg-deep)",
            fontFamily: "var(--font-display)",
            fontSize: "0.75rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--accent-cyan)",
          }}
        >
          g _
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="keyboard shortcuts"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 21,
            background: "rgba(5, 7, 13, 0.72)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10vh 24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              border: "1px solid var(--hairline-strong)",
              background: "var(--bg-deep)",
              boxShadow:
                "0 30px 80px -20px rgba(92, 240, 255, 0.25)",
            }}
          >
            <header
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--hairline)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                className="label"
                style={{ color: "var(--accent-cyan)" }}
              >
                keyboard shortcuts
              </span>
              <kbd
                className="label"
                style={{
                  border: "1px solid var(--hairline)",
                  padding: "2px 8px",
                }}
              >
                esc
              </kbd>
            </header>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {SHORTCUTS.map((s) => (
                <li
                  key={s.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    gap: 16,
                    alignItems: "center",
                    padding: "10px 16px",
                    borderBottom: "1px solid var(--hairline)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      gap: 4,
                    }}
                  >
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.75rem",
                          padding: "2px 8px",
                          border: "1px solid var(--hairline)",
                          background: "var(--bg-elev)",
                          color: "var(--ink-primary)",
                          minWidth: 24,
                          textAlign: "center",
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                  <span style={{ color: "var(--ink-muted)" }}>
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>
            <footer
              style={{
                padding: "10px 16px",
                color: "var(--ink-dim)",
              }}
              className="label"
            >
              tip · press <kbd style={{ padding: "2px 6px", border: "1px solid var(--hairline)" }}>g</kbd> then a letter to navigate
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
