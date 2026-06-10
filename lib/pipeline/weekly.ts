import { getAnthropic, MODELS } from "../anthropic/client.js";
import { STYLE_GUIDE } from "../anthropic/style-guide.js";
import { listArticles, getArticle, type ArticleSummary } from "../content.js";
import { writeMdxFile } from "../content-write.js";

export type WeeklyDigest = {
  title: string;
  slug: string;
  dek: string;
  tags: string[];
  bodyMdx: string;
  illustrationPrompt: string;
  illustrationAlt: string;
};

const WEEKLY_SYSTEM = `${STYLE_GUIDE}

You are writing the Sunday weekly digest for aifirst. Inputs are the
last seven daily briefs (title, date, dek, slug). Produce a single
600-900 word digest with three sections:

1. The throughline of the week (one paragraph).
2. Three to five "threads" — each a short paragraph anchored by a
   Markdown link to /articles/<slug-of-the-daily-issue>. Use only the
   slugs given to you.
3. One short "Looking ahead" paragraph.

Output via the emit_digest tool. Do not invent topics that weren't
covered in the daily issues. Do not list sources — the digest
references daily issues, not external URLs.`;

const TOOL = {
  name: "emit_digest",
  description: "Emit the Sunday weekly digest.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      slug: { type: "string" },
      dek: { type: "string" },
      tags: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
      body_mdx: { type: "string" },
      illustration_prompt: { type: "string" },
      illustration_alt: { type: "string" },
    },
    required: [
      "title",
      "slug",
      "dek",
      "body_mdx",
      "illustration_prompt",
      "illustration_alt",
      "tags",
    ],
  },
} as const;

export async function coverageFor(
  endDate: string,
  contentDir?: string,
): Promise<ArticleSummary[]> {
  const all = await listArticles(contentDir);
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

export async function generateWeekly(date: string): Promise<string> {
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
    max_tokens: 3500,
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
    title: string;
    slug: string;
    dek: string;
    tags: string[];
    body_mdx: string;
    illustration_prompt: string;
    illustration_alt: string;
  };

  const fromDate = covered[covered.length - 1]?.date ?? date;
  const toDate = covered[0]?.date ?? date;
  const meanSignal =
    signalCount > 0 ? Math.round(totalSignal / signalCount) : 0;

  const frontmatter = {
    title: out.title,
    slug: out.slug,
    date,
    type: "weekly" as const,
    dek: out.dek,
    tags: ["weekly", ...out.tags.filter((t) => t !== "weekly")].slice(0, 5),
    sources: [],
    illustration: {
      path: `/illustrations/${date}-weekly.webp`,
      prompt: out.illustration_prompt,
      alt: out.illustration_alt,
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
  return writeMdxFile(`${date}-weekly.mdx`, frontmatter, out.body_mdx);
}
