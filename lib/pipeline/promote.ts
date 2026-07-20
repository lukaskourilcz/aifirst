import { getAnthropic, MODELS } from "../anthropic/client.js";
import { PROMOTE_SYSTEM } from "../anthropic/prompts/promote.js";
import { LOCALES, type Locale } from "../i18n/config.js";
import type { WrittenArticle } from "./write.js";
import type { PromotionLocaleContent, PromotionPost } from "../promotion.js";

// Shape the model returns per language.
type LocaleOut = {
  title: string;
  summary: string;
  instagram: string;
  threads: string;
};

type ToolOut = {
  cs: LocaleOut;
  en: LocaleOut;
};

const localeSchema = {
  type: "object",
  properties: {
    title: { type: "string", description: "4-8 word hook for the post card." },
    summary: {
      type: "string",
      description: "1-2 sentence teaser, max ~240 characters.",
    },
    instagram: {
      type: "string",
      description:
        "Full Instagram caption: strong opener, short context, light CTA, then a line of 5-10 lowercase hashtags.",
    },
    threads: {
      type: "string",
      description:
        "Full Threads caption: leaner and conversational, 0-2 hashtags, distinct from the Instagram text.",
    },
  },
  required: ["title", "summary", "instagram", "threads"],
} as const;

const TOOL = {
  name: "emit_promotion",
  description:
    "Emit the Instagram and Threads promotion copy for the day's issue, in Czech and English.",
  input_schema: {
    type: "object",
    properties: { cs: localeSchema, en: localeSchema },
    required: ["cs", "en"],
  },
} as const;

function toLocale(out: LocaleOut): PromotionLocaleContent {
  return {
    title: out.title,
    summary: out.summary,
    instagram: out.instagram,
    threads: out.threads,
  };
}

// Pure assembly of the promotion payload from a tool result + issue metadata.
// Kept separate from the API call so it can be unit-tested.
export function toPromotionPost(
  out: ToolOut,
  meta: { date: string; slug: string; image: string | null; generatedAt?: string },
): PromotionPost {
  const byLocale = {} as Record<Locale, PromotionLocaleContent>;
  for (const locale of LOCALES) byLocale[locale] = toLocale(out[locale]);
  return {
    date: meta.date,
    slug: meta.slug,
    image: meta.image,
    byLocale,
    generated_at: meta.generatedAt,
  };
}

function localeBlock(label: string, c: WrittenArticle["byLocale"][Locale]): string {
  const dispatches = c.dispatches
    .map((d) => `- ${d.title}: ${d.body}`)
    .join("\n");
  return `### ${label}\nTitle: ${c.title}\nDek: ${c.dek}\nDispatches:\n${dispatches}`;
}

export async function promote(
  article: WrittenArticle,
  illustrationPath: string | null,
  now: () => string = () => new Date().toISOString(),
): Promise<PromotionPost> {
  const userPrompt =
    `Date: ${article.date}\nTags: ${article.tags.join(", ")}\n\n` +
    `${localeBlock("English (en)", article.byLocale.en)}\n\n` +
    `${localeBlock("Czech (cs)", article.byLocale.cs)}\n`;

  const client = getAnthropic();
  const response = await client.messages.create({
    model: MODELS.sonnet,
    max_tokens: 2000,
    system: [
      { type: "text", text: PROMOTE_SYSTEM, cache_control: { type: "ephemeral" } },
    ],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "emit_promotion" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("promote: model did not call emit_promotion");
  }
  const out = toolUse.input as ToolOut;

  return toPromotionPost(out, {
    date: article.date,
    slug: article.slug,
    image: illustrationPath,
    generatedAt: now(),
  });
}
