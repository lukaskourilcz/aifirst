import type { WireItem } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function Wire({ items, locale }: { items: WireItem[]; locale: Locale }) {
  if (!items?.length) return null;
  return (
    <section
      aria-label="The wire"
      style={{
        marginTop: 48,
        background: "var(--color-canvas)",
        border: "1px solid var(--color-fog)",
        borderRadius: "var(--radius-xl)",
        padding: 24,
      }}
    >
      <header
        className="section-head"
        style={{ marginBottom: 16, paddingBottom: 12 }}
      >
        <h2 className="section-head__title">
          {dict(locale).article.wireHeading}
        </h2>
      </header>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {items.map((item, i) => (
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
                minWidth: 24,
                textAlign: "right",
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
                  fontSize: "var(--text-body-sm)",
                  fontWeight: 500,
                  color: "var(--color-ink-black)",
                }}
              >
                {item.title}
              </a>
              <span
                className="label label--muted"
                style={{ display: "block", marginTop: 2, fontSize: 11 }}
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
