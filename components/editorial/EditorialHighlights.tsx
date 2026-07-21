import type { Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export function EditorialHighlights({
  whyItMatters,
  whatChanged,
  locale,
}: {
  whyItMatters?: string[];
  whatChanged?: string[];
  locale: Locale;
}) {
  const t = dict(locale).article;
  const sections = [
    { title: t.whyItMatters, items: whyItMatters ?? [] },
    { title: t.whatChanged, items: whatChanged ?? [] },
  ].filter(({ items }) => items.length > 0);
  if (sections.length === 0) return null;

  return (
    <div className="editorial-highlights">
      {sections.map(({ title, items }) => (
        <section key={title} aria-labelledby={`highlight-${title.replace(/\s+/g, "-").toLowerCase()}`}>
          <h2 id={`highlight-${title.replace(/\s+/g, "-").toLowerCase()}`}>{title}</h2>
          <ul>
            {items.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}
