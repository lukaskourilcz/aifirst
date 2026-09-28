"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { SearchEntry } from "@/lib/content";
import { isEditableTarget } from "@/lib/helpers/dom";
import { useWindowEvent } from "@/lib/hooks/useWindowEvent";
import { ModalOverlay } from "./ModalOverlay";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { czechNumericDate } from "@/lib/weeks";

export type SearchTopic = { href: string; title: string };

export const SEARCH_EVENT = "dneskai:open-search" as const;

/** The 16 px magnifier used by every search control. */
export function SearchGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      <circle cx="7" cy="7" r="4" />
      <path d="m10 10 3.5 3.5" />
    </svg>
  );
}

type Props = { index: SearchEntry[]; topics: SearchTopic[]; locale: Locale };

// How well an entry matches the query: title hits weigh most, then the dek,
// then tags, then the slug. Returns 0 for no match so it can be filtered out.
function scoreEntry(entry: SearchEntry, query: string): number {
  if (!query) return 0;
  // Typeset titles carry non-breaking spaces; a typed query never does.
  const plain = (text: string) => text.replace(/\u00a0/g, " ").toLowerCase();
  const needle = plain(query);
  let points = 0;
  if (plain(entry.title).includes(needle)) points += 3;
  if (plain(entry.dek).includes(needle)) points += 2;
  if (entry.topics.some((t) => plain(t).includes(needle))) points += 1;
  if (entry.slug.toLowerCase().includes(needle)) points += 0.5;
  return points;
}

export function SearchPalette({ index, topics, locale }: Props) {
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

  // Every other search button on the page (the condensed header, the mobile
  // drawer) opens this one palette through a window event, so ⌘K never opens
  // two dialogs.
  useWindowEvent(SEARCH_EVENT, () => setOpen(true));

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
        ref={triggerRef}
        type="button"
        aria-label={t.open}
        onClick={() => setOpen(true)}
        className="control search-trigger"
      >
        <SearchGlyph />
        <span className="search-trigger__label">{t.open}</span>
        <kbd className="search-trigger__kbd" aria-hidden>⌘K</kbd>
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
              Esc
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
                {topics.length > 0 && (
                  <>
                    <p className="label label--accent search-dialog__suggestion-title">
                      {t.suggestedTags}
                    </p>
                    <div className="search-dialog__suggestions">
                      {topics.map((topic) => (
                        <Link
                          key={topic.href}
                          href={topic.href}
                          onClick={() => setOpen(false)}
                          className="chip"
                        >
                          {topic.title}
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
                    {[czechNumericDate(r.date), r.section].filter(Boolean).join(" · ")}
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
