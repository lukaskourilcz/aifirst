import type { Dispatch } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

type Props = {
  items: Dispatch[];
  locale: Locale;
  // "default" — sits below the article body as a wide auto-fit grid.
  // "aside"   — runs alongside the main article column; vertical stack.
  variant?: "default" | "aside";
};

export function Dispatches({ items, locale, variant = "default" }: Props) {
  if (!items?.length) return null;
  const t = dict(locale).article;
  const isAside = variant === "aside";

  return (
    <section
      aria-label="Dispatches"
      className={isAside ? "dispatches dispatches--aside" : "dispatches"}
      style={
        isAside
          ? { margin: 0 }
          : {
              margin: "72px 0 0",
              paddingTop: 40,
              borderTop: "1px solid var(--hairline)",
            }
      }
    >
      <header style={{ marginBottom: isAside ? 14 : 24 }}>
        <p className="label label--accent" style={{ margin: 0 }}>
          {t.dispatchesLabel}
        </p>
        {!isAside && (
          <h2 style={{ margin: "6px 0 0", color: "var(--ink-primary)" }}>
            {t.dispatchesHeading}
          </h2>
        )}
      </header>
      <ul
        className={isAside ? "dispatches__list dispatches__list--aside" : "dispatches__list"}
        style={
          isAside
            ? { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }
            : {
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 24,
              }
        }
      >
        {items.map((d, i) => (
          <li
            key={i}
            style={{
              position: "relative",
              padding: isAside ? 14 : 20,
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
                width: 14,
                height: 14,
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
                width: 14,
                height: 14,
                borderBottom: "1px solid var(--accent-magenta)",
                borderRight: "1px solid var(--accent-magenta)",
              }}
            />
            <p
              className="label"
              style={{ color: "var(--accent-cyan)", marginBottom: 6, fontSize: "0.65rem" }}
            >
              {t.dispatchesLabel} · 0{i + 1}
            </p>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: isAside ? "0.9rem" : "1rem",
                lineHeight: 1.25,
                margin: "0 0 8px",
                color: "var(--ink-primary)",
              }}
            >
              {d.title}
            </h3>
            <p
              style={{
                color: "var(--ink-muted)",
                fontSize: isAside ? "0.85rem" : "0.95rem",
                margin: 0,
              }}
            >
              {d.body}
            </p>
            {d.source_url && (
              <p style={{ margin: "10px 0 0" }}>
                <a
                  href={d.source_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="label"
                  style={{ color: "var(--accent-cyan)", fontSize: "0.65rem" }}
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
