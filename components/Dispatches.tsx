import type { Dispatch } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function Dispatches({ items, locale }: { items: Dispatch[]; locale: Locale }) {
  if (!items?.length) return null;
  const t = dict(locale).article;
  return (
    <section
      aria-label="Dispatches"
      style={{
        margin: "72px 0 0",
        paddingTop: 40,
        borderTop: "1px solid var(--hairline)",
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <p className="label label--accent" style={{ margin: 0 }}>
          {t.dispatchesLabel}
        </p>
        <h2 style={{ margin: "6px 0 0", color: "var(--ink-primary)" }}>
          {t.dispatchesHeading}
        </h2>
      </header>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
        }}
      >
        {items.map((d, i) => (
          <li
            key={i}
            style={{
              position: "relative",
              padding: 20,
              border: "1px solid var(--hairline)",
              background: "var(--surface-soft)",
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: -1,
                left: -1,
                width: 16,
                height: 16,
                borderTop: "1px solid var(--accent-cyan)",
                borderLeft: "1px solid var(--accent-cyan)",
              }}
            />
            <span
              aria-hidden
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 16,
                height: 16,
                borderBottom: "1px solid var(--accent-magenta)",
                borderRight: "1px solid var(--accent-magenta)",
              }}
            />
            <p
              className="label"
              style={{ color: "var(--accent-cyan)", marginBottom: 8 }}
            >
              {t.dispatchesLabel} · 0{i + 1}
            </p>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1rem",
                lineHeight: 1.25,
                margin: "0 0 12px",
                color: "var(--ink-primary)",
              }}
            >
              {d.title}
            </h3>
            <p
              style={{
                color: "var(--ink-muted)",
                fontSize: "0.95rem",
                margin: 0,
              }}
            >
              {d.body}
            </p>
            {d.source_url && (
              <p style={{ margin: "12px 0 0" }}>
                <a
                  href={d.source_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="label"
                  style={{ color: "var(--accent-cyan)" }}
                >
                  {t.dispatchSource} ↗
                </a>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
