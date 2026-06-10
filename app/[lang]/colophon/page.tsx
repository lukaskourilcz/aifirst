import { listArticles, listTagsByFrequency } from "@/lib/content";
import { loadSources } from "@/lib/scraping/sources";
import { MODELS } from "@/lib/anthropic/models";

export const dynamic = "force-static";
export const metadata = { title: "Colophon" };

export default async function ColophonPage() {
  const [articles, sources, tags] = await Promise.all([
    listArticles(),
    loadSources(),
    listTagsByFrequency(),
  ]);

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
    <section className="container" style={{ padding: "48px 24px 96px" }}>
      <p className="label label--accent">colophon</p>
      <h1>How this magazine is made.</h1>
      <p
        style={{
          fontSize: "1.2rem",
          color: "var(--ink-muted)",
          maxWidth: "62ch",
          marginTop: "1em",
          marginBottom: "2em",
        }}
      >
        aifirst is a daily magazine about AI and technology, edited by a
        language model. Each morning a pipeline scrapes {sources.length}{" "}
        sources, an LLM curates the most interesting items of the past 24
        hours, and writes a single feature plus a constellation of shorter
        pieces. {articles.length} issues have shipped so far.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          margin: "2em 0",
        }}
      >
        {[
          ["issues", articles.length],
          ["sources", sources.length],
          ["tags", tags.length],
        ].map(([label, value]) => (
          <div
            key={label as string}
            style={{
              padding: 16,
              border: "1px solid var(--hairline)",
              background: "var(--bg-deep)",
            }}
          >
            <p className="label">{label as string}</p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.8rem",
                margin: 0,
                color: "var(--accent-cyan)",
              }}
            >
              {String(value as number).padStart(3, "0")}
            </p>
          </div>
        ))}
      </div>

      <Section label="pipeline" title="From feed to feature, in four steps.">
        <p>
          A scheduled job runs each morning at 06:00 UTC. The four steps:
        </p>
        <ol style={{ paddingLeft: "1.2em" }}>
          <li>
            <strong>Scrape.</strong> Adapters in <code>lib/scraping</code>{" "}
            pull items from RSS feeds, the Hacker News API, the arXiv API,
            and a last-resort HTML scraper. Each adapter has a 10s timeout
            and tolerates partial failure.
          </li>
          <li>
            <strong>Curate.</strong> Sonnet 4.6 reads the deduplicated pool
            and picks 5–8 items, with a one-line angle for each. Structured
            output via tool use.
          </li>
          <li>
            <strong>Write.</strong> Opus 4.7 turns the brief into a feature
            article, plus dispatches and the wire — runner-up items the
            curator considered but didn&rsquo;t lead with.
          </li>
          <li>
            <strong>Illustrate.</strong> A pluggable provider (fal.ai or a
            placeholder) generates a single sci-fi cover. The illustration
            prompt is constrained server-side; no people, no logos, no
            text-in-image.
          </li>
        </ol>
      </Section>

      <Section label="models" title="What Claude is reading and writing.">
        <ul style={{ paddingLeft: "1.2em" }}>
          <li>
            <code>{MODELS.opus}</code> &mdash; feature writing.
          </li>
          <li>
            <code>{MODELS.sonnet}</code> &mdash; curation and
            summarisation.
          </li>
          <li>
            <code>{MODELS.haiku}</code> &mdash; utility passes.
          </li>
        </ul>
        <p>
          System prompts and the style guide are passed with prompt caching;
          the variable items of the day live outside the cached region. All
          structured outputs use the Anthropic tool-use API.
        </p>
      </Section>

      <Section label="signal" title="What the bar in the masthead means.">
        <p>
          Each issue carries a <em>signal strength</em> from 0 to 100, shown
          as a small segment bar. It&rsquo;s computed deterministically from
          the cited sources for that issue: half from how diverse the source
          pool is, half from the average editorial weight of those sources.
          A high signal means the day&rsquo;s feature is grounded in many
          independent, well-regarded outlets. A low signal means the
          curator stretched.
        </p>
      </Section>

      <Section
        label="design"
        title="A dark room, a HUD, and one good serif away from a magazine."
      >
        <p>
          The design language is documented in the{" "}
          <code>.claude/skills/sci-fi-design-system</code> skill: a deep
          space palette, cyan and magenta accents, a monospaced display
          face, hairline rules, and no animation beyond what a heads-up
          display would do. There&rsquo;s no JavaScript on the homepage
          except the search palette and the reading-progress bar.
        </p>
      </Section>

      <Section
        label="standards"
        title="What the magazine will and won't do."
      >
        <ul style={{ paddingLeft: "1.2em" }}>
          <li>Cite only URLs present in the day&rsquo;s scrape.</li>
          <li>No hype words (revolutionary, game-changer, unprecedented).</li>
          <li>Refuse to publish if the curator returns fewer than three picks.</li>
          <li>Overwrite, not append, when regenerating an existing date.</li>
          <li>No live data fetches in the rendered site.</li>
        </ul>
      </Section>

      <p
        className="label"
        style={{ marginTop: 64, color: "var(--ink-dim)" }}
      >
        transmission · ongoing
      </p>
    </section>
  );
}
