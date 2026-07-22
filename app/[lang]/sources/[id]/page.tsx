import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { IssueRow } from "@/components/IssueRow";
import { TagChip } from "@/components/TagChip";
import { PageShell } from "@/components/PageShell";
import { listArticlesBySource, sourceCitationStats } from "@/lib/content";
import { loadSources } from "@/lib/scraping/sources";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const sources = await loadSources();
  return sources.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sources = await loadSources();
  const source = sources.find((s) => s.id === id);
  return { title: source ? source.name : id };
}

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>;
}) {
  const { lang: locale, id } = await params;
  const t = dict(locale).sources;
  const lp = localePrefixer(locale);
  const sources = await loadSources();
  const source = sources.find((s) => s.id === id);
  if (!source) notFound();

  const [issues, stats] = await Promise.all([
    listArticlesBySource(id, locale),
    sourceCitationStats(locale),
  ]);
  const stat = stats.get(id);
  const weightPct = Math.round((source.weight ?? 0.5) * 100);

  return (
    <PageShell
      kicker={<Link href={lp("/sources")}>← {t.back}</Link>}
      title={source.name}
      intro={`${source.type} · ${source.id}`}
    >
      <dl className="source-summary">
        <div><dt>{t.weight}</dt><dd>{String(weightPct).padStart(2, "0")}</dd></div>
        <div><dt>{t.citations}</dt><dd>×{stat?.count ?? 0}</dd></div>
        <div><dt>{t.lastCited}</dt><dd>{stat?.latestDate ?? "—"}</dd></div>
      </dl>

      {source.tags?.length ? (
        <ul className="source-detail__tags">
          {source.tags.map((tg) => (
            <li key={tg}>
              <TagChip tag={tg} locale={locale} />
            </li>
          ))}
        </ul>
      ) : null}

      <section className="route-section">
        <h2>{t.citedBy}</h2>
        <ul className="dense-list">
          {issues.map((a) => (
            <IssueRow
              key={a.slug}
              href={lp(`/articles/${a.slug}`)}
              date={a.date}
              title={a.title}
            />
          ))}
          {issues.length === 0 && (
            <li className="label route-empty-state">
              {t.citedByEmpty}
            </li>
          )}
        </ul>
      </section>
    </PageShell>
  );
}
