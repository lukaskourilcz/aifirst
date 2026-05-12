#!/usr/bin/env tsx
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import YAML from "yaml";

type SeedDispatch = { title: string; body: string; source_url?: string };
type SeedWire = { title: string; url: string; source: string };
type SeedKind = "daily" | "weekly";

type Seed = {
  date: string;
  slug: string;
  title: string;
  dek: string;
  tags: string[];
  sources: Array<{ id: string; url: string; title: string }>;
  illustration: { alt: string; prompt: string; gradient: [string, string] };
  signal_strength: number;
  dispatches: SeedDispatch[];
  wire: SeedWire[];
  kind?: SeedKind;
  filenameSuffix?: string;
  digest?: { from: string; to: string; covered_slugs: string[] };
};

const seeds: Seed[] = [
  {
    date: "2026-05-10",
    slug: "2026-05-10-the-weekend-the-context-windows-cracked-open",
    title: "The weekend the context windows cracked open",
    dek: "Three labs shipped million-token models within forty-eight hours. The interesting fight isn’t about size any more.",
    tags: ["ai", "models", "infrastructure"],
    signal_strength: 84,
    sources: [
      { id: "anthropic-news", url: "https://www.anthropic.com/news/claude-opus-4-7-1m-context", title: "Claude Opus 4.7 with 1M context" },
      { id: "openai-blog", url: "https://openai.com/news/long-context-evals", title: "OpenAI on long-context evals" },
      { id: "deepmind-blog", url: "https://deepmind.google/blog/gemini-3-long-context", title: "Gemini 3 long-context release notes" },
      { id: "interconnects", url: "https://www.interconnects.ai/p/long-context-isnt-memory", title: "Long context isn’t memory" },
    ],
    illustration: {
      alt: "Concentric ribbons of cyan and magenta light unfurling from a dark horizon.",
      prompt: "A vast dark observation deck looking out at a slowly opening iris of cyan and magenta light against a starless sky.",
      gradient: ["#0a1838", "#1a0d33"],
    },
    dispatches: [
      { title: "Anthropic deprecates two retired models", body: "Anthropic quietly retired two pre-4.0 Claude models from the API this morning. Customers on enterprise tier received 90-day migration windows; everyone else has 30. The interesting part is what was kept: the smallest models in the family, which see surprisingly heavy use as fast filters in agentic pipelines and apparently were not expected to outlast their bigger siblings.", source_url: "https://docs.anthropic.com/en/docs/about-claude/model-deprecations" },
      { title: "Hugging Face crosses one million model uploads", body: "Hugging Face announced its repository passed one million distinct model uploads. The headline number is mostly fine-tunes — 78 percent are derivatives of fewer than 200 base checkpoints — but the long tail keeps growing. The platform is now closer to a software distribution than a model zoo, and the company is starting to talk about it that way.", source_url: "https://huggingface.co/blog/one-million" },
      { title: "A new benchmark for tool-use reliability", body: "A coalition of researchers from three labs released TURB, a benchmark for tool-use reliability that scores models on how often they retry broken tool calls without compounding errors. Early scores show a wide spread even among frontier models, and the authors note that capability and reliability are decoupling. The benchmark code is open-source under MIT." },
    ],
    wire: [
      { title: "Mistral releases 12B sparse MoE checkpoint", url: "https://mistral.ai/news/sparse-12b", source: "hn-frontpage" },
      { title: "EU AI Act enters phase-3 enforcement", url: "https://www.theverge.com/eu-ai-act-phase-three", source: "the-verge" },
      { title: "Cohere reports 60% drop in inference latency", url: "https://cohere.com/blog/latency-cuts", source: "techcrunch-ai" },
      { title: "Llama 4 distribution portal sees 2M downloads in 48h", url: "https://ai.meta.com/blog/llama-4-launch", source: "meta-ai" },
      { title: "Stratechery on the IDE vs the daemon", url: "https://stratechery.com/2026/the-ide-is-not-the-product/", source: "stratechery" },
      { title: "arXiv: 'On the limits of long-context retrieval'", url: "https://arxiv.org/abs/2605.01234", source: "arxiv-cs-ai" },
    ],
  },
  {
    date: "2026-05-11",
    slug: "2026-05-11-the-quiet-rewiring-of-the-developer-stack",
    title: "The quiet rewiring of the developer stack",
    dek: "Three tools you don’t hear about quietly replaced four you did. The IDE is not the centre of gravity any more.",
    tags: ["dev-tools", "ai", "ecosystem"],
    signal_strength: 78,
    sources: [
      { id: "hf-blog", url: "https://huggingface.co/blog/local-coder-agents", title: "Local coder agents, a benchmark" },
      { id: "simonw", url: "https://simonwillison.net/2026/may/10/cli-first-coding-agents/", title: "CLI-first coding agents" },
      { id: "stratechery", url: "https://stratechery.com/2026/the-ide-is-not-the-product/", title: "The IDE is not the product" },
      { id: "the-register", url: "https://www.theregister.com/2026/05/11/coding_agents_telemetry/", title: "What coding agents send home" },
    ],
    illustration: {
      alt: "A wireframe of cables converging into a single glowing terminal prompt, viewed from above.",
      prompt: "An overhead view of dozens of glowing cables routing toward a single terminal prompt at the centre of a dark workbench.",
      gradient: ["#0a1f1e", "#330d2a"],
    },
    dispatches: [
      { title: "GitHub adds inference-cost panel to repo settings", body: "GitHub rolled out a per-repo inference-cost panel to all paid plans. The number it shows is GitHub Actions plus any model-call billing routed through GitHub-managed proxies — not third-party API spend. The interesting framing is that GitHub is positioning itself as the cost-attribution layer for AI-heavy repos, which is a different role than 'place where your code lives'.", source_url: "https://github.blog/2026-05-11-inference-cost-panel" },
      { title: "VS Code ships agent host built into the editor", body: "VS Code's May insider build includes a headless agent host that runs in the editor's own process. It speaks the same MCP dialect as the major CLI agents and shares their state. The official line is that this 'unifies the experience'; the read-between-the-lines version is that Microsoft does not want to be the diff viewer.", source_url: "https://code.visualstudio.com/blogs/2026/05/11/agent-host" },
      { title: "A small win for reproducible agent runs", body: "An OSS project called replay-agent landed on Hacker News with a simple value proposition: deterministic replay of agent traces against pinned tool versions. It is rough, but it solves the audit problem that has quietly been blocking serious enterprise adoption. Expect this primitive to be subsumed into the major frameworks within two release cycles." },
    ],
    wire: [
      { title: "Zed announces Linux release", url: "https://zed.dev/blog/linux", source: "hn-frontpage" },
      { title: "Cursor revenue crosses $400M ARR", url: "https://www.theinformation.com/cursor-arr", source: "the-verge" },
      { title: "MCP servers reach 5000 entries on registry", url: "https://modelcontextprotocol.io/registry-milestone", source: "hf-blog" },
      { title: "JetBrains discontinues two plugins", url: "https://blog.jetbrains.com/2026/05/sunset", source: "the-register" },
      { title: "Replit adds agent-spend caps", url: "https://blog.replit.com/agent-budgets", source: "techcrunch-ai" },
      { title: "Vercel announces 'agent runtime' beta", url: "https://vercel.com/blog/agent-runtime", source: "techcrunch-ai" },
    ],
  },
  {
    date: "2026-05-12",
    slug: "2026-05-12-export-controls-meet-open-weights",
    title: "Export controls meet open weights",
    dek: "Two governments, one weekend, one collision. The era of frictionless model distribution is ending; the question is how loudly.",
    tags: ["policy", "open-source", "ai"],
    signal_strength: 91,
    sources: [
      { id: "mit-tech-review", url: "https://www.technologyreview.com/2026/05/12/open-weights-export-controls/", title: "Open weights meet export controls" },
      { id: "rest-of-world", url: "https://restofworld.org/2026/eu-model-licensing/", title: "Inside the EU’s model licensing draft" },
      { id: "anthropic-news", url: "https://www.anthropic.com/news/responsible-scaling-policy-v3", title: "Responsible scaling, version three" },
      { id: "meta-ai", url: "https://ai.meta.com/blog/llama-4-distribution-update", title: "Llama 4 distribution update" },
      { id: "import-ai", url: "https://jack-clark.net/2026/05/12/import-ai-policy-bulletin/", title: "Import AI weekly policy bulletin" },
    ],
    illustration: {
      alt: "A glowing model checkpoint represented as a crystalline shard, half passing through a thin magenta border line.",
      prompt: "A single crystalline shard glowing cyan from within, suspended mid-air as it crosses a thin magenta plane that fades into starfield.",
      gradient: ["#1a0d33", "#0a1f3a"],
    },
    dispatches: [
      { title: "UK announces its own draft framework", body: "Hours after the EU draft leaked, the UK's Department for Science, Innovation and Technology circulated a third, materially different framework. It sets thresholds at deployment scale rather than training compute and explicitly carves out academic releases. Whether the three frameworks converge in committee or compete in the wild is the question the rest of 2026 will turn on.", source_url: "https://www.gov.uk/government/news/uk-ai-framework-2026" },
      { title: "Inference clouds quietly add licence checks", body: "Two of the three major inference-cloud providers added a licence-verification step to their model deployment APIs this week, with no announcement. Asked for comment, both pointed to standing terms-of-service. The change is small but consequential: enforcement is moving from the download to the endpoint, exactly where the analysts said it would." },
      { title: "Open-weights advocates publish a counter-draft", body: "A coalition of academics and small labs published a counter-draft proposal that would treat compute-derived thresholds as evidence rather than dispositive. The draft has no legal standing but is being read carefully inside two governments. The signatories include three former regulators and a Turing Award winner.", source_url: "https://openweights.org/counter-draft" },
    ],
    wire: [
      { title: "OpenAI publishes new evaluations on weapons-uplift risk", url: "https://openai.com/safety/weapons-uplift", source: "openai-blog" },
      { title: "DeepMind's responsible-release framework v2", url: "https://deepmind.google/safety/release-framework-v2", source: "deepmind-blog" },
      { title: "Hugging Face adds region-aware hosting", url: "https://huggingface.co/blog/regional-hosting", source: "hf-blog" },
      { title: "Stratechery: 'The compliance layer is the moat now'", url: "https://stratechery.com/2026/compliance-moat/", source: "stratechery" },
      { title: "Simon Willison: notes on the EU draft", url: "https://simonwillison.net/2026/may/12/eu-draft/", source: "simonw" },
      { title: "The Register: what the UK draft actually says", url: "https://www.theregister.com/2026/05/12/uk-ai-draft/", source: "the-register" },
      { title: "Reuters: industry response is muted", url: "https://www.reuters.com/technology/ai-regulation-response/", source: "the-verge" },
    ],
  },
  {
    date: "2026-05-17",
    filenameSuffix: "-weekly",
    kind: "weekly",
    slug: "2026-05-17-weekly-the-inference-layer-takes-over",
    title: "The week the inference layer took over.",
    dek: "Cheap long context, headless coding agents, three competing export-controls drafts — and one centre of gravity underneath all of it.",
    tags: ["weekly", "ai", "policy", "dev-tools"],
    signal_strength: 84,
    sources: [],
    illustration: {
      alt: "A wide horizontal field of pale phosphor strata seen from far above, with a single bright vertical seam running through it.",
      prompt: "A horizon-wide stratified field seen from above, deep blue and violet tones, a single vertical seam of pale cyan light running floor to ceiling.",
      gradient: ["#0a1338", "#220a33"],
    },
    dispatches: [],
    wire: [],
    digest: {
      from: "2026-05-10",
      to: "2026-05-12",
      covered_slugs: [
        "2026-05-10-the-weekend-the-context-windows-cracked-open",
        "2026-05-11-the-quiet-rewiring-of-the-developer-stack",
        "2026-05-12-export-controls-meet-open-weights",
      ],
    },
  },
];

function illustrationSvg(seed: Seed): string {
  const lines = Array.from({ length: 18 }, (_, i) => {
    const y = 60 + i * 52;
    const weight = i % 4 === 0 ? 1.2 : 0.4;
    const opacity = 0.15 + (i % 5) * 0.04;
    return `<line x1="0" y1="${y}" x2="1536" y2="${y}" stroke="url(#line)" stroke-width="${weight}" opacity="${opacity}"/>`;
  }).join("");
  return [
    '<svg width="1536" height="1024" xmlns="http://www.w3.org/2000/svg">',
    "<defs>",
    '<radialGradient id="g1" cx="30%" cy="30%" r="70%">',
    `<stop offset="0%" stop-color="${seed.illustration.gradient[0]}" stop-opacity="1"/>`,
    '<stop offset="100%" stop-color="#05070d" stop-opacity="1"/>',
    "</radialGradient>",
    '<radialGradient id="g2" cx="80%" cy="80%" r="60%">',
    `<stop offset="0%" stop-color="${seed.illustration.gradient[1]}" stop-opacity="0.65"/>`,
    '<stop offset="100%" stop-color="#05070d" stop-opacity="0"/>',
    "</radialGradient>",
    '<linearGradient id="line" x1="0" y1="0" x2="1" y2="0">',
    '<stop offset="0" stop-color="#5cf0ff" stop-opacity="0"/>',
    '<stop offset="0.5" stop-color="#5cf0ff" stop-opacity="0.8"/>',
    '<stop offset="1" stop-color="#ff4fd8" stop-opacity="0"/>',
    "</linearGradient>",
    "</defs>",
    '<rect width="100%" height="100%" fill="#05070d"/>',
    '<rect width="100%" height="100%" fill="url(#g1)"/>',
    '<rect width="100%" height="100%" fill="url(#g2)"/>',
    lines,
    '<circle cx="480" cy="380" r="180" fill="none" stroke="#5cf0ff" stroke-width="1.2" opacity="0.35"/>',
    '<circle cx="1180" cy="700" r="240" fill="none" stroke="#ff4fd8" stroke-width="1" opacity="0.25"/>',
    `<text x="48" y="1000" font-family="monospace" font-size="22" fill="#8a93b8" opacity="0.8">aifirst · ${seed.date}${seed.filenameSuffix ?? ""} · cover · placeholder</text>`,
    "</svg>",
  ].join("");
}

async function makeIllustration(seed: Seed, dir: string) {
  const file = path.join(dir, `${seed.date}${seed.filenameSuffix ?? ""}.webp`);
  const buf = await sharp(Buffer.from(illustrationSvg(seed))).webp({ quality: 84 }).toBuffer();
  await fs.writeFile(file, buf);
  return file;
}

async function makePlaceholder(dir: string) {
  const file = path.join(dir, "placeholder.webp");
  const svg =
    '<svg width="1536" height="1024" xmlns="http://www.w3.org/2000/svg">' +
    '<rect width="100%" height="100%" fill="#0a0f1f"/>' +
    '<text x="50%" y="50%" text-anchor="middle" font-family="monospace" font-size="48" fill="#8a93b8">illustration pending</text>' +
    "</svg>";
  const buf = await sharp(Buffer.from(svg)).webp({ quality: 84 }).toBuffer();
  await fs.writeFile(file, buf);
}

async function main() {
  const articlesDir = path.join(process.cwd(), "content", "articles");
  const imagesDir = path.join(process.cwd(), "public", "illustrations");
  const bodiesDir = path.join(process.cwd(), "scripts", "seed-bodies");
  await fs.mkdir(articlesDir, { recursive: true });
  await fs.mkdir(imagesDir, { recursive: true });

  for (const seed of seeds) {
    const bodyFile = `${seed.date}${seed.filenameSuffix ?? ""}.mdx`;
    const body = await fs.readFile(path.join(bodiesDir, bodyFile), "utf8");
    const isWeekly = seed.kind === "weekly";
    const fm: Record<string, unknown> = {
      title: seed.title,
      slug: seed.slug,
      date: seed.date,
      ...(isWeekly ? { type: "weekly" } : {}),
      dek: seed.dek,
      tags: seed.tags,
      sources: seed.sources,
      illustration: {
        path: `/illustrations/${seed.date}${seed.filenameSuffix ?? ""}.webp`,
        prompt: seed.illustration.prompt,
        alt: seed.illustration.alt,
      },
      signal_strength: seed.signal_strength,
      dispatches: seed.dispatches,
      wire: seed.wire,
      ...(seed.digest ? { digest: seed.digest } : {}),
    };
    const yaml = YAML.stringify(fm)
      .trimEnd()
      .replace(/^(\s*)(date|from|to): (\d{4}-\d{2}-\d{2})$/gm, '$1$2: "$3"');
    const mdx = `---\n${yaml}\n---\n\n${body.trim()}\n`;
    const outFile = path.join(articlesDir, `${seed.date}${seed.filenameSuffix ?? ""}.mdx`);
    await fs.writeFile(outFile, mdx);
    const img = await makeIllustration(seed, imagesDir);
    console.error(`[seed] ${seed.date}${seed.filenameSuffix ?? ""} -> ${outFile} + ${img}`);
  }
  await makePlaceholder(imagesDir);
  console.error("[seed] done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
