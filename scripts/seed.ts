#!/usr/bin/env tsx
// Seed the repo with sample issues + placeholder illustrations so the
// site is functional and beautiful on a fresh clone. Idempotent.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import YAML from "yaml";

type Seed = {
  date: string;
  slug: string;
  title: string;
  dek: string;
  tags: string[];
  sources: Array<{ id: string; url: string; title: string }>;
  illustration: { alt: string; prompt: string; gradient: [string, string] };
};

const seeds: Seed[] = [
  {
    date: "2026-05-10",
    slug: "2026-05-10-the-weekend-the-context-windows-cracked-open",
    title: "The weekend the context windows cracked open",
    dek: "Three labs shipped million-token models within forty-eight hours. The interesting fight isn’t about size any more.",
    tags: ["ai", "models", "infrastructure"],
    sources: [
      { id: "01", url: "https://www.anthropic.com/news/claude-opus-4-7-1m-context", title: "Claude Opus 4.7 with 1M context" },
      { id: "02", url: "https://openai.com/news/long-context-evals", title: "OpenAI on long-context evals" },
      { id: "03", url: "https://deepmind.google/blog/gemini-3-long-context", title: "Gemini 3 long-context release notes" },
      { id: "04", url: "https://www.interconnects.ai/p/long-context-isnt-memory", title: "Long context isn’t memory" },
    ],
    illustration: {
      alt: "Concentric ribbons of cyan and magenta light unfurling from a dark horizon, suggesting an expanding aperture.",
      prompt: "A vast dark observation deck looking out at a slowly opening iris of cyan and magenta light against a starless sky, sense of scale and quiet.",
      gradient: ["#0a1838", "#1a0d33"],
    },
  },
  {
    date: "2026-05-11",
    slug: "2026-05-11-the-quiet-rewiring-of-the-developer-stack",
    title: "The quiet rewiring of the developer stack",
    dek: "Three tools you don’t hear about quietly replaced four you did. The IDE is not the centre of gravity any more.",
    tags: ["dev-tools", "ai", "ecosystem"],
    sources: [
      { id: "01", url: "https://huggingface.co/blog/local-coder-agents", title: "Local coder agents, a benchmark" },
      { id: "02", url: "https://simonwillison.net/2026/may/10/cli-first-coding-agents/", title: "CLI-first coding agents" },
      { id: "03", url: "https://stratechery.com/2026/the-ide-is-not-the-product/", title: "The IDE is not the product" },
      { id: "04", url: "https://www.theregister.com/2026/05/11/coding_agents_telemetry/", title: "What coding agents send home" },
    ],
    illustration: {
      alt: "A wireframe of cables converging into a single glowing terminal prompt, viewed from above.",
      prompt: "An overhead view of dozens of glowing cables routing toward a single terminal prompt at the centre of a dark workbench, schematic feel.",
      gradient: ["#0a1f1e", "#330d2a"],
    },
  },
  {
    date: "2026-05-12",
    slug: "2026-05-12-export-controls-meet-open-weights",
    title: "Export controls meet open weights",
    dek: "Two governments, one weekend, one collision. The era of frictionless model distribution is ending; the question is how loudly.",
    tags: ["policy", "open-source", "ai"],
    sources: [
      { id: "01", url: "https://www.technologyreview.com/2026/05/12/open-weights-export-controls/", title: "Open weights meet export controls" },
      { id: "02", url: "https://restofworld.org/2026/eu-model-licensing/", title: "Inside the EU’s model licensing draft" },
      { id: "03", url: "https://www.anthropic.com/news/responsible-scaling-policy-v3", title: "Responsible scaling, version three" },
      { id: "04", url: "https://ai.meta.com/blog/llama-4-distribution-update", title: "Llama 4 distribution update" },
      { id: "05", url: "https://jack-clark.net/2026/05/12/import-ai-policy-bulletin/", title: "Import AI weekly policy bulletin" },
    ],
    illustration: {
      alt: "A glowing model checkpoint represented as a crystalline shard, half passing through a thin red border line.",
      prompt: "A single crystalline shard glowing cyan from within, suspended mid-air as it crosses a thin magenta plane that fades into starfield.",
      gradient: ["#1a0d33", "#0a1f3a"],
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
    `<text x="48" y="1000" font-family="monospace" font-size="22" fill="#8a93b8" opacity="0.8">aifirst · ${seed.date} · cover · placeholder</text>`,
    "</svg>",
  ].join("");
}

async function makeIllustration(seed: Seed, dir: string) {
  const file = path.join(dir, `${seed.date}.webp`);
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
    const body = await fs.readFile(path.join(bodiesDir, `${seed.date}.mdx`), "utf8");
    const fm = {
      title: seed.title,
      slug: seed.slug,
      date: seed.date,
      dek: seed.dek,
      tags: seed.tags,
      sources: seed.sources,
      illustration: {
        path: `/illustrations/${seed.date}.webp`,
        prompt: seed.illustration.prompt,
        alt: seed.illustration.alt,
      },
    };
    const yaml = YAML.stringify(fm)
      .trimEnd()
      .replace(/^date: (\d{4}-\d{2}-\d{2})$/m, 'date: "$1"');
    const mdx = `---\n${yaml}\n---\n\n${body.trim()}\n`;
    const file = path.join(articlesDir, `${seed.date}.mdx`);
    await fs.writeFile(file, mdx);
    const img = await makeIllustration(seed, imagesDir);
    console.error(`[seed] ${seed.date} -> ${file} + ${img}`);
  }
  await makePlaceholder(imagesDir);
  console.error("[seed] done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
