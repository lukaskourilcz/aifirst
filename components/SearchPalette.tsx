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
        className="nav-item nav-item--button"
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
          <div className="search-dialog__query">
            <span className="label label--accent">{t.open}</span>
            <input
              autoFocus
              aria-label={t.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className="search-dialog__input"
            />
            <kbd className="keycap label">
              esc
            </kbd>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {locale === "cs" ? `${results.length} výsledků` : `${results.length} results`}
          </p>
          <ul className="search-dialog__results">
            {results.length === 0 && (
              <li className="search-dialog__empty">
                <p className="label label--muted">
                  {t.noMatch}
                </p>
                {suggestedTags.length > 0 && (
                  <>
                    <p className="label label--accent search-dialog__suggestion-title">
                      {t.suggestedTags}
                    </p>
                    <div className="search-dialog__suggestions">
                      {suggestedTags.map((tag) => (
                        <Link
                          key={tag}
                          href={localePath(locale, `/tags/${tag}`)}
                          onClick={() => setOpen(false)}
                          className="chip"
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
              <li key={r.slug} className="search-dialog__result">
                <Link
                  href={localePath(locale, `/articles/${r.slug}`)}
                  onClick={() => setOpen(false)}
                  className="search-dialog__result-link"
                >
                  <p className="label search-dialog__result-meta">
                    {r.date} · {r.tags.slice(0, 2).join(" · ")}
                  </p>
                  <p className="search-dialog__result-title">
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
