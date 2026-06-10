import { getAnthropic, MODELS } from "../anthropic/client.js";
import { STYLE_GUIDE } from "../anthropic/style-guide.js";
import { listArticles, getArticle, type ArticleSummary } from "../content.js";
import { writeMdxFile } from "../content-write.js";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "../i18n/config.js";

const WEEKLY_SYSTEM = `${STYLE_GUIDE}

You are writing the Sunday weekly digest for aifirst, in BOTH Czech and
English. Inputs are the last seven daily briefs (title, date, dek, slug).
Produce, for each language, a single 600-900 word digest with three
sections:

1. The throughline of the week (one paragraph).
2. Three to five "threads" — each a short paragraph anchored by a
   Markdown link to /articles/<slug-of-the-daily-issue>. Use only the
   slugs given to you.
3. One short "Looking ahead" paragraph.

Write idiomatic, native Czech (cs) and idiomatic English (en) — not a
translation. Output via the emit_digest tool. Do not invent topics that
weren't covered in the daily issues. Do not list sources — the digest
references daily issues, not external URLs.`;

const localeObjectSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    dek: { type: "string" },
    body_mdx: { type: "string" },
    illustration_alt: { type: "string" },
  },
  required: ["title", "dek", "body_mdx", "illustration_alt"],
} as const;

const TOOL = {
  name: "emit_digest",
  description: "Emit the Sunday weekly digest in Czech and English.",
  input_schema: {
    type: "object",
    properties: {
      slug: { type: "string" },
      tags: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
      illustration_prompt: { type: "string" },
      cs: localeObjectSchema,
      en: localeObjectSchema,
    },
    required: ["slug", "tags", "illustration_prompt", "cs", "en"],
  },
} as const;

export async function coverageFor(
  endDate: string,
  contentDir?: string,
): Promise<ArticleSummary[]> {
  const all = await listArticles(DEFAULT_LOCALE, contentDir);
  // Window covers the seven calendar days preceding (and including)
  // the Sunday end date — i.e. the prior Sunday through this Sunday.
  const end = new Date(endDate);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 7);
  return all
    .filter((a) => (a.type ?? "daily") === "daily")
    .filter((a) => {
      const d = new Date(a.date);
      return d >= start && d <= end;
    });
}

type LocaleOut = {
  title: string;
  dek: string;
  body_mdx: string;
  illustration_alt: string;
};

export async function generateWeekly(date: string): Promise<string[]> {
  const covered = await coverageFor(date);
  if (covered.length < 4) {
    throw new Error(
      `weekly: only ${covered.length} daily issues in window — aborting`,
    );
  }

  const briefBlock: string[] = [];
  let totalSignal = 0;
  let signalCount = 0;
  for (const c of covered) {
    const article = await getArticle(c.slug);
    if (!article) continue;
    briefBlock.push(
      `- ${article.frontmatter.date} (slug: ${article.slug})\n  title: ${article.frontmatter.title}\n  dek: ${article.frontmatter.dek}`,
    );
    if (typeof article.frontmatter.signal_strength === "number") {
      totalSignal += article.frontmatter.signal_strength;
      signalCount++;
    }
  }

  const userPrompt =
    `Sunday date: ${date}\n\n` +
    `Daily issues covered (oldest first):\n${briefBlock.reverse().join("\n")}`;

  const client = getAnthropic();
  const response = await client.messages.create({
    model: MODELS.opus,
    max_tokens: 6000,
    system: [
      { type: "text", text: WEEKLY_SYSTEM, cache_control: { type: "ephemeral" } },
    ],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "emit_digest" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("weekly: model did not call emit_digest");
  }
  const out = toolUse.input as {
    slug: string;
    tags: string[];
    illustration_prompt: string;
    cs: LocaleOut;
    en: LocaleOut;
  };

  const fromDate = covered[covered.length - 1]?.date ?? date;
  const toDate = covered[0]?.date ?? date;
  const meanSignal =
    signalCount > 0 ? Math.round(totalSignal / signalCount) : 0;

  const files: string[] = [];
  for (const locale of LOCALES) {
    const loc = out[locale];
    const frontmatter = {
      title: loc.title,
      slug: out.slug,
      date,
      lang: locale,
      type: "weekly" as const,
      dek: loc.dek,
      tags: ["weekly", ...out.tags.filter((t) => t !== "weekly")].slice(0, 5),
      sources: [],
      illustration: {
        path: `/illustrations/${date}-weekly.webp`,
        prompt: out.illustration_prompt,
        alt: loc.illustration_alt,
      },
      signal_strength: meanSignal,
      dispatches: [],
      wire: [],
      digest: {
        from: fromDate,
        to: toDate,
        covered_slugs: covered.map((c) => c.slug),
      },
    };
    files.push(
      await writeMdxFile(`${date}-weekly.${locale}.mdx`, frontmatter, loc.body_mdx),
    );
  }
  return files;
}
