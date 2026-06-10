import { getAnthropic, MODELS } from "../anthropic/client.js";
import { WRITE_SYSTEM } from "../anthropic/prompts/write.js";
import type { ScrapedItem } from "../scraping/types.js";
import type { CuratedBrief } from "./curate.js";
import type { Dispatch, WireItem } from "../content.js";

export type { Dispatch, WireItem } from "../content.js";

export type WrittenArticle = {
  title: string;
  slug: string;
  date: string;
  dek: string;
  tags: string[];
  bodyMdx: string;
  illustrationPrompt: string;
  illustrationAlt: string;
  sources: Array<{ id: string; url: string; title: string }>;
  dispatches: Dispatch[];
  wire: WireItem[];
};

const TOOL = {
  name: "emit_article",
  description: "Emit the day's feature article plus dispatches and wire.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      slug: { type: "string" },
      dek: { type: "string" },
      tags: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 },
      body_mdx: { type: "string" },
      illustration_prompt: { type: "string" },
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
    },
    required: [
      "title",
      "slug",
      "dek",
      "tags",
      "body_mdx",
      "illustration_prompt",
      "illustration_alt",
      "dispatches",
      "wire",
    ],
  },
} as const;

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
    max_tokens: 5000,
    system: [{ type: "text", text: WRITE_SYSTEM, cache_control: { type: "ephemeral" } }],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "emit_article" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("write: model did not call emit_article");
  }
  const out = toolUse.input as {
    title: string;
    slug: string;
    dek: string;
    tags: string[];
    body_mdx: string;
    illustration_prompt: string;
    illustration_alt: string;
    dispatches: Dispatch[];
    wire: WireItem[];
  };

  return {
    title: out.title,
    slug: out.slug,
    date: brief.date,
    dek: out.dek,
    tags: out.tags,
    bodyMdx: out.body_mdx,
    illustrationPrompt: out.illustration_prompt,
    illustrationAlt: out.illustration_alt,
    sources: pickedItems.map((i) => ({ id: i.id, url: i.url, title: i.title })),
    dispatches: out.dispatches,
    wire: out.wire,
  };
}
