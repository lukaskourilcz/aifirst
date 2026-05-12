"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SearchEntry } from "@/lib/content";

type Props = { index: SearchEntry[] };

function score(entry: SearchEntry, q: string): number {
  if (!q) return 0;
  const needle = q.toLowerCase();
  let s = 0;
  if (entry.title.toLowerCase().includes(needle)) s += 3;
  if (entry.dek.toLowerCase().includes(needle)) s += 2;
  if (entry.tags.some((t) => t.toLowerCase().includes(needle))) s += 1;
  if (entry.slug.toLowerCase().includes(needle)) s += 0.5;
  return s;
}

export function SearchPalette({ index }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !open && !inField) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const results = useMemo(() => {
    if (!q.trim()) return index.slice(0, 8);
    return index
      .map((e) => ({ e, s: score(e, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || (a.e.date < b.e.date ? 1 : -1))
      .slice(0, 12)
      .map((r) => r.e);
  }, [q, index]);

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
        search · <span style={{ color: "var(--accent-cyan)" }}>⌘K</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="search"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 20,
            background: "rgba(5, 7, 13, 0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "10vh 24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(640px, 100%)",
              border: "1px solid var(--hairline-strong)",
              background: "var(--bg-deep)",
              boxShadow: "0 30px 80px -20px rgba(92, 240, 255, 0.25)",
            }}
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
              <span
                className="label"
                style={{ color: "var(--accent-cyan)" }}
              >
                query &gt;
              </span>
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="title, dek, tag, slug…"
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
                style={{
                  border: "1px solid var(--hairline)",
                  padding: "2px 8px",
                }}
              >
                esc
              </kbd>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {results.length === 0 && (
                <li
                  className="label"
                  style={{ padding: 16, color: "var(--ink-dim)" }}
                >
                  no transmissions match.
                </li>
              )}
              {results.map((r) => (
                <li
                  key={r.slug}
                  style={{ borderBottom: "1px solid var(--hairline)" }}
                >
                  <Link
                    href={`/articles/${r.slug}`}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "block",
                      padding: "12px 16px",
                      borderBottom: "none",
                      color: "var(--ink-primary)",
                    }}
                  >
                    <p
                      className="label"
                      style={{ marginBottom: 4 }}
                    >
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
          </div>
        </div>
      )}
    </>
  );
}
