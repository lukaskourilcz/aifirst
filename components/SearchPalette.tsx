"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SearchEntry } from "@/lib/content";
import { isEditableTarget } from "@/lib/helpers/dom";
import { useWindowEvent } from "@/lib/hooks/useWindowEvent";
import { ModalOverlay } from "./ModalOverlay";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

type Props = { index: SearchEntry[]; locale: Locale };

// How well an entry matches the query: title hits weigh most, then the dek,
// then tags, then the slug. Returns 0 for no match so it can be filtered out.
function scoreEntry(entry: SearchEntry, query: string): number {
  if (!query) return 0;
  const needle = query.toLowerCase();
  let points = 0;
  if (entry.title.toLowerCase().includes(needle)) points += 3;
  if (entry.dek.toLowerCase().includes(needle)) points += 2;
  if (entry.tags.some((t) => t.toLowerCase().includes(needle))) points += 1;
  if (entry.slug.toLowerCase().includes(needle)) points += 0.5;
  return points;
}

export function SearchPalette({ index, locale }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const t = dict(locale).search;

  // ⌘/Ctrl-K toggles the palette anywhere; "/" opens it unless the user is
  // typing in a field. (Escape-to-close is handled by ModalOverlay.)
  useWindowEvent("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen((v) => !v);
    } else if (e.key === "/" && !open && !isEditableTarget(e.target)) {
      e.preventDefault();
      setOpen(true);
    }
  });

  const results = useMemo(() => {
    if (!query.trim()) return index.slice(0, 8);
    return index
      .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || (a.entry.date < b.entry.date ? 1 : -1))
      .slice(0, 12)
      .map((r) => r.entry);
  }, [query, index]);

  return (
    <>
      <button
        type="button"
        aria-label="open search"
        onClick={() => setOpen(true)}
        className="label"
        style={{
          background: "transparent",
          color: "var(--ink-muted)",
          border: "1px solid var(--hairline)",
          padding: "6px 12px",
          cursor: "pointer",
          fontFamily: "var(--font-display)",
        }}
      >
        {t.open} · <span style={{ color: "var(--accent-cyan)" }}>⌘K</span>
      </button>

      {open && (
        <ModalOverlay
          onClose={() => setOpen(false)}
          ariaLabel="search"
          align="start"
          zIndex={20}
          width={640}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            <span className="label" style={{ color: "var(--accent-cyan)" }}>
              query &gt;
            </span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--ink-primary)",
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
              }}
            />
            <kbd
              className="label"
              style={{ border: "1px solid var(--hairline)", padding: "2px 8px" }}
            >
              esc
            </kbd>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {results.length === 0 && (
              <li className="label" style={{ padding: 16, color: "var(--ink-dim)" }}>
                {t.noMatch}
              </li>
            )}
            {results.map((r) => (
              <li key={r.slug} style={{ borderBottom: "1px solid var(--hairline)" }}>
                <Link
                  href={localePath(locale, `/articles/${r.slug}`)}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "12px 16px",
                    borderBottom: "none",
                    color: "var(--ink-primary)",
                  }}
                >
                  <p className="label" style={{ marginBottom: 4 }}>
                    {r.date} · {r.tags.slice(0, 2).join(" · ")}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-display)",
                      fontSize: "0.95rem",
                    }}
                  >
                    {r.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </ModalOverlay>
      )}
    </>
  );
}
