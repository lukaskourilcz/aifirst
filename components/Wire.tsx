import type { WireItem } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

type Props = {
  items: WireItem[];
  locale: Locale;
  // "default" — full-width panel below the article body.
  // "aside"   — compact list rendered inside the dispatches rail.
  variant?: "default" | "aside";
};

export function Wire({ items, locale, variant = "default" }: Props) {
  if (!items?.length) return null;
  const isAside = variant === "aside";
  const heading = dict(locale).article.wireHeading;
  return (
    <section
      aria-label="The wire"
      style={
        isAside
          ? {
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid var(--color-fog)",
            }
          : {
              marginTop: "var(--section-gap)",
              background: "var(--color-canvas)",
              border: "1px solid var(--color-fog)",
              borderRadius: "var(--radius-xl)",
              padding: 24,
            }
      }
    >
      <header
        style={{
          marginBottom: isAside ? 10 : 16,
          paddingBottom: isAside ? 0 : 12,
          borderBottom: isAside ? "none" : "1px solid var(--color-fog)",
        }}
      >
        <p
          className="label"
          style={{ margin: 0, color: "var(--color-slate)" }}
        >
          {heading}
        </p>
      </header>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: isAside ? "flex" : "grid",
          flexDirection: isAside ? "column" : undefined,
          gridTemplateColumns: isAside
            ? undefined
            : "repeat(auto-fill, minmax(280px, 1fr))",
          gap: isAside ? 10 : 16,
        }}
      >
        {items.slice(0, isAside ? 6 : items.length).map((item, i) => (
          <li
            key={item.url}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 10,
              alignItems: "baseline",
            }}
          >
            <span
              aria-hidden
              className="label"
              style={{
                color: "var(--color-slate)",
                minWidth: 22,
                textAlign: "right",
                fontSize: 11,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                style={{
                  fontSize: isAside ? "var(--text-caption)" : "var(--text-body-sm)",
                  fontWeight: 500,
                  lineHeight: 1.35,
                  color: "var(--color-ink-black)",
                }}
              >
                {item.title}
              </a>
              <span
                className="label label--muted"
                style={{ display: "block", marginTop: 2, fontSize: 10 }}
              >
                {item.source}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
