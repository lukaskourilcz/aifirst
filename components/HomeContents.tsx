import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

type Entry = { id: string; label: string };

type Props = {
  hasDispatches: boolean;
  hasWire: boolean;
  hasGlossary: boolean;
  hasSources: boolean;
  locale: Locale;
};

export function HomeContents({
  hasDispatches,
  hasWire,
  hasGlossary,
  hasSources,
  locale,
}: Props) {
  const t = dict(locale).home;
  const entries: Entry[] = [{ id: "briefing", label: t.briefing }];
  if (hasDispatches) entries.push({ id: "dispatches", label: t.dispatches });
  if (hasWire) entries.push({ id: "wire", label: t.wire });
  if (hasGlossary) entries.push({ id: "glossary", label: t.glossary });
  if (hasSources) entries.push({ id: "sources", label: t.sources });

  return (
    <nav
      aria-label={t.contents}
      className="container home-contents"
      style={{ paddingTop: 16, paddingBottom: 16 }}
    >
      <p className="label" style={{ margin: 0 }}>{t.contents}</p>
      <ol className="home-contents__list">
        {entries.map((e, i) => (
          <li key={e.id} className="home-contents__item">
            <a href={`#${e.id}`} className="home-contents__link">
              <span aria-hidden className="home-contents__num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{e.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
