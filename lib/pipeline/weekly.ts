import { getAnthropic } from "../anthropic/client.js";
import { STYLE_GUIDE } from "../anthropic/style-guide.js";
import { listArticles, getArticle, type ArticleSummary } from "../content.js";
import { writeMdxFile } from "../content-write.js";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "../i18n/config.js";
import { anthropicUsageLine } from "../telemetry/anthropic.js";
import type { UsageLine } from "../telemetry/types.js";
import { totalUsageCost } from "../telemetry/pricing.js";
import { modelFor } from "../anthropic/models.js";

function weeklySystemFor(locales: readonly Locale[]): string {
  return `${STYLE_GUIDE}

You are writing the weekly edition of Caught Up in ${locales.join(" and ")}. Inputs
are the last seven daily editions. Produce a 600-900 word digest covering:
1. The week's defining story.
2. Up to five developments that genuinely mattered; never pad to five.
3. What actually changed.
4. What did not live up to the hype.
5. What to watch next week.
Every development must link to a supplied /articles/<slug> URL.

Write idiomatic, native prose in every requested language. If two languages
are requested, preserve names, numbers, dates, links, claim strength and
uncertainty between them. Output via the emit_digest tool. Do not invent topics that
weren't covered in the daily issues. Do not list sources — the digest
references daily issues, not external URLs.`;
}

const localeObjectSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    dek: { type: "string" },
    alternative_headlines: { type: "array", minItems: 2, maxItems: 3, items: { type: "string" } },
    body_mdx: { type: "string" },
    illustration_alt: { type: "string" },
    why_it_matters: { type: "array", minItems: 1, maxItems: 3, items: { type: "string" } },
    what_changed: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
    uncertainty: { type: "array", minItems: 1, maxItems: 3, items: { type: "string" } },
  },
  required: ["title", "dek", "alternative_headlines", "body_mdx", "illustration_alt", "why_it_matters", "what_changed", "uncertainty"],
} as const;

function toolFor(locales: readonly Locale[]) {
  return {
    name: "emit_digest",
    description: `Emit the Sunday weekly digest in ${locales.join(" and ")}.`,
    input_schema: {
    type: "object",
    properties: {
      slug: { type: "string" },
      tags: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
      illustration_prompt: { type: "string" },
      ...Object.fromEntries(locales.map((locale) => [locale, localeObjectSchema])),
    },
    required: ["slug", "tags", "illustration_prompt", ...locales],
    },
  } as const;
}

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
  alternative_headlines: string[];
  body_mdx: string;
  illustration_alt: string;
  why_it_matters: string[];
  what_changed: string[];
  uncertainty: string[];
};

export type WeeklyGenerationResult = { files: string[]; slug: string; usage: UsageLine[] };

export async function generateWeekly(date: string, locales: readonly Locale[] = LOCALES, maximumOutputTokens = 6000, writingModel?: string): Promise<WeeklyGenerationResult> {
  if (locales.length === 0) throw new Error("weekly: at least one output locale is required");
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
  const tool = toolFor(locales);
  const model = writingModel ?? modelFor("writing");
  const response = await client.messages.create({
    model,
    max_tokens: maximumOutputTokens,
    system: [
      { type: "text", text: weeklySystemFor(locales), cache_control: { type: "ephemeral" } },
    ],
    tools: [tool],
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
    cs?: LocaleOut;
    en?: LocaleOut;
  };
  const usage = [anthropicUsageLine(model, "weekly_write", response.usage)];
  const measuredCost = process.env.IMAGE_PROVIDER === "fal" ? null : totalUsageCost(usage);

  const fromDate = covered[covered.length - 1]?.date ?? date;
  const toDate = covered[0]?.date ?? date;
  const meanSignal =
    signalCount > 0 ? Math.round(totalSignal / signalCount) : 0;

  const files: string[] = [];
  for (const locale of locales) {
    const loc = out[locale];
    if (!loc) throw new Error(`weekly: model omitted requested ${locale} output`);
    const frontmatter = {
      schema_version: 2,
      title: loc.title,
      slug: out.slug,
      date,
      lang: locale,
      ...(locales.length > 1 ? { translation_of: out.slug } : {}),
      type: "weekly" as const,
      dek: loc.dek,
      alternative_headlines: loc.alternative_headlines,
      tags: ["weekly", ...out.tags.filter((t) => t !== "weekly")].slice(0, 5),
      sources: [],
      illustration: {
        path: `/illustrations/${date}-weekly.webp`,
        prompt: out.illustration_prompt,
        alt: loc.illustration_alt,
      },
      signal_strength: meanSignal,
      why_it_matters: loc.why_it_matters,
      what_changed: loc.what_changed,
      uncertainty: loc.uncertainty,
      dispatches: [],
      wire: [],
      digest: {
        from: fromDate,
        to: toDate,
        covered_slugs: covered.map((c) => c.slug),
      },
      generation: {
        generated_at: new Date().toISOString(),
        human_reviewed: false,
        models: { writing: model },
        source_candidates: covered.length,
        cited_sources: 0,
        image_provider: process.env.IMAGE_PROVIDER ?? "none",
        ...(measuredCost ? { cost: measuredCost } : {}),
      },
    };
    files.push(
      await writeMdxFile(`${date}-weekly.${locale}.mdx`, frontmatter, loc.body_mdx),
    );
  }
  return { files, slug: out.slug, usage };
}
