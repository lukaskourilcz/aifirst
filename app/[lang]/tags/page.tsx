import { TagChip } from "@/components/TagChip";
import { listTagsByFrequency } from "@/lib/content";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export default async function TagsIndex({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).tags;
  const tags = await listTagsByFrequency(locale);
  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">{t.kicker}</p>
      <h1>{t.title}</h1>
      <p
        style={{
          color: "var(--ink-muted)",
          maxWidth: "60ch",
          marginBottom: "3em",
        }}
      >
        {t.intro}
      </p>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {tags.map((tg) => (
          <li key={tg.tag}>
            <TagChip tag={tg.tag} count={tg.count} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}
