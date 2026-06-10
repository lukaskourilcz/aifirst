import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TagChip } from "@/components/TagChip";
import { listArticlesBySource, sourceCitationStats } from "@/lib/content";
import { loadSources } from "@/lib/scraping/sources";
import { type Locale, localePath } from "@/lib/i18n/config";
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
  const lp = (p: string) => localePath(locale, p);
  const sources = await loadSources();
  const source = sources.find((s) => s.id === id);
  if (!source) notFound();

  const [issues, stats] = await Promise.all([
    listArticlesBySource(id, locale),
    sourceCitationStats(locale),
  ]);
  const stat = stats.get(id);
  const pct = Math.round((source.weight ?? 0.5) * 100);

  const card = (label: string, value: string, big = "1.8rem") => (
    <div
      style={{
        padding: 16,
        border: "1px solid var(--hairline)",
        background: "var(--bg-deep)",
      }}
    >
      <p className="label" style={{ marginBottom: 6 }}>
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: big,
          margin: 0,
          color: "var(--accent-cyan)",
        }}
      >
        {value}
      </p>
    </div>
  );

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label">
        <Link href={lp("/sources")}>↩ {t.back}</Link>
      </p>
      <h1 style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        {source.name}
      </h1>
      <p
        className="label"
        style={{ color: "var(--ink-muted)", marginBottom: 8 }}
      >
        {source.type} · {source.id}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          margin: "32px 0",
        }}
      >
        {card(t.weight, String(pct).padStart(2, "0"))}
        {card(t.citations, `×${stat?.count ?? 0}`)}
        {card(t.lastCited, stat?.latestDate ?? "—", "1.1rem")}
      </div>

      {source.tags?.length ? (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 0 32px",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {source.tags.map((tg) => (
            <li key={tg}>
              <TagChip tag={tg} locale={locale} />
            </li>
          ))}
        </ul>
      ) : null}

      <h2 style={{ marginTop: 48 }}>{t.citedBy}</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {issues.map((a) => (
          <li
            key={a.slug}
            className="entry-row"
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            <Link href={lp(`/articles/${a.slug}`)} className="label">
              {a.date}
            </Link>
            <Link href={lp(`/articles/${a.slug}`)} style={{ fontSize: "1.05rem" }}>
              {a.title}
            </Link>
          </li>
        ))}
        {issues.length === 0 && (
          <li
            className="label"
            style={{ padding: 16, color: "var(--ink-dim)" }}
          >
            {t.citedByEmpty}
          </li>
        )}
      </ul>
    </section>
  );
}
