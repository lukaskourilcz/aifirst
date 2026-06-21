import { StatCard } from "@/components/StatCard";
import { PageShell } from "@/components/PageShell";
import { listArticles, listTagsByFrequency } from "@/lib/content";
import { loadSources } from "@/lib/scraping/sources";
import { MODELS } from "@/lib/anthropic/models";
import { type Locale } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export default async function ColophonPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const c = dict(locale).colophon;
  const [articles, sources, tags] = await Promise.all([
    listArticles(locale),
    loadSources(),
    listTagsByFrequency(locale),
  ]);

  const counts: Array<[string, number]> = [
    [c.issues, articles.length],
    [c.sources, sources.length],
    [c.tags, tags.length],
  ];

  const Section = ({
    label,
    title,
    children,
  }: {
    label: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <section style={{ marginTop: 56 }}>
      <p className="label label--accent">{label}</p>
      <h2 style={{ marginTop: 4, marginBottom: 16 }}>{title}</h2>
      <div style={{ color: "var(--ink-muted)" }}>{children}</div>
    </section>
  );

  return (
    <PageShell kicker={c.kicker} title={c.title}>
      <p
        style={{
          fontSize: "1.2rem",
          color: "var(--ink-muted)",
          maxWidth: "62ch",
          marginTop: "1em",
          marginBottom: "2em",
        }}
      >
        {c.intro1} {sources.length} {c.intro2} {articles.length} {c.intro3}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          margin: "2em 0",
        }}
      >
        {counts.map(([label, value]) => (
          <StatCard
            key={label}
            label={label}
            value={String(value).padStart(3, "0")}
          />
        ))}
      </div>

      <Section label={c.pipelineLabel} title={c.pipelineTitle}>
        <p>{c.pipelineIntro}</p>
        <ol style={{ paddingLeft: "1.2em" }}>
          <li>{c.pipelineScrape}</li>
          <li>{c.pipelineCurate}</li>
          <li>{c.pipelineWrite}</li>
          <li>{c.pipelineIllustrate}</li>
        </ol>
      </Section>

      <Section label={c.modelsLabel} title={c.modelsTitle}>
        <ul style={{ paddingLeft: "1.2em" }}>
          <li>
            <code>{MODELS.opus}</code> &mdash; {c.modelsOpus}
          </li>
          <li>
            <code>{MODELS.sonnet}</code> &mdash; {c.modelsSonnet}
          </li>
          <li>
            <code>{MODELS.haiku}</code> &mdash; {c.modelsHaiku}
          </li>
        </ul>
        <p>{c.modelsNote}</p>
      </Section>

      <Section label={c.languageLabel} title={c.languageTitle}>
        <p>{c.languageBody}</p>
      </Section>

      <Section label={c.signalLabel} title={c.signalTitle}>
        <p>{c.signalBody}</p>
      </Section>

      <p className="label" style={{ marginTop: 64, color: "var(--ink-dim)" }}>
        {dict(locale).common.transmissionOngoing}
      </p>
    </PageShell>
  );
}
