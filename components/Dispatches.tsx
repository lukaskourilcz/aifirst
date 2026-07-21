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

  if (isAside) {
    return (
      <>
        <p className="eyebrow" style={{ marginBottom: 12 }}>
          {t.dispatchesLabel}
        </p>
        <div className="dispatches--aside">
          {items.slice(0, 6).map((d, i) => (
            <article key={i} className="dispatch-card">
              <p className="dispatch-card__eyebrow">
                {t.dispatchesLabel} · 0{i + 1}
              </p>
              <h3 className="dispatch-card__title">{d.title}</h3>
              <p className="dispatch-card__body">{d.body}</p>
              {d.source_url && (
                <a
                  href={d.source_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="dispatch-card__source"
                >
                  {t.dispatchSource} ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </>
    );
  }

  return (
    <section aria-label={t.dispatchesLabel} className="dispatches">
      <header style={{ marginBottom: 16 }}>
        <p className="label" style={{ margin: 0 }}>{t.dispatchesLabel}</p>
        <h2 style={{ marginTop: 6, marginBottom: 0 }}>{t.dispatchesHeading}</h2>
      </header>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 32,
        }}
      >
        {items.map((d, i) => (
          <li
            key={i}
            style={{
              borderTop: i === 0 ? "none" : "1px solid var(--color-fog)",
              paddingTop: i === 0 ? 0 : 24,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <p className="dispatch-card__eyebrow">{t.dispatchesLabel} · 0{i + 1}</p>
            <h3 className="dispatch-card__title">{d.title}</h3>
            <p className="dispatch-card__body">{d.body}</p>
            {d.source_url && (
              <a
                href={d.source_url}
                target="_blank"
                rel="noreferrer noopener"
                className="dispatch-card__source"
              >
                {t.dispatchSource} ↗
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
