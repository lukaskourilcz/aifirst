import { SourceCard } from "@/components/SourceCard";
import { sourceCitationStats } from "@/lib/content";
import { loadSources } from "@/lib/scraping/sources";

export const dynamic = "force-static";
export const metadata = { title: "Sources" };

export default async function SourcesPage() {
  const [sources, stats] = await Promise.all([
    loadSources(),
    sourceCitationStats(),
  ]);

  const sorted = [...sources].sort(
    (a, b) => (b.weight ?? 0.5) - (a.weight ?? 0.5) || a.id.localeCompare(b.id),
  );

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">registry</p>
      <h1>The sources.</h1>
      <p style={{ color: "var(--ink-muted)", maxWidth: "62ch" }}>
        Every feed the daily pipeline reads. Weight is the editorial prior the
        curator uses, not a quality verdict. Citation counts are the number of
        published issues that drew from each source.
      </p>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "3em 0 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {sorted.map((s) => {
          const stat = stats.get(s.id);
          return (
            <li key={s.id}>
              <SourceCard
                id={s.id}
                name={s.name}
                type={s.type}
                weight={s.weight ?? 0.5}
                tags={s.tags ?? []}
                citations={stat?.count ?? 0}
                latestDate={stat?.latestDate ?? null}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
