import { Sparkline } from "@/components/Sparkline";
import { StatCard } from "@/components/StatCard";
import { TagChip } from "@/components/TagChip";
import { PageShell } from "@/components/PageShell";
import {
  listArticles,
  listTagsByFrequency,
  sourceCitationStats,
} from "@/lib/content";
import { loadSources } from "@/lib/scraping/sources";
import { groupBy } from "@/lib/helpers/group";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

function publishingCadence(dates: string[]): {
  labels: string[];
  counts: number[];
} {
  const byMonth = groupBy([...dates].sort(), (d) => d.slice(0, 7)); // YYYY-MM
  const labels = [...byMonth.keys()];
  const counts = labels.map((k) => byMonth.get(k)?.length ?? 0);
  return { labels, counts };
}

export default async function StatsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).stats;
  const [articles, tags, citations, sources] = await Promise.all([
    listArticles(locale),
    listTagsByFrequency(locale),
    sourceCitationStats(locale),
    loadSources(),
  ]);

  const total = articles.length;
  const cadence = publishingCadence(articles.map((a) => a.date));
  const avgSignal =
    articles.length > 0
      ? Math.round(
          articles.reduce((acc, a) => acc + (a.signal_strength ?? 0), 0) /
            articles.length,
        )
      : 0;

  const topSources = [...citations.values()]
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id))
    .slice(0, 8);
  const sourceById = new Map(sources.map((s) => [s.id, s]));

  return (
    <PageShell kicker={t.kicker} title={t.title}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          margin: "2em 0 3em",
        }}
      >
        <StatCard
          label={t.issuesPublished}
          value={String(total).padStart(3, "0")}
          valueSize="2.4rem"
          padding={20}
        />
        <StatCard
          label={t.avgSignal}
          value={String(avgSignal).padStart(2, "0")}
          valueSize="2.4rem"
          padding={20}
        />
        <StatCard
          label={t.activeSources}
          value={String(sources.length).padStart(2, "0")}
          valueSize="2.4rem"
          padding={20}
        />
        <StatCard
          label={t.tagsInUse}
          value={String(tags.length).padStart(2, "0")}
          valueSize="2.4rem"
          padding={20}
        />
      </div>

      <div className="split-2">
        <section>
          <p className="label" style={{ marginBottom: 16 }}>
            {t.cadence}
          </p>
          <div
            style={{
              padding: 16,
              border: "1px solid var(--hairline)",
              background: "var(--bg-deep)",
            }}
          >
            <Sparkline
              data={cadence.counts.length ? cadence.counts : [0]}
              width={420}
              height={80}
            />
            <p
              className="label"
              style={{ margin: "12px 0 0", color: "var(--ink-dim)" }}
            >
              {cadence.labels.join("  ·  ") || "—"}
            </p>
          </div>
        </section>

        <section>
          <p className="label" style={{ marginBottom: 16 }}>
            {t.topTags}
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 16,
              margin: 0,
              border: "1px solid var(--hairline)",
              background: "var(--bg-deep)",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {tags.slice(0, 12).map((tg) => (
              <li key={tg.tag}>
                <TagChip tag={tg.tag} count={tg.count} locale={locale} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section style={{ marginTop: 48 }}>
        <p className="label" style={{ marginBottom: 16 }}>
          {t.mostCited}
        </p>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            border: "1px solid var(--hairline)",
            background: "var(--bg-deep)",
          }}
        >
          {topSources.map((s) => {
            const meta = sourceById.get(s.id);
            return (
              <li
                key={s.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  alignItems: "baseline",
                  gap: 16,
                  padding: "12px 16px",
                  borderTop: "1px solid var(--hairline)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--ink-primary)",
                  }}
                >
                  {meta?.name ?? s.id}
                </span>
                <span className="label">{meta?.type ?? "?"}</span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--accent-cyan)",
                  }}
                >
                  ×{s.count}
                </span>
              </li>
            );
          })}
          {topSources.length === 0 && (
            <li
              className="label"
              style={{ padding: 16, color: "var(--ink-dim)" }}
            >
              {t.noCitations}
            </li>
          )}
        </ul>
      </section>
    </PageShell>
  );
}
