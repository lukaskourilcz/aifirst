"use client";

import { useEffect, useState } from "react";
import { isEditableTarget } from "@/lib/helpers/dom";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict, type Dict } from "@/lib/i18n/dictionaries";

type Shortcut = {
  keys: string[];
  label: string;
};

// The `g`-prefixed navigation chords. This list drives both the handler
// and the help overlay, so the two can't drift apart. Paths are base
// (unprefixed); the active locale is applied when navigating.
const NAV_CHORDS: Array<{
  key: string;
  path: string;
  labelKey: keyof Dict["keyboard"];
}> = [
  { key: "h", path: "/", labelKey: "goHome" },
  { key: "a", path: "/archive", labelKey: "goArchive" },
  { key: "t", path: "/tags", labelKey: "goTags" },
  { key: "s", path: "/sources", labelKey: "goSources" },
  { key: "r", path: "/trends", labelKey: "goTrends" },
  { key: "g", path: "/glossary", labelKey: "goGlossary" },
];

export function KeyboardHelp({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [chord, setChord] = useState<string | null>(null);
  const k = dict(locale).keyboard;

  const shortcuts: Shortcut[] = [
    { keys: ["⌘", "K"], label: k.openSearch },
    { keys: ["/"], label: k.openSearchNoMod },
    { keys: ["?"], label: k.toggleHelp },
    { keys: ["Esc"], label: k.closeOverlay },
    ...NAV_CHORDS.map((c) => ({
      keys: ["G", c.key.toUpperCase()],
      label: k[c.labelKey],
    })),
  ];

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
        if (match) location.assign(localePath(locale, match.path));
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
  }, [open, chord, locale]);

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
                {k.title}
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
              {shortcuts.map((s) => (
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
                    {s.keys.map((key) => (
                      <kbd
                        key={key}
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
                        {key}
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
              {k.tipBefore} <kbd style={{ padding: "2px 6px", border: "1px solid var(--hairline)" }}>g</kbd> {k.tipAfter}
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
