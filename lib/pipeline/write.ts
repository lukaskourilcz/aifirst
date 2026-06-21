import { getAnthropic, MODELS } from "../anthropic/client.js";
import { WRITE_SYSTEM } from "../anthropic/prompts/write.js";
import type { ScrapedItem } from "../scraping/types.js";
import type { CuratedBrief } from "./curate.js";
import type { Dispatch, WireItem, SourceRef } from "../content.js";
import { LOCALES, type Locale } from "../i18n/config.js";

// The per-language part of a written article.
export type LocalizedContent = {
  title: string;
  dek: string;
  bodyMdx: string;
  illustrationAlt: string;
  dispatches: Dispatch[];
};

export type WrittenArticle = {
  slug: string;
  date: string;
  tags: string[];
  illustrationPrompt: string;
  wire: WireItem[];
  sources: SourceRef[];
  byLocale: Record<Locale, LocalizedContent>;
};

const localeObjectSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    dek: { type: "string" },
    body_mdx: { type: "string" },
    illustration_alt: { type: "string" },
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
  required: ["title", "dek", "body_mdx", "illustration_alt", "dispatches"],
} as const;

const TOOL = {
  name: "emit_article",
  description:
    "Emit the day's feature article in Czech and English, plus shared metadata and the wire.",
  input_schema: {
    type: "object",
    properties: {
      slug: { type: "string" },
      tags: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 },
      illustration_prompt: { type: "string" },
      wire: {
        type: "array",
        minItems: 4,
        maxItems: 8,
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
      cs: localeObjectSchema,
      en: localeObjectSchema,
    },
    required: ["slug", "tags", "illustration_prompt", "wire", "cs", "en"],
  },
} as const;

type LocaleOut = {
  title: string;
  dek: string;
  body_mdx: string;
  illustration_alt: string;
  dispatches: Dispatch[];
};

type ToolOut = {
  slug: string;
  tags: string[];
  illustration_prompt: string;
  wire: WireItem[];
  cs: LocaleOut;
  en: LocaleOut;
};

function toLocalized(out: LocaleOut): LocalizedContent {
  return {
    title: out.title,
    dek: out.dek,
    bodyMdx: out.body_mdx,
    illustrationAlt: out.illustration_alt,
    dispatches: out.dispatches,
  };
}

export async function write(
  brief: CuratedBrief,
  itemsById: Map<string, ScrapedItem>,
  runnerUpItems: ScrapedItem[] = [],
): Promise<WrittenArticle> {
  const pickedItems = brief.picks
    .map((p) => itemsById.get(p.itemId))
    .filter((i): i is ScrapedItem => Boolean(i));

  if (pickedItems.length < 3) {
    throw new Error(
      `write: only ${pickedItems.length} pickable items matched the brief`,
    );
  }

  const itemBlock = pickedItems
    .map((i) => `## ${i.title}\nurl: ${i.url}\nsource: ${i.source}\n\n${i.summary}`)
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
      ? `Runner-up items for the wire (pick 4-8 of these, do not invent):\n${runnerBlock}\n`
      : "");

  const client = getAnthropic();
  const response = await client.messages.create({
    model: MODELS.opus,
    max_tokens: 8000,
    system: [{ type: "text", text: WRITE_SYSTEM, cache_control: { type: "ephemeral" } }],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "emit_article" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("write: model did not call emit_article");
  }
  const out = toolUse.input as ToolOut;

  const byLocale = {} as Record<Locale, LocalizedContent>;
  for (const locale of LOCALES) {
    byLocale[locale] = toLocalized(out[locale]);
  }

  return {
    slug: out.slug,
    date: brief.date,
    tags: out.tags,
    illustrationPrompt: out.illustration_prompt,
    wire: out.wire,
    sources: pickedItems.map((i) => ({ id: i.id, url: i.url, title: i.title })),
    byLocale,
  };
}
