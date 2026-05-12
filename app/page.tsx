import Link from "next/link";
import { CoverFrame } from "@/components/CoverFrame";
import { DataStrip } from "@/components/DataStrip";
import { Dispatches } from "@/components/Dispatches";
import { GlowLink } from "@/components/GlowLink";
import { Mdx } from "@/components/Mdx";
import { SourcesBlock } from "@/components/SourcesBlock";
import { TagChip } from "@/components/TagChip";
import { Wire } from "@/components/Wire";
import { getLatestArticle, listArticles } from "@/lib/content";
import { readingMinutes } from "@/lib/text";

export const dynamic = "force-static";

export default async function HomePage() {
  const latest = await getLatestArticle();
  const archive = (await listArticles()).slice(0, 6);

  if (!latest) {
    return (
      <section className="container" style={{ padding: "160px 24px" }}>
        <p className="label label--accent">issue 000</p>
        <h1>The first transmission is being written.</h1>
        <p style={{ color: "var(--ink-muted)", maxWidth: "60ch" }}>
          The daily pipeline publishes here once it has run. See{" "}
          <GlowLink href="https://github.com/lukaskourilcz/aifirst">the repo</GlowLink>{" "}
          for setup, or run <code>pnpm generate:daily</code> locally.
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
      />
      <section className="container" style={{ paddingTop: 32 }}>
        <div className="enter enter-1">
          <CoverFrame
            src={latest.frontmatter.illustration.path}
            alt={latest.frontmatter.illustration.alt}
            priority
          />
        </div>
        <div className="reading" style={{ paddingTop: 56, paddingBottom: 32 }}>
          <p className="label label--accent enter enter-1">
            Today &mdash; {latest.frontmatter.date}
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
                <TagChip tag={t} />
              </li>
            ))}
          </ul>
          <Mdx source={latest.mdx} />
          <Dispatches items={latest.frontmatter.dispatches ?? []} />
          <Wire items={latest.frontmatter.wire ?? []} />
          <SourcesBlock sources={latest.frontmatter.sources ?? []} />
        </div>
      </section>

      {archive.length > 1 && (
        <section className="container" style={{ paddingBottom: 32 }}>
          <p className="label" style={{ marginBottom: 16 }}>
            Recent issues
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {archive
              .filter((a) => a.slug !== latest.slug)
              .map((a) => (
                <li
                  key={a.slug}
                  style={{
                    padding: "14px 0",
                    borderBottom: "1px solid var(--hairline)",
                    display: "grid",
                    gridTemplateColumns: "140px 1fr",
                    gap: 16,
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
          </ul>
        </section>
      )}
    </>
  );
}
