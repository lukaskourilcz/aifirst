import { CoverFrame } from "@/components/CoverFrame";
import { DataStrip } from "@/components/DataStrip";
import { Dispatches } from "@/components/Dispatches";
import { EditorsNote } from "@/components/EditorsNote";
import { GlossaryBlock } from "@/components/GlossaryBlock";
import { GlowLink } from "@/components/GlowLink";
import { IssueRow } from "@/components/IssueRow";
import { Mdx } from "@/components/Mdx";
import { SourcesBlock } from "@/components/SourcesBlock";
import { TagChip } from "@/components/TagChip";
import { Wire } from "@/components/Wire";
import { getLatestArticle, listArticles } from "@/lib/content";
import { loadGlossary, resolveGlossaryTerms } from "@/lib/glossary";
import { githubRepo } from "@/lib/config";
import { readingMinutes } from "@/lib/text";
import type { Metadata } from "next";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { localeAlternates } from "@/lib/i18n/metadata";
import { dict } from "@/lib/i18n/dictionaries";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: localeAlternates(lang, "/") };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang: locale } = await params;
  const d = dict(locale);
  const lp = localePrefixer(locale);

  const latest = await getLatestArticle(locale);
  const archive = (await listArticles(locale)).slice(0, 6);
  const glossary = await loadGlossary();
  const repo = githubRepo();

  if (!latest) {
    return (
      <section className="container" style={{ padding: "160px 24px" }}>
        <p className="label label--accent">{d.home.emptyKicker}</p>
        <h1>{d.home.emptyTitle}</h1>
        <p style={{ color: "var(--ink-muted)", maxWidth: "60ch" }}>
          {d.home.emptyBodyBefore}
          <GlowLink href={`https://github.com/${repo}`}>
            {d.home.emptyBodyRepo}
          </GlowLink>
          {d.home.emptyBodyAfter}
          <code>pnpm generate:daily</code>.
        </p>
      </section>
    );
  }

  return (
    <>
      <DataStrip
        date={latest.frontmatter.date}
        sourceCount={latest.frontmatter.sources?.length ?? 0}
        tags={latest.frontmatter.tags}
        signal={latest.frontmatter.signal_strength}
        readingMinutes={readingMinutes(latest.mdx)}
        locale={locale}
      />
      <section className="container" style={{ paddingTop: 32 }}>
        <div className="enter enter-1">
          <CoverFrame
            src={latest.frontmatter.illustration.path}
            alt={latest.frontmatter.illustration.alt}
            priority
            locale={locale}
          />
        </div>
        <div className="reading" style={{ paddingTop: 56, paddingBottom: 32 }}>
          <p className="label label--accent enter enter-1">
            {d.common.today} &mdash; {latest.frontmatter.date}
          </p>
          <h1 className="enter enter-2">{latest.frontmatter.title}</h1>
          <p
            className="enter enter-3"
            style={{
              fontSize: "1.3rem",
              color: "var(--ink-muted)",
              marginBottom: "2em",
              lineHeight: 1.45,
            }}
          >
            {latest.frontmatter.dek}
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 2.5em",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {(latest.frontmatter.tags ?? []).map((t) => (
              <li key={t}>
                <TagChip tag={t} locale={locale} />
              </li>
            ))}
          </ul>
          <EditorsNote note={latest.frontmatter.editors_note} locale={locale} />
          <Mdx source={latest.mdx} />
          <Dispatches items={latest.frontmatter.dispatches ?? []} locale={locale} />
          <Wire items={latest.frontmatter.wire ?? []} locale={locale} />
          <GlossaryBlock
            terms={resolveGlossaryTerms(latest.frontmatter.glossary_terms, glossary)}
            locale={locale}
          />
          <SourcesBlock sources={latest.frontmatter.sources ?? []} locale={locale} />
        </div>
      </section>

      {archive.length > 1 && (
        <section className="container" style={{ paddingBottom: 32 }}>
          <p className="label" style={{ marginBottom: 16 }}>
            {d.home.recentIssues}
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {archive
              .filter((a) => a.slug !== latest.slug)
              .map((a) => (
                <IssueRow
                  key={a.slug}
                  href={lp(`/articles/${a.slug}`)}
                  date={a.date}
                  title={a.title}
                />
              ))}
          </ul>
        </section>
      )}
    </>
  );
}
