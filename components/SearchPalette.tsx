"use client";

import { useMemo, useRef, useState } from "react";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
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

  // Top tags used across the archive — surfaced as launchers when the query
  // returns nothing (or on a fresh open) so the palette doubles as browse.
  const suggestedTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of index) {
      for (const tag of entry.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [index]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={t.open}
        title={t.open}
        onClick={() => setOpen(true)}
        className="nav-item"
        style={{
          background: "transparent",
          border: 0,
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
        }}
      >
        <span aria-hidden className="nav-item__glyph">
          <svg
            width={16}
            height={16}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="7" cy="7" r="4" />
            <path d="m10 10 3.5 3.5" />
          </svg>
        </span>
        <span className="nav-item__label">{t.open}</span>
      </button>

      {open && (
        <ModalOverlay
          onClose={() => setOpen(false)}
          ariaLabel={t.open}
          align="start"
          zIndex={20}
          width={640}
          returnFocusRef={triggerRef}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderBottom: "1px solid var(--color-fog)",
            }}
          >
            <span className="label" style={{ color: "var(--color-blueprint-blue)" }}>
              query &gt;
            </span>
            <input
              autoFocus
              aria-label={t.placeholder}
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
              style={{ border: "1px solid var(--color-fog)", padding: "2px 8px" }}
            >
              esc
            </kbd>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {results.length === 0 && (
              <li style={{ padding: "16px 16px 8px" }}>
                <p
                  className="label"
                  style={{ marginBottom: 12, color: "var(--ink-dim)" }}
                >
                  {t.noMatch}
                </p>
                {suggestedTags.length > 0 && (
                  <>
                    <p
                      className="label"
                      style={{
                        marginBottom: 8,
                        color: "var(--color-blueprint-blue)",
                      }}
                    >
                      {t.suggestedTags}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      {suggestedTags.map((tag) => (
                        <Link
                          key={tag}
                          href={localePath(locale, `/tags/${tag}`)}
                          onClick={() => setOpen(false)}
                          className="chip"
                          style={{ borderBottom: "none" }}
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </li>
            )}
            {results.map((r) => (
              <li key={r.slug} style={{ borderBottom: "1px solid var(--color-fog)" }}>
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
