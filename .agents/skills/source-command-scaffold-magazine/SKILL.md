---
name: "source-command-scaffold-magazine"
description: "Bootstrap the Next.js app, lib skeleton, and config for the aifirst magazine."
---

# source-command-scaffold-magazine

Use this skill when the user asks to run the migrated source command `scaffold-magazine`.

## Command Template

Scaffold the project per `AGENTS.md` and the architecture skill. Do all
of the following in one pass.

## Steps

1. Read `AGENTS.md` and `.Codex/skills/magazine-architecture/SKILL.md`
   so the conventions are fresh.
2. Initialise `package.json` (pnpm), TypeScript strict, Next.js 15 App
   Router. Install:
   - runtime: `next`, `react`, `react-dom`, `@anthropic-ai/sdk`,
     `rss-parser`, `cheerio`, `undici`, `yaml`, `sharp`, `gray-matter`,
     `next-mdx-remote`.
   - dev: `typescript`, `@types/node`, `@types/react`, `vitest`,
     `eslint`, `eslint-config-next`, `tsx`.
3. Create the target layout from `AGENTS.md`:
   - `app/layout.tsx`, `app/page.tsx`, `app/articles/[slug]/page.tsx`,
     `app/archive/page.tsx`
   - `components/` with `CoverFrame`, `DataStrip`, `ScanlineOverlay`,
     `GlowLink`, `Masthead`
   - `lib/anthropic/{client,style-guide}.ts`,
     `lib/anthropic/prompts/{curate,write}.ts`
   - `lib/scraping/{types,run,rss,html,hn,arxiv}.ts`
   - `lib/pipeline/{curate,write,illustrate,persist}.ts`
   - `lib/images/{provider,style,fal,none}.ts`
   - `scripts/generate-daily.ts`, `scripts/scrape-dry.ts`
4. Drop in `sources.yml` seeded per the tech-source-scraper skill (HN,
   arXiv, Ars Technica AI, The Verge AI, MIT Tech Review AI, TechCrunch
   AI, Anthropic, OpenAI, DeepMind, Hugging Face, Simon Willison).
   **Verify each RSS URL with WebFetch before adding it.**
5. Create `.env.example` listing every required var
   (`ANTHROPIC_API_KEY`, `IMAGE_PROVIDER`, `FAL_KEY` etc).
6. Add the global stylesheet with the colour tokens from
   `.Codex/skills/sci-fi-design-system`.
7. Add `package.json` scripts:
   `dev`, `build`, `start`, `lint`, `typecheck`,
   `generate:daily` (runs `tsx scripts/generate-daily.ts`),
   `scrape:dry` (runs `tsx scripts/scrape-dry.ts`),
   `test` (vitest).
8. Add a GitHub Actions workflow `.github/workflows/daily.yml` running
   `pnpm generate:daily` on cron `0 6 * * *` and committing the result.
9. Run `pnpm install`, then `pnpm typecheck`. Fix anything red.
10. Commit on the current branch with a descriptive message. Do **not**
    push or open a PR unless asked.

## Don'ts

- Don't run `generate:daily` for real during scaffolding — no API keys.
- Don't fill in agent/skill stubs with placeholders that would need
  later cleanup. Write real, working scaffolding.
- Don't add a database or auth.
- Don't push to remote.

When done, summarise: what was created, what scripts exist, and what
the user needs to set up before `pnpm generate:daily` will work.
