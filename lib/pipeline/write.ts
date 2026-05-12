import { getAnthropic, MODELS } from "../anthropic/client.js";
import { WRITE_SYSTEM } from "../anthropic/prompts/write.js";
import type { ScrapedItem } from "../scraping/types.js";
import type { CuratedBrief } from "./curate.js";

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
};

const TOOL = {
  name: "emit_article",
  description: "Emit the day's feature article.",
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
    },
    required: [
      "title",
      "slug",
      "dek",
      "tags",
      "body_mdx",
      "illustration_prompt",
      "illustration_alt",
    ],
  },
} as const;

export async function write(
  brief: CuratedBrief,
  itemsById: Map<string, ScrapedItem>,
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
    .map(
      (i) =>
        `## ${i.title}\nurl: ${i.url}\nsource: ${i.source}\n\n${i.summary}`,
    )
    .join("\n\n");

  const userPrompt =
    `Date: ${brief.date}\n` +
    `Working headline: ${brief.headline}\n` +
    `Angle: ${brief.angle}\n\n` +
    `Picked items:\n\n${itemBlock}`;

  const client = getAnthropic();
  const response = await client.messages.create({
    model: MODELS.opus,
    max_tokens: 4000,
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
  };
}
