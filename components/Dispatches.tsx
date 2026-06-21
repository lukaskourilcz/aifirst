import type { Dispatch } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

type Props = {
  items: Dispatch[];
  locale: Locale;
  // "default" — appears below the article body as an auto-fit grid.
  // "aside"   — sticky rail beside the article column; vertical stack.
  variant?: "default" | "aside";
};

export function Dispatches({ items, locale, variant = "default" }: Props) {
  if (!items?.length) return null;
  const t = dict(locale).article;
  const isAside = variant === "aside";

  return (
    <section aria-label="Dispatches" className={isAside ? "dispatches--aside" : "dispatches"}>
      <header style={{ marginBottom: 16 }}>
        <p className="label" style={{ margin: 0 }}>{t.dispatchesLabel}</p>
        {!isAside && (
          <h2 style={{ marginTop: 6, marginBottom: 0 }}>{t.dispatchesHeading}</h2>
        )}
      </header>
      <ul
        style={
          isAside
            ? { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 24 }
            : {
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 32,
              }
        }
      >
        {items.map((d, i) => (
          <li
            key={i}
            style={{
              borderTop: i === 0 ? "none" : "1px solid var(--color-rule-gray)",
              paddingTop: i === 0 ? 0 : 24,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <p className="tile__eyebrow">{t.dispatchesLabel} · 0{i + 1}</p>
            <h3 className="tile__title">{d.title}</h3>
            <p className="tile__body">{d.body}</p>
            {d.source_url && (
              <p className="tile__meta">
                <a
                  href={d.source_url}
                  target="_blank"
                  rel="noreferrer noopener"
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
