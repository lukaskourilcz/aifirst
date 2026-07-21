import { getAnthropic } from "../anthropic/client.js";
import { writeSystemFor } from "../anthropic/prompts/write.js";
import type { ScrapedItem } from "../scraping/types.js";
import type { CuratedBrief } from "./curate.js";
import type { Dispatch, WireItem, SourceRef } from "../content.js";
import { LOCALES, type Locale } from "../i18n/config.js";
import type { UsageLine } from "../telemetry/types.js";
import { anthropicUsageLine } from "../telemetry/anthropic.js";
import { modelFor } from "../anthropic/models.js";

// The per-language part of a written article.
export type LocalizedContent = {
  title: string;
  dek: string;
  alternativeHeadlines: string[];
  bodyMdx: string;
  illustrationAlt: string;
  dispatches: Dispatch[];
  whyItMatters: string[];
  whatChanged: string[];
  uncertainty: string[];
};

export type WrittenArticle = {
  slug: string;
  date: string;
  tags: string[];
  illustrationPrompt: string;
  wire: WireItem[];
  sources: SourceRef[];
  byLocale: Partial<Record<Locale, LocalizedContent>>;
  usage: UsageLine[];
};

function localeObjectSchema(briefsMaximum: number) {
  return {
  type: "object",
  properties: {
    title: { type: "string" },
    dek: { type: "string" },
    alternative_headlines: { type: "array", minItems: 2, maxItems: 3, items: { type: "string" } },
    body_mdx: { type: "string" },
    illustration_alt: { type: "string" },
    why_it_matters: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: { type: "string" },
    },
    what_changed: {
      type: "array",
      minItems: 1,
      maxItems: briefsMaximum,
      items: { type: "string" },
    },
    uncertainty: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: { type: "string" },
    },
    dispatches: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          body: { type: "string", description: "60-100 words of prose." },
          source_url: { type: "string" },
        },
        required: ["title", "body"],
      },
    },
  },
  required: ["title", "dek", "alternative_headlines", "body_mdx", "illustration_alt", "why_it_matters", "what_changed", "uncertainty", "dispatches"],
  } as const;
}

function toolFor(locales: readonly Locale[], briefsMaximum: number, watchlistMaximum: number) {
  return {
    name: "emit_article",
    description: `Emit the day's feature article in ${locales.join(" and ")}, plus shared metadata and the wire.`,
    input_schema: {
    type: "object",
    properties: {
      slug: { type: "string" },
      tags: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 },
      illustration_prompt: { type: "string" },
      wire: {
        type: "array",
        minItems: 4,
        maxItems: watchlistMaximum,
        description: "Runner-up items not folded into the feature.",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            url: { type: "string" },
            source: { type: "string" },
          },
          required: ["title", "url", "source"],
        },
      },
      ...Object.fromEntries(locales.map((locale) => [locale, localeObjectSchema(briefsMaximum)])),
    },
    required: ["slug", "tags", "illustration_prompt", "wire", ...locales],
    },
  } as const;
}

type LocaleOut = {
  title: string;
  dek: string;
  alternative_headlines: string[];
  body_mdx: string;
  illustration_alt: string;
  dispatches: Dispatch[];
  why_it_matters: string[];
  what_changed: string[];
  uncertainty: string[];
};

type ToolOut = {
  slug: string;
  tags: string[];
  illustration_prompt: string;
  wire: WireItem[];
  cs?: LocaleOut;
  en?: LocaleOut;
};

function toLocalized(out: LocaleOut): LocalizedContent {
  return {
    title: out.title,
    dek: out.dek,
    alternativeHeadlines: out.alternative_headlines,
    bodyMdx: out.body_mdx,
    illustrationAlt: out.illustration_alt,
    dispatches: out.dispatches,
    whyItMatters: out.why_it_matters,
    whatChanged: out.what_changed,
    uncertainty: out.uncertainty,
  };
}

export async function write(
  brief: CuratedBrief,
  itemsById: Map<string, ScrapedItem>,
  runnerUpItems: ScrapedItem[] = [],
  locales: readonly Locale[] = LOCALES,
  maximumOutputTokens = 8000,
  briefsMaximum = 4,
  watchlistMaximum = 8,
  targetWords = 1100,
  writingModel?: string,
): Promise<WrittenArticle> {
  if (locales.length === 0) throw new Error("write: at least one output locale is required");
  const pickedItems = brief.picks
    .map((p) => itemsById.get(p.itemId))
    .filter((i): i is ScrapedItem => Boolean(i));

  if (pickedItems.length < 3) {
    throw new Error(
      `write: only ${pickedItems.length} pickable items matched the brief`,
    );
  }

  const itemBlock = pickedItems
    .map((i) => {
      const pick = brief.picks.find((candidate) => candidate.itemId === i.id);
      return `## ${i.title}\nurl: ${i.url}\nsource: ${i.source}\nevidence: ${pick?.evidence ?? "open_question"}\nwhy selected: ${pick?.why ?? ""}\n\n${i.summary}`;
    })
    .join("\n\n");

  const runnerBlock = runnerUpItems
    .slice(0, 12)
    .map((i) => `- [${i.source}] ${i.title} (${i.url})`)
    .join("\n");

  const userPrompt =
    `Date: ${brief.date}\n` +
    `Working headline: ${brief.headline}\n` +
    `Angle: ${brief.angle}\n\n` +
    `Picked items:\n\n${itemBlock}\n\n` +
    (runnerBlock
      ? `Runner-up items for the watchlist (pick up to ${watchlistMaximum} of these, do not invent):\n${runnerBlock}\n`
      : "");

  const client = getAnthropic();
  const tool = toolFor(locales, briefsMaximum, watchlistMaximum);
  const model = writingModel ?? modelFor("writing");
  const response = await client.messages.create({
    model,
    max_tokens: maximumOutputTokens,
    system: [{ type: "text", text: writeSystemFor(locales, briefsMaximum, watchlistMaximum, targetWords), cache_control: { type: "ephemeral" } }],
    tools: [tool],
    tool_choice: { type: "tool", name: "emit_article" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("write: model did not call emit_article");
  }
  const out = toolUse.input as ToolOut;

  const byLocale: Partial<Record<Locale, LocalizedContent>> = {};
  for (const locale of locales) {
    const localized = out[locale];
    if (!localized) throw new Error(`write: model omitted requested ${locale} output`);
    byLocale[locale] = toLocalized(localized);
  }

  return {
    slug: out.slug,
    date: brief.date,
    tags: out.tags,
    illustrationPrompt: out.illustration_prompt,
    wire: out.wire,
    sources: pickedItems.map((i) => {
      const pick = brief.picks.find((candidate) => candidate.itemId === i.id);
      return {
        id: i.id,
        source_id: i.source,
        url: i.url,
        title: i.title,
        published_at: i.publishedAt,
        classification: i.tags.includes("primary-source") ? "primary" as const : "secondary" as const,
        supports: pick?.why ? [pick.why] : undefined,
      };
    }),
    byLocale,
    usage: [anthropicUsageLine(model, "write", response.usage)],
  };
}
