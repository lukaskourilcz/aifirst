import type { WireItem } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function Wire({ items, locale }: { items: WireItem[]; locale: Locale }) {
  if (!items?.length) return null;
  return (
    <section
      aria-label="The wire"
      style={{
        margin: "64px 0",
        paddingTop: 24,
        borderTop: "1px solid var(--color-folio-black)",
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <p className="label" style={{ margin: 0 }}>
          {dict(locale).article.wireHeading}
        </p>
      </header>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          rowGap: 0,
          columnGap: 32,
        }}
      >
        {items.map((item, i) => (
          <li
            key={item.url}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 12,
              alignItems: "baseline",
              padding: "12px 0",
              borderTop: "1px solid var(--color-rule-gray)",
            }}
          >
            <span
              aria-hidden
              className="label"
              style={{ color: "var(--color-mute-gray)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                style={{ borderBottom: "1px solid var(--color-rule-gray)" }}
              >
                {item.title}
              </a>
              <span
                className="label label--muted"
                style={{ display: "block", marginTop: 4 }}
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
