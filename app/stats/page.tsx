import { Sparkline } from "@/components/Sparkline";
import { TagChip } from "@/components/TagChip";
import {
  listArticles,
  listTagsByFrequency,
  sourceCitationStats,
} from "@/lib/content";
import { loadSources } from "@/lib/scraping/sources";
import { groupBy } from "@/lib/helpers/group";

export const dynamic = "force-static";
export const metadata = { title: "Stats" };

function weeklyCadence(dates: string[]): { labels: string[]; counts: number[] } {
  const byMonth = groupBy([...dates].sort(), (d) => d.slice(0, 7)); // YYYY-MM
  const labels = [...byMonth.keys()];
  const counts = labels.map((k) => byMonth.get(k)?.length ?? 0);
  return { labels, counts };
}

export default async function StatsPage() {
  const [articles, tags, citations, sources] = await Promise.all([
    listArticles(),
    listTagsByFrequency(),
    sourceCitationStats(),
    loadSources(),
  ]);

  const total = articles.length;
  const cadence = weeklyCadence(articles.map((a) => a.date));
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

  const stat = (label: string, value: string) => (
    <div
      style={{
        padding: 20,
        border: "1px solid var(--hairline)",
        background: "var(--bg-deep)",
      }}
    >
      <p className="label" style={{ marginBottom: 6 }}>{label}</p>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "2.4rem",
          margin: 0,
          color: "var(--accent-cyan)",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">telemetry</p>
      <h1>Stats from the broadcast log.</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          margin: "2em 0 3em",
        }}
      >
        {stat("issues published", String(total).padStart(3, "0"))}
        {stat("avg signal", String(avgSignal).padStart(2, "0"))}
        {stat("active sources", String(sources.length).padStart(2, "0"))}
        {stat("tags in use", String(tags.length).padStart(2, "0"))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          alignItems: "start",
        }}
      >
        <section>
          <p className="label" style={{ marginBottom: 16 }}>
            cadence · issues per month
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
            top tags
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
            {tags.slice(0, 12).map((t) => (
              <li key={t.tag}>
                <TagChip tag={t.tag} count={t.count} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section style={{ marginTop: 48 }}>
        <p className="label" style={{ marginBottom: 16 }}>
          most-cited sources
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
              no citations yet.
            </li>
          )}
        </ul>
      </section>
    </section>
  );
}
