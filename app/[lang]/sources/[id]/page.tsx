import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TagChip } from "@/components/TagChip";
import { listArticlesBySource, sourceCitationStats } from "@/lib/content";
import { loadSources } from "@/lib/scraping/sources";

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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sources = await loadSources();
  const source = sources.find((s) => s.id === id);
  if (!source) notFound();

  const [issues, stats] = await Promise.all([
    listArticlesBySource(id),
    sourceCitationStats(),
  ]);
  const stat = stats.get(id);
  const pct = Math.round((source.weight ?? 0.5) * 100);

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label">
        <Link href="/sources">↩ sources</Link>
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
        <div
          style={{
            padding: 16,
            border: "1px solid var(--hairline)",
            background: "var(--bg-deep)",
          }}
        >
          <p className="label" style={{ marginBottom: 6 }}>
            weight
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              margin: 0,
              color: "var(--accent-cyan)",
            }}
          >
            {String(pct).padStart(2, "0")}
          </p>
        </div>
        <div
          style={{
            padding: 16,
            border: "1px solid var(--hairline)",
            background: "var(--bg-deep)",
          }}
        >
          <p className="label" style={{ marginBottom: 6 }}>
            citations
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              margin: 0,
              color: "var(--accent-cyan)",
            }}
          >
            ×{stat?.count ?? 0}
          </p>
        </div>
        <div
          style={{
            padding: 16,
            border: "1px solid var(--hairline)",
            background: "var(--bg-deep)",
          }}
        >
          <p className="label" style={{ marginBottom: 6 }}>
            last cited
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              margin: 0,
              color: "var(--ink-primary)",
            }}
          >
            {stat?.latestDate ?? "—"}
          </p>
        </div>
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
          {source.tags.map((t) => (
            <li key={t}>
              <TagChip tag={t} />
            </li>
          ))}
        </ul>
      ) : null}

      <h2 style={{ marginTop: 48 }}>Issues that cited this source</h2>
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
            <Link href={`/articles/${a.slug}`} className="label">
              {a.date}
            </Link>
            <Link href={`/articles/${a.slug}`} style={{ fontSize: "1.05rem" }}>
              {a.title}
            </Link>
          </li>
        ))}
        {issues.length === 0 && (
          <li
            className="label"
            style={{ padding: 16, color: "var(--ink-dim)" }}
          >
            no issues yet have cited this source.
          </li>
        )}
      </ul>
    </section>
  );
}
