import Link from "next/link";
import { CoverFrame } from "@/components/CoverFrame";
import { DataStrip } from "@/components/DataStrip";
import { GlowLink } from "@/components/GlowLink";
import { getLatestArticle, listArticles } from "@/lib/content";

export const dynamic = "force-static";

export default async function HomePage() {
  const latest = await getLatestArticle();
  const archive = (await listArticles()).slice(0, 6);

  if (!latest) {
    return (
      <section className="container" style={{ padding: "120px 24px" }}>
        <p className="label">Issue 000</p>
        <h1>The first issue is being written.</h1>
        <p style={{ color: "var(--ink-muted)", maxWidth: "60ch" }}>
          The daily pipeline will publish here once it&apos;s run. See{" "}
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
      />
      <section className="container" style={{ paddingTop: 32 }}>
        <CoverFrame
          src={latest.frontmatter.illustration.path}
          alt={latest.frontmatter.illustration.alt}
        />
        <div className="reading" style={{ paddingTop: 48, paddingBottom: 96 }}>
          <p className="label">Today &mdash; {latest.frontmatter.date}</p>
          <h1>{latest.frontmatter.title}</h1>
          <p
            style={{
              fontSize: "1.25rem",
              color: "var(--ink-muted)",
              marginBottom: "2.5em",
            }}
          >
            {latest.frontmatter.dek}
          </p>
          <article dangerouslySetInnerHTML={{ __html: latest.html }} />
        </div>
      </section>

      {archive.length > 1 && (
        <section className="container" style={{ paddingBottom: 96 }}>
          <p className="label" style={{ marginBottom: 16 }}>Recent issues</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {archive
              .filter((a) => a.slug !== latest.slug)
              .map((a) => (
                <li key={a.slug} style={{ padding: "12px 0", borderBottom: "1px solid var(--hairline)" }}>
                  <Link href={`/articles/${a.slug}`} className="label" style={{ marginRight: 16 }}>
                    {a.date}
                  </Link>
                  <Link href={`/articles/${a.slug}`}>{a.title}</Link>
                </li>
              ))}
          </ul>
        </section>
      )}
    </>
  );
}
