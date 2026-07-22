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
        <p className="eyebrow dispatches__eyebrow">
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
      <header className="dispatches__header">
        <p className="label">{t.dispatchesLabel}</p>
        <h2>{t.dispatchesHeading}</h2>
      </header>
      <ul className="dispatches__grid">
        {items.map((d, i) => (
          <li key={i}>
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
