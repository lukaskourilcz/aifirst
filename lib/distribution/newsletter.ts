import fs from "node:fs/promises";
import path from "node:path";
import type { Article, ArticleFrontmatter } from "../content";
import { localePath, type Locale } from "../i18n/config";
import { dict } from "../i18n/dictionaries";
import { siteUrl } from "../config";
import { brand } from "../brand";
import { OG } from "../og-theme";
import { czechLongDate } from "../weeks";

// The edition email, rendered from the committed package and nothing else.
//
// It is provider-independent on purpose: the output is three files on disk
// (`email.html`, `email.txt`, `metadata.json`) under the gitignored
// `generated/`, and no code here talks to an email service, holds a list or
// knows a reader's address. Whichever provider the owner picks pastes or
// uploads these; changing provider changes nothing in this file.
//
// The template mirrors the reading page's structure so the email is the same
// edition rather than a teaser: why it matters, what changed, what stays
// uncertain, Briefs, Watchlist, corrections, the labelled sponsor, the source
// ledger and the completion mark. Every block is omitted when its field is
// absent — an edition without Briefs gets no Briefs heading, never a filler.
//
// Production instrumentation never enters it. `frontmatter.generation` carries
// model names, candidate counts, review flags and cost, and none of that is
// reader-facing, here or anywhere else.

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export type NewsletterArtifact = {
  schemaVersion: 1;
  subject: string;
  previewText: string;
  canonicalUrl: string;
  html: string;
  text: string;
};

// Email clients cannot read CSS custom properties, so the palette is inlined
// from the same literal values `lib/og-theme.ts` holds for `next/og`.
//
// Those stacks quote family names with double quotes, which is correct in a
// stylesheet and fatal inside a `style="…"` attribute: the first quote closes
// the attribute and the rest of the declaration leaks into the markup. Inline
// styles get the same stacks re-quoted.
const inlineFont = (stack: string): string => stack.replace(/"/g, "'");
const FONT_EDITORIAL = inlineFont(OG.fontEditorial);
const FONT_INTERFACE = inlineFont(OG.fontInterface);
const FONT_MONO = inlineFont(OG.fontMono);

const BODY = `font-family: ${FONT_INTERFACE}; color: ${OG.ink};`;
const MONO = `font-family: ${FONT_MONO}; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;`;

function heading(text: string): string {
  return `<h2 style="${MONO} color: ${OG.slate}; margin: 28px 0 10px; font-weight: 500;">${escapeHtml(text)}</h2>`;
}

function bullets(items: readonly string[]): string {
  const rows = items
    .map((item) => `<li style="margin: 0 0 8px;">${escapeHtml(item)}</li>`)
    .join("");
  return `<ul style="margin: 0; padding-left: 20px; font-size: 16px; line-height: 1.6;">${rows}</ul>`;
}

function textSection(title: string, lines: readonly string[]): string {
  if (lines.length === 0) return "";
  return `${title}\n${lines.map((line) => `- ${line}`).join("\n")}\n\n`;
}

function sourceLines(fm: ArticleFrontmatter): string[] {
  return fm.sources.map((source) => `${source.title} — ${source.url}`);
}

/**
 * The edition's own kicker: a weekly digest and a daily issue say so, and the
 * date is the publishing day from the package, never a clock.
 */
function kicker(fm: ArticleFrontmatter, locale: Locale): string {
  const d = dict(locale);
  const label = fm.type === "weekly" ? d.article.weeklyDigest : d.home.dailyIssue;
  return `${label} · ${czechLongDate(fm.date)}`;
}

export function createNewsletterArtifact(article: Article, locale: Locale): NewsletterArtifact {
  const fm = article.frontmatter;
  const d = dict(locale);
  const completion = brand.locale[locale].completion;
  const canonicalUrl = `${siteUrl()}${localePath(locale, `/articles/${article.slug}`)}`;
  const subject = `${brand.name}: ${fm.title}`;
  const readLabel = d.home.readIssue;

  const html: string[] = [];
  const text: string[] = [];

  html.push(
    `<p style="${MONO} color: ${OG.slate}; margin: 0 0 16px;">${escapeHtml(brand.name)} · ${escapeHtml(kicker(fm, locale))}</p>`,
    `<h1 style="font-family: ${FONT_EDITORIAL}; font-size: 28px; line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 12px; color: ${OG.ink};">${escapeHtml(fm.title)}</h1>`,
    `<p style="font-size: 18px; line-height: 1.5; margin: 0 0 24px; color: ${OG.carbon};">${escapeHtml(fm.dek)}</p>`,
  );
  text.push(`${brand.name} · ${kicker(fm, locale)}\n\n${fm.title}\n\n${fm.dek}\n\n`);

  const summaries: Array<[string, string[] | undefined]> = [
    [d.article.whyItMatters, fm.why_it_matters],
    [d.article.whatChanged, fm.what_changed],
    [d.article.uncertainty, fm.uncertainty],
  ];
  for (const [title, items] of summaries) {
    if (!items || items.length === 0) continue;
    html.push(heading(title), bullets(items));
    text.push(textSection(title, items));
  }

  const dispatches = fm.dispatches ?? [];
  if (dispatches.length > 0) {
    const rows = dispatches
      .map((item) => {
        const body = `<p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${OG.carbon};">${escapeHtml(item.body)}</p>`;
        const link = item.source_url
          ? `<p style="margin: 6px 0 0; font-size: 13px;"><a href="${escapeHtml(item.source_url)}" style="color: ${OG.accent};">${escapeHtml(d.article.dispatchSource)}</a></p>`
          : "";
        return `<div style="margin: 0 0 18px; padding: 0 0 18px; border-bottom: 1px solid ${OG.fog};"><p style="margin: 0 0 6px; font-family: ${FONT_EDITORIAL}; font-size: 17px; line-height: 1.25; color: ${OG.ink};">${escapeHtml(item.title)}</p>${body}${link}</div>`;
      })
      .join("");
    html.push(heading(d.home.dispatches), rows);
    text.push(
      textSection(
        d.home.dispatches,
        dispatches.map((item) => (item.source_url ? `${item.title} — ${item.body} (${item.source_url})` : `${item.title} — ${item.body}`)),
      ),
    );
  }

  const wire = fm.wire ?? [];
  if (wire.length > 0) {
    const rows = wire
      .map(
        (item) =>
          `<li style="margin: 0 0 8px;"><a href="${escapeHtml(item.url)}" style="color: ${OG.accent};">${escapeHtml(item.title)}</a> <span style="color: ${OG.slate};">${escapeHtml(item.source)}</span></li>`,
      )
      .join("");
    html.push(heading(d.home.wire), `<ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">${rows}</ul>`);
    text.push(textSection(d.home.wire, wire.map((item) => `${item.title} (${item.source}) — ${item.url}`)));
  }

  const corrections = fm.corrections ?? [];
  if (corrections.length > 0) {
    html.push(
      heading(d.article.corrections),
      bullets(corrections.map((entry) => (entry.section ? `${entry.date} · ${entry.section} — ${entry.description}` : `${entry.date} — ${entry.description}`))),
    );
    text.push(
      textSection(
        d.article.corrections,
        corrections.map((entry) => (entry.section ? `${entry.date} · ${entry.section} — ${entry.description}` : `${entry.date} — ${entry.description}`)),
      ),
    );
  }

  if (fm.sponsor) {
    const sponsor = fm.sponsor;
    html.push(
      `<div style="margin: 28px 0; padding: 16px; background: ${OG.page}; border: 1px solid ${OG.fog};"><p style="${MONO} color: ${OG.slate}; margin: 0 0 8px;">${escapeHtml(d.article.sponsored)} · ${escapeHtml(sponsor.label)}</p><p style="margin: 0 0 8px; font-size: 15px; line-height: 1.6; color: ${OG.carbon};">${escapeHtml(sponsor.copy)}</p><p style="margin: 0; font-size: 15px;"><a href="${escapeHtml(sponsor.url)}" rel="sponsored noopener" style="color: ${OG.accent};">${escapeHtml(sponsor.name)}</a></p></div>`,
    );
    text.push(`${d.article.sponsored} · ${sponsor.label}\n${sponsor.copy}\n${sponsor.name} — ${sponsor.url}\n\n`);
  }

  if (fm.sources.length > 0) {
    const rows = fm.sources
      .map(
        (source) =>
          `<li style="margin: 0 0 6px;"><a href="${escapeHtml(source.url)}" style="color: ${OG.accent};">${escapeHtml(source.title)}</a></li>`,
      )
      .join("");
    html.push(heading(d.article.sourceLedger), `<ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">${rows}</ol>`);
    text.push(textSection(d.article.sourceLedger, sourceLines(fm)));
  }

  html.push(
    `<p style="${MONO} color: ${OG.complete}; margin: 32px 0 8px;">${escapeHtml(completion)}</p>`,
    `<p style="margin: 0; font-size: 15px;"><a href="${escapeHtml(canonicalUrl)}" style="color: ${OG.accent};">${escapeHtml(readLabel)} →</a></p>`,
  );
  text.push(`${completion}\n\n${readLabel}: ${canonicalUrl}\n`);

  const document = [
    `<!doctype html><html lang="${locale}"><head><meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${escapeHtml(subject)}</title></head>`,
    `<body style="margin: 0; padding: 0; background: ${OG.page};">`,
    `<div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(fm.dek)}</div>`,
    `<main style="max-width: 600px; margin: 0 auto; padding: 32px 24px; background: ${OG.paper}; ${BODY}">`,
    html.join(""),
    `</main></body></html>`,
  ].join("");

  return {
    schemaVersion: 1,
    subject,
    previewText: fm.dek,
    canonicalUrl,
    html: document,
    text: text.join(""),
  };
}

export async function writeNewsletterArtifact(article: Article, locale: Locale): Promise<string[]> {
  const artifact = createNewsletterArtifact(article, locale);
  const suffix = article.frontmatter.type === "weekly" ? ".weekly" : "";
  const dir = path.join(process.cwd(), "generated", "newsletters", `${article.frontmatter.date}${suffix}.${locale}`);
  await fs.mkdir(dir, { recursive: true });
  const htmlFile = path.join(dir, "email.html");
  const textFile = path.join(dir, "email.txt");
  const metaFile = path.join(dir, "metadata.json");
  await Promise.all([
    fs.writeFile(htmlFile, `${artifact.html}\n`, "utf8"),
    fs.writeFile(textFile, artifact.text, "utf8"),
    fs.writeFile(metaFile, `${JSON.stringify({ schemaVersion: 1, subject: artifact.subject, previewText: artifact.previewText, canonicalUrl: artifact.canonicalUrl }, null, 2)}\n`, "utf8"),
  ]);
  return [htmlFile, textFile, metaFile];
}
