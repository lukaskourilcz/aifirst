import { SourceCard } from "@/components/SourceCard";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { sourceCitationStats, sourceCitationsByMonth } from "@/lib/content";
import { loadSources } from "@/lib/scraping/sources";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localeAlternates } from "@/lib/i18n/metadata";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(lang).sources;
  return { title: t.title, description: t.intro, alternates: localeAlternates(lang, "/sources") };
}

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const t = dict(locale).sources;
  const [sources, stats, cadence] = await Promise.all([
    loadSources(),
    sourceCitationStats(locale),
    sourceCitationsByMonth(6, locale),
  ]);

  const sorted = [...sources].sort(
    (a, b) => (b.weight ?? 0.5) - (a.weight ?? 0.5) || a.id.localeCompare(b.id),
  );

  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      <ul className="source-directory">
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
                cadence={cadence.get(s.id)}
                locale={locale}
              />
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
