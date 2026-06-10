import { SourceCard } from "@/components/SourceCard";
import { sourceCitationStats } from "@/lib/content";
import { loadSources } from "@/lib/scraping/sources";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).sources;
  const [sources, stats] = await Promise.all([
    loadSources(),
    sourceCitationStats(locale),
  ]);

  const sorted = [...sources].sort(
    (a, b) => (b.weight ?? 0.5) - (a.weight ?? 0.5) || a.id.localeCompare(b.id),
  );

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">{t.kicker}</p>
      <h1>{t.title}</h1>
      <p style={{ color: "var(--ink-muted)", maxWidth: "62ch" }}>{t.intro}</p>

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
                locale={locale}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
