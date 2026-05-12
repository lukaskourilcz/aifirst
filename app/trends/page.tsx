import { TrendsChart } from "@/components/TrendsChart";
import { TagChip } from "@/components/TagChip";
import { listArticles } from "@/lib/content";
import { buildTrends } from "@/lib/trends";

export const dynamic = "force-static";
export const metadata = { title: "Trends" };

export default async function TrendsPage() {
  const articles = await listArticles();
  const matrix = buildTrends(articles, 8);

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">trends</p>
      <h1>What the magazine has been looking at.</h1>
      <p
        style={{
          color: "var(--ink-muted)",
          maxWidth: "62ch",
          marginBottom: "2.5em",
        }}
      >
        The top {matrix.tags.length} tags from the past {matrix.months.length}{" "}
        month{matrix.months.length === 1 ? "" : "s"}, stacked. Heights show
        how many issues touched each tag. Hover a segment for the exact
        count.
      </p>

      <div
        style={{
          padding: 20,
          border: "1px solid var(--hairline)",
          background: "var(--bg-deep)",
        }}
      >
        <TrendsChart matrix={matrix} />
      </div>

      <section style={{ marginTop: 48 }}>
        <p className="label" style={{ marginBottom: 16 }}>
          jump to a tag
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
          {matrix.tags.map((t) => (
            <li key={t}>
              <TagChip tag={t} />
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
