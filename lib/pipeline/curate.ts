import { getAnthropic, MODELS } from "../anthropic/client.js";
import { CURATE_SYSTEM } from "../anthropic/prompts/curate.js";
import type { ScrapedItem } from "../scraping/types.js";

export type CuratedBrief = {
  date: string;
  headline: string;
  angle: string;
  picks: Array<{ itemId: string; why: string }>;
};

function buildTool(maxIndex: number) {
  return {
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
              index: { type: "integer", minimum: 0, maximum: maxIndex },
              why: { type: "string" },
            },
            required: ["index", "why"],
          },
        },
      },
      required: ["headline", "angle", "picks"],
    },
  } as const;
}

function compact(items: ScrapedItem[]): string {
  return items
    .map(
      (i, idx) =>
        `[${idx}] src=${i.source} tags=${i.tags.join(",")}\n` +
        `    title: ${i.title}\n` +
        `    url: ${i.url}\n` +
        `    summary: ${i.summary}`,
    )
    .join("\n\n");
}

type ToolInput = {
  headline: string;
  angle: string;
  picks: Array<{ index: number; why: string }>;
};

export async function curate(
  items: ScrapedItem[],
  date: string,
): Promise<CuratedBrief> {
  const client = getAnthropic();
  const response = await client.messages.create({
    model: MODELS.sonnet,
    max_tokens: 1500,
    system: [{ type: "text", text: CURATE_SYSTEM, cache_control: { type: "ephemeral" } }],
    tools: [buildTool(items.length - 1)],
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
  const input = toolUse.input as ToolInput;
  const picks = input.picks
    .map((p) => {
      const item = items[p.index];
      return item ? { itemId: item.id, why: p.why } : null;
    })
    .filter((p): p is { itemId: string; why: string } => p !== null);
  if (picks.length < 3) {
    throw new Error(`curate: only ${picks.length} pickable picks (min 3)`);
  }
  return { date, headline: input.headline, angle: input.angle, picks };
}
