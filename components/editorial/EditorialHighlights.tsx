import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function EditorialHighlights({
  whyItMatters,
  whatChanged,
  uncertainty,
  locale,
}: {
  whyItMatters?: string[];
  whatChanged?: string[];
  uncertainty?: string[];
  locale: Locale;
}) {
  const t = dict(locale).article;
  const sections = [
    { key: "why", title: t.whyItMatters, items: whyItMatters ?? [] },
    { key: "changed", title: t.whatChanged, items: whatChanged ?? [] },
    { key: "uncertainty", title: t.uncertainty, items: uncertainty ?? [] },
  ].filter(({ items }) => items.length > 0);
  if (sections.length === 0) return null;

  return (
    <div className="editorial-highlights">
      {sections.map(({ key, title, items }) => (
        <section key={key} className={`editorial-highlight editorial-highlight--${key}`} aria-labelledby={`highlight-${key}`}>
          <h2 id={`highlight-${key}`}>{title}</h2>
          <ul>
            {items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}
