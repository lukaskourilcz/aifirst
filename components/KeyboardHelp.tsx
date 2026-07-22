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
  { key: "t", path: "/topics", labelKey: "goTags" },
  { key: "s", path: "/sources", labelKey: "goSources" },
  { key: "r", path: "/radar", labelKey: "goTrends" },
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
        <div aria-hidden className="keyboard-chord">
          g _
        </div>
      )}

      {open && (
        <ModalOverlay
          onClose={() => setOpen(false)}
          ariaLabel={t.title}
          align="center"
          zIndex={21}
          width={520}
        >
          <header className="keyboard-help__header">
            <span className="label label--accent">
              {t.title}
            </span>
            <kbd className="keycap label">
              esc
            </kbd>
          </header>
          <ul className="keyboard-help__list">
            {shortcuts.map((s) => (
              <li key={s.label}>
                <span className="keyboard-help__keys">
                  {s.keys.map((key) => (
                    <kbd key={key} className="keycap">
                      {key}
                    </kbd>
                  ))}
                </span>
                <span className="keyboard-help__label">{s.label}</span>
              </li>
            ))}
          </ul>
          <footer className="label keyboard-help__footer">
            {t.tipBefore}{" "}
            <kbd className="keycap">
              g
            </kbd>{" "}
            {t.tipAfter}
          </footer>
        </ModalOverlay>
      )}
    </>
  );
}
