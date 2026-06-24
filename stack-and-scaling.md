# aifirst — AI Tech Magazine

A daily, fully static AI/tech magazine: a GitHub Actions cron scrapes ~20 sources, Claude curates and writes a bilingual (CS/EN) feature, and Vercel's CDN serves it.

> Scope note: this document describes what is *actually* in the repository today — verified against `package.json`, the GitHub Actions workflows in `.github/workflows/`, `.env.example`, `next.config.mjs`, `middleware.ts`, `sources.yml`, the `lib/pipeline/*` + `lib/images/*` code, and the render directives in `app/`. The central architectural fact: **content is generated once per day inside CI and committed to git; the public site is 100% prerendered static output.** Nothing about serving the magazine scales with the number of readers — generation cost is tied to *publishing frequency*, not traffic.

## Tech stack & current costs

### Hosting & delivery

- **Vercel (static hosting + CDN)** — hosts the Next.js build. Every route is `export const dynamic = "force-static"` (verified across `app/`); the build prerenders every article page, print page, per-tag page/feed, per-source page, OG image, JSON endpoint, sitemap and robots. Output is HTML/CSS/JS/`.webp` served from Vercel's edge CDN.
  - **Tier:** Vercel **Hobby** (free) — per README/DOCS ("free hobby tier covers a static site like this").
  - **Cost:** **$0/month.**
  - **Limitations:** 100 GB fast data transfer/month; **non-commercial use only** (the binding limit — see "At 100 active users"); 1 concurrent build; ~45-min build cap; Edge Middleware included up to ~1M invocations/month. No serverless functions are exercised at runtime (all routes are static), so function GB-hours are effectively unused.

- **Next.js 15 + React 19 (App Router, TypeScript strict)** — the framework. `next-mdx-remote` renders MDX, `next/og` (Node runtime) prerenders OpenGraph images at build time. `middleware.ts` runs an **Edge Middleware** locale rewrite (`/` → `/en`) on every non-excluded request — the only compute on the read path.
  - **Tier/cost:** open-source, **$0** (cost is the Vercel build/serve above).
  - **Limitations:** Middleware executes per-request at the edge (counts against Vercel's middleware-invocation allotment); MDX is read from the filesystem at build, so build time grows with article count.

- **Git / GitHub (content store + CMS)** — there is **no database**. Articles are MDX files in `content/articles/YYYY-MM-DD.{lang}.mdx`; illustrations are `.webp` in `public/illustrations/`. The daily bot commits them back and Vercel redeploys.
  - **Tier/cost:** GitHub Free, **$0.**
  - **Limitations:** content volume is bounded by build-time prerendering (DOCS notes a content DB is only needed "past ~10k issues" — ≈27 years of dailies).

### Content-generation pipeline (runs in GitHub Actions, not on Vercel)

- **Anthropic Claude API (`@anthropic-ai/sdk` ^0.40)** — the editorial brain. Per `lib/anthropic/models.ts` and the pipeline:
  - **Curate** (`lib/pipeline/curate.ts`): `claude-sonnet-4-6`, `max_tokens: 1500`, prompt caching on the system prompt — picks 3–8 items from the scraped pool.
  - **Write** (`lib/pipeline/write.ts`): `claude-opus-4-7`, `max_tokens: 8000`, prompt caching on the system prompt — writes the CS + EN feature, dispatches and wire in one tool call.
  - **Weekly** (`lib/pipeline/weekly.ts`): `claude-opus-4-7`, `max_tokens: 6000`, every Sunday.
  - **Tier/pricing (current):** usage-based, no plan. Opus 4.7 = **$5 / 1M input, $25 / 1M output**; Sonnet 4.6 = **$3 / 1M input, $15 / 1M output**.
  - **Cost:** ~**$0.15–0.30 per daily run** (Sonnet curate ≈ $0.03–0.05; Opus write ≈ $0.20–0.25, output-dominated near the 8k cap). **≈ $5–9/month** for dailies + **≈ $0.75/month** for the four-to-five weekly Opus calls.
  - **Limitations:** standard org rate limits (ITPM/OTPM/RPM) — irrelevant at 1–2 calls/day; cost is set by output length, not reader count.

- **fal.ai — FLUX `schnell` (image generation)** — pluggable behind `lib/images/provider.ts`. `lib/images/fal.ts` calls `fal-ai/flux/schnell` then re-encodes to `.webp` with **`sharp`**.
  - **Tier:** pay-as-you-go, **but the committed default is `IMAGE_PROVIDER=none`** (`.env.example`), which writes a flat 2.8 KB placeholder — the repo as configured generates **no images**.
  - **Cost:** **$0/month as shipped**; **≈ $0.10/month** if `IMAGE_PROVIDER=fal` (~$0.003/image × ~31).
  - **Limitations:** per-image billing, scales with publishing frequency; requires `FAL_KEY`.

- **Scraping stack — `rss-parser`, `cheerio`, `undici`, `yaml`** — `lib/scraping/*` reads the 20 sources in `sources.yml` (RSS, arXiv, Hacker News, Bluesky adapters), 6 concurrent. All targets are **free public feeds/APIs** (Anthropic/OpenAI/DeepMind blogs, Ars Technica, TechCrunch, arXiv, HN, Bluesky search, etc.).
  - **Tier/cost:** free, **$0.**
  - **Limitations:** public feeds can rate-limit or change markup; no paid data sources.

### CI / scheduling

- **GitHub Actions** — `.github/workflows/`: `daily.yml` (cron `0 6 * * *`), `weekly.yml` (cron `0 7 * * 0`), `regenerate.yml` (manual), `ci.yml` (lint + typecheck + test + `check:content` + build on push/PR). All on `ubuntu-latest`, Node 22, pnpm 10. Daily/weekly commit content back (`contents: write`).
  - **Tier:** GitHub Free.
  - **Cost:** **$0** (free/unlimited minutes for public repos; private repos get 2,000 min/month free — a daily run is ~2–3 min, ~60–90 s of which is the pipeline, so ~35 content runs + CI fit comfortably).
  - **Limitations:** 2,000 min/month on private Free; secrets `ANTHROPIC_API_KEY` / `FAL_KEY` required; single-threaded pipeline per run.

### Runtime external dependency (the one exception to "no runtime calls")

- **GitHub REST API (Actions runs) for `/health`** — `lib/health.ts` polls `api.github.com/.../actions/workflows/*/runs`. The `/health` route is the only non-fully-static page: `revalidate = 21600` (6 h ISR). Uses optional `GITHUB_TOKEN` for rate-limit headroom.
  - **Tier/cost:** free, **$0.**
  - **Limitations:** unauthenticated GitHub API = 60 req/h (authenticated = 5,000 req/h); on failure the page renders an "offline" state and never throws.

### Notable build-time / library dependencies (all free, OSS)

`gray-matter` (frontmatter), `next-mdx-remote` (MDX), `sharp` (image re-encode), `@playwright/test` + `vitest` (tests), `eslint` + `typescript` (CI). No analytics, no auth provider, no email service, no third-party scripts (CSP in `next.config.mjs` is `default-src 'self'`).

## Total current cost

**≈ $5–10 / month**, essentially **100% Anthropic API**; every other component sits on a free tier.

Usage assumptions behind that figure:
- **1 daily issue + 1 weekly digest**, generated in GitHub Actions, not per request.
- Each daily = 1 Sonnet curate call (~few-thousand-token input, 1.5k output) + 1 Opus write call (output-heavy, near the 8k cap for two languages). ≈ $0.15–0.30/day → **$5–9/mo**; weekly adds **~$0.75/mo**.
- **`IMAGE_PROVIDER=none`** as committed → **$0** for images (add ~$0.10/mo if switched to fal.ai).
- **Vercel Hobby + GitHub Actions free** → **$0** for hosting, CDN and CI.
- Traffic is small; the static site + CDN serve reads for free, and **reader count does not affect any of the above** because nothing is generated or computed per visit.

## Scaling — options & costs

The stack has an unusual property: the **read path** (serving the magazine) and the **write path** (generating it) are fully decoupled, so they scale independently.

### 1. Read traffic / bandwidth (Vercel Hobby)

The output is plain static assets, so this is the cheapest thing to scale.

- **Stay on Vercel Hobby** — free up to 100 GB/mo, but **non-commercial only**.
- **Vercel Pro** — **$20/mo per member**, 1 TB included transfer, commercial use allowed, higher build/middleware limits. The smallest "we're allowed to monetize" step.
- **Cloudflare Pages (recommended alternative)** — free tier allows commercial use with **unlimited bandwidth**; static export drops straight on it. **~$0/mo.** (Loses Vercel-native middleware/ISR; the locale rewrite would move to a Cloudflare function or be baked into static paths.)
- **Netlify free** (100 GB/mo) or **S3 + CloudFront / Cloudflare R2** self-host — **$0–5/mo** at low volume.

### 2. Generation cost (Anthropic) — scales with publishing, not readers

- **Reduce per-issue cost:** lower `write` `max_tokens`, or move `write` to `claude-sonnet-4-6` ($3/$15 vs $5/$25) → roughly halves the dominant line item.
- **Increase cadence/length:** cost scales linearly — e.g. 3 issues/day ≈ **$15–27/mo**.
- **Batch API** (50% off) for non-real-time generation → ~halves API cost.
- Real images via **fal.ai** (~$0.003/img), **Replicate**, or **OpenAI images** — pennies/month at one image per issue.

### 3. Build time / content volume

Every article is prerendered (page + print + OG image), so build minutes grow with the archive.

- **Hundreds–low thousands of articles:** still fine on Hobby/Pro; build is ~2 min today.
- **Past ~10k issues** (DOCS' own threshold): switch from full static prerender to **On-Demand ISR** or introduce a **content database** (e.g. **Neon Free** / **Supabase Free**, $0; paid tiers ~$19–25/mo) and query instead of `readdir`.

### 4. CI minutes (GitHub Actions)

- Public repo → **$0** (unlimited). Private → add minutes (**$0.008/min** beyond 2,000) or attach a **self-hosted runner** (~$0 on a spare box). Not a realistic bottleneck at daily cadence.

### 5. The `/health` GitHub API dependency

- Already cached at 6 h ISR; add/keep `GITHUB_TOKEN` to move from 60 → 5,000 req/h. **$0.**

## At 100 active users

Concretely, for *this* app, "100 active users" means **100 readers of a static, CDN-served site** — there are no accounts, no comments, no per-user state, and no runtime API calls on the content pages (only the 6 h-cached `/health` ISR). So:

- **Which limit you hit first:** **none that is technical.** The first real constraint is **Vercel Hobby's non-commercial-use clause** — a *licensing* limit, not a capacity one. If the magazine stays a personal/non-commercial project, 100 readers cost nothing new; if it carries ads or becomes a business, you must move off Hobby regardless of how little traffic you have.
- **What would break or slow down:** essentially nothing. Estimated load from 100 monthly-active readers ≈ 100 users × ~10 page views × ~0.3–0.6 MB/view (HTML + CSS/JS + one `.webp` illustration; illustrations are 2.8 KB placeholders today, ~100–300 KB with real FLUX output) ≈ **0.3–0.6 GB/month — under 1% of Hobby's 100 GB**. Edge-middleware invocations ≈ a few thousand/month vs ~1M included. The CDN absorbs all of it.
- **New estimated monthly cost:** **unchanged at ~$5–10/month** (still Anthropic-dominated), because generation runs once/day in CI no matter how many people read it. If the non-commercial clause forces a move: **+$20/mo for Vercel Pro**, or **$0 by deploying the static export to Cloudflare Pages**.
- **How the architecture would have to change:** for 100 *readers*, **it doesn't** — the pieces the prompt asks about are already in place or unnecessary: a CDN is built in (Vercel/Cloudflare edge), there is **no database to add read replicas to**, content is **pre-rendered** so there's nothing to cache at request time, and the only "background job" (daily generation) already exists as the GitHub Actions cron. This design is deliberately scale-insensitive on the read side.

  The architecture only needs to transform if "100 active users" implies **interactivity that the repo doesn't have today** — and that's the more useful planning lens:
  - **Comments / discussion:** add a service (giscus on GitHub Discussions, **$0**; or a DB-backed comments service).
  - **Accounts / personalization / saved reading:** introduces the first stateful tier — an **auth provider** (Clerk/Auth.js, free → ~$25/mo) and a **database** (**Neon/Supabase Free**, $0 at this size), plus moving some pages off pure static to ISR/SSR (Vercel functions, still within Pro).
  - **Email newsletter delivery** (the `/api/today.json` endpoint is clearly built for this): add **Resend/Postmark** (~free up to a few thousand emails, then ~$10–20/mo) and a queue/cron to fan out.
  - **Analytics:** **Vercel Web Analytics** or **Plausible** (~$9/mo) — none today.

  Each of these adds a managed service and a small recurring cost, but **none is required by reader volume at 100 users** — they're product decisions, not capacity responses. The honest bottom line: at 100 active users this repository runs on the same **~$5–10/month, free-tier-everything** footprint it has today; the work is licensing (commercial hosting) and optional product features, not scaling the infrastructure.
