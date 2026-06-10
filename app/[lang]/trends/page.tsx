import { TrendsChart } from "@/components/TrendsChart";
import { TagChip } from "@/components/TagChip";
import { listArticles } from "@/lib/content";
import { buildTrends } from "@/lib/trends";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export default async function TrendsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).trends;
  const articles = await listArticles(locale);
  const matrix = buildTrends(articles, 8);

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">{t.kicker}</p>
      <h1>{t.title}</h1>
      <p
        style={{
          color: "var(--ink-muted)",
          maxWidth: "62ch",
          marginBottom: "2.5em",
        }}
      >
        {t.introBefore} {matrix.tags.length} {t.introMiddle}{" "}
        {matrix.months.length} {t.month}
        {t.introAfter}
      </p>

      <div
        style={{
          padding: 20,
          border: "1px solid var(--hairline)",
          background: "var(--bg-deep)",
        }}
      >
        <TrendsChart matrix={matrix} locale={locale} />
      </div>

      <section style={{ marginTop: 48 }}>
        <p className="label" style={{ marginBottom: 16 }}>
          {t.jumpToTag}
        </p>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {matrix.tags.map((tg) => (
            <li key={tg}>
              <TagChip tag={tg} locale={locale} />
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
