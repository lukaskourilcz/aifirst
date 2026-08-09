# DNESKAi (`aifirst`)

DNESKAi is a Czech, Git-native daily briefing about the AI and technology
stories that mattered. Czech is the only published locale; every edition is
written once, natively in Czech, and there is no translation stage. BoardlessAI
produces and reviews each edition, then a narrowly scoped GitHub App delivers validated MDX and optional
hero media. This repository independently validates and publishes the static
reader.

## Tech stack

- **Reader:** Next.js App Router, React and strict TypeScript.
- **Content:** Git-tracked MDX in `content/articles/`; Git is canonical.
- **Sections:** six magazine sections beside the edition — Dnes, Poslední týden
  and its week chain, O čem se mluví, AI modely, Podcasty and Akce. All static,
  all reading committed JSON, all with honest empty states.
- **Daily widgets:** append-only JSON datasets in `data/` drive a daily AI lesson
  and a daily verified fact in the right rail, plus the `/lekce` archive.
  Server-rendered at build time from the newest edition's date; no client
  JavaScript, no runtime cost.
- **Streams and events:** `data/talked-about.json`, `data/podcasts.json` and
  `data/events.json` are synced wholesale by BoardlessAI and ship as valid empty
  envelopes. A failed sync costs a section, never a build.
- **Advertising:** `config/banner.json` reserves one 300x250 rail slot and one
  partner belt, both empty. Local files only, no script, no third-party host.
- **Delivery:** `edition-package/1` consumer restricted to the dated Czech MDX,
  the hero and thumbnail for each new article, and sanitized board context.
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
