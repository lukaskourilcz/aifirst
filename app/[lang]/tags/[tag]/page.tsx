import { notFound } from "next/navigation";
import { IssueRow } from "@/components/IssueRow";
import { TagChip } from "@/components/TagChip";
import { listArticlesByTag, listTagsByFrequency } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

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
  params: Promise<{ lang: Locale; tag: string }>;
}) {
  const { lang: locale, tag: raw } = await params;
  const tag = decodeURIComponent(raw);
  const t = dict(locale).tags;
  const common = dict(locale).common;
  const lp = localePrefixer(locale);
  const issues = await listArticlesByTag(tag, locale);
  if (issues.length === 0) notFound();

  return (
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label">{t.kicker}</p>
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
        <span>{issues.length} {t.issues}</span>
        <a
          href={lp(`/tags/${encodeURIComponent(tag)}/feed.xml`)}
          className="label"
          style={{ color: "var(--accent-cyan)" }}
        >
          {common.atomFeed} ↗
        </a>
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {issues.map((a) => (
          <IssueRow
            key={a.slug}
            href={lp(`/articles/${a.slug}`)}
            date={a.date}
            title={a.title}
            padding="16px 0"
            variant="meta"
            trailing={
              <span
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                {(a.tags ?? [])
                  .filter((x) => x !== tag)
                  .slice(0, 2)
                  .map((x) => (
                    <TagChip key={x} tag={x} locale={locale} />
                  ))}
              </span>
            }
          />
        ))}
      </ul>
    </section>
  );
}
