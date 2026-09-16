// Machine-readable distribution: the llms.txt index and the chrome-free
// markdown copy of one edition.
//
// Both are built here, once, from the same committed content the reader pages
// read. Nothing in this module calls a model, fetches a source, reads a clock
// or randomises anything: `/llms.txt` and every `/articles/<slug>.md` are
// prerendered, so two builds of the same commit produce the same bytes.
//
// The markdown copy carries editorial content only. `frontmatter.generation`
// holds model names, candidate counts and run cost, and none of it belongs in
// a document a reader or an assistant can open.

import { listArticles, type Article, type Correction, type Dispatch, type SourceRef, type WireItem } from "../content";
import { siteUrl } from "../config";
import { localePath, type Locale } from "../i18n/config";
import { dict } from "../i18n/dictionaries";
import { brand } from "../brand";

/**
 * How many editions the index names. The archive is small today, but the file
 * is a context budget for somebody else's model, so it stays bounded by
 * construction rather than by how long the archive happens to be.
 */
export const MAX_INDEX_EDITIONS = 60;

/**
 * The public URL of an edition's markdown copy.
 *
 * `/articles/<slug>.md` is the address readers and agents see. It is served by
 * the prerendered `/articles/<slug>/index.md` route through the `afterFiles`
 * rewrite in `next.config.mjs`: an App Router segment cannot be named
 * `[slug].md`, because a segment is only dynamic when it ends in `]`. Change
 * this one function if that alias is ever dropped.
 */
export function articleMarkdownPath(slug: string): string {
  return `/articles/${slug}.md`;
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function escapeLinkText(value: string): string {
  return collapse(value).replace(/([[\]])/g, "\\$1");
}

/** Angle-bracket a destination only when bare parentheses or spaces would break it. */
function markdownDestination(url: string): string {
  const safe = url.replace(/</g, "%3C").replace(/>/g, "%3E");
  return /[\s()]/.test(safe) ? `<${safe.replace(/\s/g, "%20")}>` : safe;
}

function link(text: string, url: string): string {
  return `[${escapeLinkText(text)}](${markdownDestination(url)})`;
}

function bullets(items: readonly string[]): string {
  return items.map((item) => `- ${collapse(item)}`).join("\n");
}

/** A `## heading` and its body, or nothing at all when the body is empty. */
function section(heading: string, body: string): string[] {
  const trimmed = body.trim();
  return trimmed ? [`## ${collapse(heading)}`, trimmed] : [];
}

function document(blocks: readonly string[]): string {
  return `${blocks.filter((block) => block.trim().length > 0).join("\n\n")}\n`;
}

function sourceLine(source: SourceRef): string {
  const publisher = source.publisher?.trim();
  const label = source.title?.trim() || source.url;
  return `- ${link(label, source.url)}${publisher ? ` (${collapse(publisher)})` : ""}`;
}

function wireLine(item: WireItem): string {
  const origin = item.source?.trim();
  return `- ${link(item.title, item.url)}${origin ? ` (${collapse(origin)})` : ""}`;
}

function dispatchBlock(item: Dispatch, sourceLabel: string): string {
  const parts = [`### ${collapse(item.title)}`, collapse(item.body)];
  if (item.source_url) parts.push(link(sourceLabel, item.source_url));
  return parts.filter(Boolean).join("\n\n");
}

function correctionLine(correction: Correction): string {
  const scope = correction.section?.trim();
  return `- ${correction.date}${scope ? ` (${collapse(scope)})` : ""}: ${collapse(correction.description)}`;
}

/**
 * One edition as plain markdown: the same editorial content the reading page
 * shows, in the same order, without the shell around it.
 */
export function buildArticleMarkdown(article: Article, locale: Locale): string {
  const d = dict(locale);
  const fm = article.frontmatter;
  const canonical = `${siteUrl()}${localePath(locale, `/articles/${article.slug}`)}`;

  // Lowercase labels on purpose: this mirrors the machine-metadata line the
  // reading page sets in IBM Plex Mono. Only the edition's own language is
  // missing, because a legacy English issue never reaches this route.
  const meta = [`- ${d.common.issue}: ${fm.date}`];
  const tags = (fm.tags ?? []).filter((tag) => tag.trim().length > 0);
  if (tags.length > 0) meta.push(`- ${d.nav.topics}: ${tags.join(", ")}`);
  meta.push(`- URL: ${canonical}`);

  const blocks: string[] = [`# ${collapse(fm.title)}`];
  if (fm.dek?.trim()) blocks.push(`> ${collapse(fm.dek)}`);
  blocks.push(meta.join("\n"));

  // Paid placement stays labelled here exactly as it is on the page.
  if (fm.sponsor) {
    blocks.push(
      `${d.article.sponsored}: ${link(fm.sponsor.name, fm.sponsor.url)}. ${collapse(fm.sponsor.copy)}`,
    );
  }

  blocks.push(...section(d.article.whyItMatters, bullets(fm.why_it_matters ?? [])));
  blocks.push(...section(d.article.whatChanged, bullets(fm.what_changed ?? [])));
  blocks.push(...section(d.article.uncertainty, bullets(fm.uncertainty ?? [])));

  if (fm.editors_note?.trim()) blocks.push(`> ${collapse(fm.editors_note)}`);

  // Delivered bodies are plain markdown, so they pass through untouched.
  if (article.mdx.trim()) blocks.push(article.mdx.trim());

  const dispatches = fm.dispatches ?? [];
  if (dispatches.length > 0) {
    blocks.push(
      ...section(
        d.home.dispatches,
        dispatches.map((item) => dispatchBlock(item, d.article.dispatchSource)).join("\n\n"),
      ),
    );
  }

  blocks.push(...section(d.home.wire, (fm.wire ?? []).map(wireLine).join("\n")));
  blocks.push(...section(d.article.corrections, (fm.corrections ?? []).map(correctionLine).join("\n")));
  blocks.push(...section(d.article.sources, (fm.sources ?? []).map(sourceLine).join("\n")));

  return document(blocks);
}

/**
 * The root llms.txt index: the publication name, a one-line summary, the
 * sections, the reference surfaces, the recent editions as markdown links and
 * an `Optional` block of feeds and JSON contracts.
 *
 * `Optional` is the one heading that is not translated. llmstxt.org reserves
 * that exact word for the section a client may drop when its context is tight,
 * so it is a machine key in the same sense as `x-default`.
 */
export async function buildLlmsIndex(locale: Locale, dir?: string): Promise<string> {
  const d = dict(locale);
  const base = siteUrl();
  const at = (path: string) => `${base}${localePath(locale, path)}`;
  const summaries = (dir === undefined ? await listArticles(locale) : await listArticles(locale, dir))
    .filter((summary) => !summary.fallback)
    .slice(0, MAX_INDEX_EDITIONS);

  const sections: ReadonlyArray<readonly [string, string]> = [
    [d.rail.today, "/"],
    [d.rail.week, "/tyden"],
    [d.rail.talked, "/o-cem-se-mluvi"],
    [d.rail.models, "/ai-modely"],
    [d.rail.podcasts, "/podcasty"],
    [d.rail.events, "/akce"],
  ];
  const reference: ReadonlyArray<readonly [string, string]> = [
    [d.rail.radar, "/radar"],
    [d.rail.topics, "/topics"],
    [d.rail.weeklyDigest, "/weekly"],
    [d.rail.archive, "/archive"],
    [d.rail.lessons, "/lekce"],
    [d.rail.aboutMagazine, "/about"],
    [d.home.sources, "/sources"],
    [d.article.corrections, "/corrections"],
    [d.article.glossaryHeading, "/glossary"],
    [d.about.partnerCard, "/partner"],
  ];
  const optional: ReadonlyArray<readonly [string, string]> = [
    [`Atom: ${d.rail.today}`, "/feed.xml"],
    [`Atom: ${d.rail.weeklyDigest}`, "/weekly/feed.xml"],
    [`JSON: ${d.rail.today}`, "/api/today.json"],
    [`JSON: ${d.rail.weeklyDigest}`, "/api/weekly.json"],
    [`JSON: ${d.rail.topics}`, "/api/topics.json"],
    [`JSON: ${d.rail.radar}`, "/api/radar.json"],
  ];

  const list = (entries: ReadonlyArray<readonly [string, string]>) =>
    entries.map(([label, path]) => `- ${link(label, at(path))}`).join("\n");

  const editions = summaries
    .map((summary) => {
      const text = link(`${summary.date} ${summary.title}`, `${base}${articleMarkdownPath(summary.slug)}`);
      const dek = summary.dek?.trim();
      return `- ${text}${dek ? `: ${collapse(dek)}` : ""}`;
    })
    .join("\n");

  return document([
    `# ${brand.name}`,
    `> ${collapse(d.meta.siteDescription)}`,
    collapse(d.llms.intro),
    ...section(d.rail.primary, list(sections)),
    ...section(d.rail.secondary, list(reference)),
    ...section(d.home.recentEditions, editions),
    ...section("Optional", list(optional)),
  ]);
}
