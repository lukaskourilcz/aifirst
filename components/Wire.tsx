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
      aria-label={heading}
      className={isAside ? "wire wire--aside" : "wire"}
    >
      <header className="wire__header">
        <p className="label">
          {heading}
        </p>
      </header>
      <ul className="wire__list">
        {items.slice(0, isAside ? 6 : items.length).map((item, i) => (
          <li key={item.url}>
            <span aria-hidden className="label wire__number">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="wire__link"
              >
                {item.title}
              </a>
              <span className="label label--muted wire__source">
                {item.source}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
