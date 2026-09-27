import { SourceCard } from "@/components/SourceCard";
import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { sourceCitationStats } from "@/lib/content";
import { loadSources } from "@/lib/sources";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { localeAlternates } from "@/lib/i18n/metadata";
import { sourceClass, sourceName } from "@/lib/labels";

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
  const sources = await loadSources();
  const stats = await sourceCitationStats(sources, locale);

  // Three groups in a fixed order instead of the old weight ranking, which
  // was the collector's prior and read like a quality verdict.
  const groups = (["primary", "reporting", "community"] as const).map((key) => ({
    key,
    heading: t.groups[key],
    classLabel: t.classes[key],
    sources: sources
      .filter((source) => sourceClass(source.tags) === key)
      .sort((a, b) => a.name.localeCompare(b.name, "cs")),
  }));

  return (
    <PageShell kicker={t.kicker} title={t.title} intro={t.intro}>
      {groups.filter((group) => group.sources.length > 0).map((group) => (
        <section key={group.key} className="route-section" aria-labelledby={`sources-${group.key}`}>
          <h2 id={`sources-${group.key}`}>{group.heading}</h2>
          <ul className="source-directory">
            {group.sources.map((s) => {
              const stat = stats.get(s.id);
              return (
                <li key={s.id}>
                  <SourceCard
                    id={s.id}
                    name={sourceName(s.id, sources)}
                    classLabel={group.classLabel}
                    citations={stat?.count ?? 0}
                    latestDate={stat?.latestDate ?? null}
                    locale={locale}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </PageShell>
  );
}
