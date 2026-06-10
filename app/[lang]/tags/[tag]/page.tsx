import Link from "next/link";
import { notFound } from "next/navigation";
import { TagChip } from "@/components/TagChip";
import {
  listArticlesByTag,
  listTagsByFrequency,
} from "@/lib/content";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const tags = await listTagsByFrequency();
  return tags.map((t) => ({ tag: t.tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  return { title: `#${decodeURIComponent(tag)}` };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  const issues = await listArticlesByTag(tag);
  if (issues.length === 0) notFound();

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label">tag</p>
      <h1 style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ color: "var(--accent-magenta)" }}>#</span>
        {tag}
      </h1>
      <p
        style={{
          color: "var(--ink-muted)",
          marginBottom: "3em",
          fontFamily: "var(--font-display)",
          fontSize: "0.8rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          display: "flex",
          gap: 16,
          alignItems: "center",
        }}
      >
        <span>{issues.length} issue{issues.length === 1 ? "" : "s"}</span>
        <a
          href={`/tags/${encodeURIComponent(tag)}/feed.xml`}
          className="label"
          style={{ color: "var(--accent-cyan)" }}
        >
          atom feed ↗
        </a>
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {issues.map((a) => (
          <li
            key={a.slug}
            className="entry-row entry-row--meta"
            style={{
              padding: "16px 0",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            <Link href={`/articles/${a.slug}`} className="label">
              {a.date}
            </Link>
            <Link
              href={`/articles/${a.slug}`}
              style={{ fontSize: "1.05rem" }}
            >
              {a.title}
            </Link>
            <span
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {(a.tags ?? [])
                .filter((t) => t !== tag)
                .slice(0, 2)
                .map((t) => (
                  <TagChip key={t} tag={t} />
                ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
