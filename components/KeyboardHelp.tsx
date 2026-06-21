"use client";

import { useEffect, useRef, useState } from "react";
import { isEditableTarget } from "@/lib/helpers/dom";
import { useWindowEvent } from "@/lib/hooks/useWindowEvent";
import { ModalOverlay } from "./ModalOverlay";
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
  { key: "g", path: "/glossary", labelKey: "goGlossary" },
];

// How long a pending `g` chord waits for its second key before resetting.
const CHORD_TIMEOUT_MS = 1500;

export function KeyboardHelp({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const [chord, setChord] = useState<string | null>(null);
  const chordTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = dict(locale).keyboard;

  const shortcuts: Shortcut[] = [
    { keys: ["⌘", "K"], label: t.openSearch },
    { keys: ["/"], label: t.openSearchNoMod },
    { keys: ["?"], label: t.toggleHelp },
    { keys: ["Esc"], label: t.closeOverlay },
    ...NAV_CHORDS.map((c) => ({
      keys: ["G", c.key.toUpperCase()],
      label: t[c.labelKey],
    })),
  ];

  function clearChord() {
    setChord(null);
    if (chordTimer.current) clearTimeout(chordTimer.current);
    chordTimer.current = null;
  }

  useWindowEvent("keydown", (e) => {
    if (isEditableTarget(e.target)) return;

    if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      setOpen((v) => !v);
      return;
    }

    // Second key of a `g` chord: navigate if it maps to a destination.
    if (chord === "g") {
      clearChord();
      const match = NAV_CHORDS.find((c) => c.key === e.key.toLowerCase());
      if (match) location.assign(localePath(locale, match.path));
      return;
    }

    // First key of a `g` chord: arm it and wait for the second key.
    if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      setChord("g");
      chordTimer.current = setTimeout(clearChord, CHORD_TIMEOUT_MS);
    }
  });

  // Drop any pending chord timer when the component unmounts.
  useEffect(
    () => () => {
      if (chordTimer.current) clearTimeout(chordTimer.current);
    },
    [],
  );

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
        <ModalOverlay
          onClose={() => setOpen(false)}
          ariaLabel="keyboard shortcuts"
          align="center"
          zIndex={21}
          width={520}
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
            <span className="label" style={{ color: "var(--accent-cyan)" }}>
              {t.title}
            </span>
            <kbd
              className="label"
              style={{ border: "1px solid var(--hairline)", padding: "2px 8px" }}
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
                <span style={{ display: "inline-flex", gap: 4 }}>
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
                <span style={{ color: "var(--ink-muted)" }}>{s.label}</span>
              </li>
            ))}
          </ul>
          <footer
            style={{ padding: "10px 16px", color: "var(--ink-dim)" }}
            className="label"
          >
            {t.tipBefore}{" "}
            <kbd style={{ padding: "2px 6px", border: "1px solid var(--hairline)" }}>
              g
            </kbd>{" "}
            {t.tipAfter}
          </footer>
        </ModalOverlay>
      )}
    </>
  );
}
