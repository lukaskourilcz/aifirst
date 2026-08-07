# Caught Up (`aifirst`)

Caught Up is a bilingual, Git-native daily briefing about the AI and technology
stories that mattered. BoardlessAI produces and reviews each English/Czech
edition, then a narrowly scoped GitHub App delivers validated MDX and optional
hero media. This repository independently validates and publishes the static
reader.

## Tech stack

- **Reader:** Next.js App Router, React and strict TypeScript.
- **Content:** Git-tracked MDX in `content/articles/`; Git is canonical.
- **Daily widgets:** append-only JSON datasets in `data/` drive a daily AI lesson
  and a daily verified fact on Today, plus the `/lekce` archive. Server-rendered
  at build time from the newest edition's date; no client JavaScript, no runtime
  cost. `config/banner.json` reserves one partner slot, empty by default.
- **Delivery:** `edition-package/1` consumer restricted to dated bilingual MDX,
  one required dated WebP for each new article and sanitized board context.
- **Automation:** GitHub Actions CI plus a Prague-aware missed-publication
  sentinel; no generation workflow runs here.
- **Deployment:** Vercel Pro static/SSG output with Web Analytics and Speed
  Insights.
- **Quality:** ESLint, TypeScript, Vitest, content/contract validation, a 110 kB
  gzip page-entry guard and Playwright.

## External boundaries

- **BoardlessAI (`lukaskourilcz/quorum`)** owns collection, curation, writing,
  Czech localization, editorial review, illustrations, social packs, budgets,
  meeting records and delivery.
- **GitHub** stores canonical content and runs validation/sentinel workflows.
- **Vercel** serves the reader. No database, runtime model call, CMS, reader
  account or operator login sits in the public path.
- **OwnDashboard** may read health and workflow history when configured; it does
  not generate or mutate editions.

`gray-matter`, `next-mdx-remote` and `yaml` implement the reader-side content and
registry contracts. `sharp` is used for static image/metadata work during builds.
