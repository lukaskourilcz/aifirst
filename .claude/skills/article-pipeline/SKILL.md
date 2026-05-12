---
name: article-pipeline
description: How the daily curate -> write -> illustrate pipeline uses the Claude API, including prompt structure, caching, and the MDX frontmatter contract. Use when modifying lib/pipeline/* or the prompts.
---

# Article pipeline

Three steps, each a single Anthropic API call.

## 1. Curate (`lib/pipeline/curate.ts`)

- Model: `claude-sonnet-4-6`.
- Input: deduped `ScrapedItem[]` from the last 24h (cap ~80 items).
- System prompt (cached): editorial brief — "you are the senior editor
  of an AI tech magazine, pick the 5-8 items that, taken together, tell
  the story of today in tech & AI."
- Output: structured JSON via tool use:
  ```ts
  type CuratedBrief = {
    date: string;
    headline: string;     // working title
    angle: string;        // 1-paragraph thesis
    picks: Array<{
      itemId: string;
      why: string;        // why this matters today
    }>;
  };
  ```

## 2. Write (`lib/pipeline/write.ts`)

- Model: `claude-opus-4-7`.
- Input: `CuratedBrief` + full `ScrapedItem` records for the picks.
- System prompt (cached): style guide (see below).
- Output: a single MDX document plus an illustration prompt.

### MDX frontmatter contract

```mdx
---
title: "Headline"
slug: "2026-05-12-headline-slug"
date: "2026-05-12"
dek: "One-sentence subhead."
tags: [ai, hardware, policy]
sources:
  - { id: "hn-12345", url: "...", title: "..." }
illustration:
  path: "/illustrations/2026-05-12.webp"
  prompt: "..."
  alt: "..."
---

Body in MDX. ~800-1200 words. Sections separated by `##`.
```

### Style guide (lives in `lib/anthropic/style-guide.ts`, cached)

- Voice: confident, curious, slightly literary. Not a listicle.
- Lead with the most surprising development; use the others as context.
- Cite sources inline as `[link text](url)`; never invent URLs — only use
  URLs present in the input items.
- Avoid hype words ("revolutionary", "game-changer"). Prefer specifics.
- One paragraph musing on second-order effects is encouraged; keep it
  grounded.

## 3. Illustrate (`lib/pipeline/illustrate.ts`)

- Calls `getImageProvider().generate(prompt, { size: '1536x1024' })`.
- The prompt comes from the writer step; prepend a fixed style suffix
  defined in `lib/images/style.ts` — e.g.
  `", in the style of a futuristic sci-fi magazine cover, deep space
  palette with cyan and magenta accents, cinematic lighting, no text"`.
- Save as `public/illustrations/YYYY-MM-DD.webp`. If the provider returns
  PNG/JPEG, transcode via `sharp`.

## Prompt caching

Both curate and write calls reuse a long stable prefix (system prompt +
style guide). Mark those blocks with `cache_control: { type: 'ephemeral' }`
in the messages payload. Only the variable items belong outside the
cached region.

## Failure handling

- If curation returns fewer than 3 picks, abort the run — better no
  article than a thin one.
- If illustration fails, still publish the article with a placeholder
  pointing to `public/illustrations/placeholder.webp`. Log to stderr so
  the cron job surfaces it.
- The script must `exit(1)` on hard failures so the GitHub Action fails
  visibly.
