import { getAnthropic, MODELS } from "../anthropic/client.js";
import { CURATE_SYSTEM } from "../anthropic/prompts/curate.js";
import type { ScrapedItem } from "../scraping/types.js";

export type CuratedBrief = {
  date: string;
  headline: string;
  angle: string;
  picks: Array<{ itemId: string; why: string }>;
};

const TOOL = {
  name: "emit_brief",
  description: "Emit the curated daily brief.",
  input_schema: {
    type: "object",
    properties: {
      headline: { type: "string" },
      angle: { type: "string" },
      picks: {
        type: "array",
        minItems: 3,
        maxItems: 8,
        items: {
          type: "object",
          properties: {
            itemId: { type: "string" },
            why: { type: "string" },
          },
          required: ["itemId", "why"],
        },
      },
    },
    required: ["headline", "angle", "picks"],
  },
} as const;

function compact(items: ScrapedItem[]): string {
  return items
    .map(
      (i, idx) =>
        `[${idx}] id=${i.id} src=${i.source} weight-tag=${i.tags.join(",")}\n` +
        `    title: ${i.title}\n` +
        `    url: ${i.url}\n` +
        `    summary: ${i.summary}`,
    )
    .join("\n\n");
}

export async function curate(
  items: ScrapedItem[],
  date: string,
): Promise<CuratedBrief> {
  const client = getAnthropic();
  const response = await client.messages.create({
    model: MODELS.sonnet,
    max_tokens: 1500,
    system: [{ type: "text", text: CURATE_SYSTEM, cache_control: { type: "ephemeral" } }],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "emit_brief" },
    messages: [
      {
        role: "user",
        content: `Today is ${date}. Items pool follows.\n\n${compact(items)}`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("curate: model did not call emit_brief");
  }
  const input = toolUse.input as Omit<CuratedBrief, "date">;
  if (input.picks.length < 3) {
    throw new Error(`curate: only ${input.picks.length} picks (min 3)`);
  }
  return { date, ...input };
}
