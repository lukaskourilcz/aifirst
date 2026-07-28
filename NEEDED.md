# NEEDED — operator setup for Caught Up

The Caught Up implementation is merged into `main`. The public site builds with
no private credentials, but publishing a newly generated edition requires the
operator setup below. Each task carries an importance score `[imp:N]` (1–5,
5 = highest) and an OwnDashboard owner marker.

The 2026-07-21 audit found no custom GitHub Actions secrets or variables in this
repository, so the required items are not merely documentation placeholders.

## Required before the first generated edition

- [x] **Add `ANTHROPIC_API_KEY` as a GitHub Actions secret** — set 2026-07-28. ⚠️ rotate both pasted keys (they're in chat history). `[imp:5]` `[owner:me]` `[time:20m]` `[kind:setup]`
- [x] **Set the canonical URL in both deploy and generation environments** — GH Actions variable set + Vercel env vars pasted 2026-07-28. Default: `https://aifirst-zpx8.vercel.app`. Update both when a custom domain lands. `[imp:5]` `[owner:me]` `[time:1h]` `[kind:deploy]`
- [x] **Confirm Vercel deploys `main`** — env vars in, `main` confirmed as production branch (git-main alias + latest READY prod deploy). Trigger a redeploy to pick up new env vars. `[imp:5]` `[owner:me]` `[time:1h]` `[kind:deploy]`
- [x] **Run one safe end-to-end generation** — done 2026-07-28 (run `30403333515`). Pipeline succeeded end-to-end in 101 s: curate $0.044, write $0.150, total $0.194/run. Article rendered, 8 sources cited. ⚠️ workflow job hit 20-min timeout on a post-generation step (Refresh static / Verify) — investigate before unattended cron. `[imp:5]` `[owner:me]` `[time:1h]` `[kind:content]`

## Operational decisions after the first successful run

- [x] **Set generation budgets in `config/editorial.yml`** — applied 2026-07-28 from real data (baseline $0.194/run). Guardrails: warningCostPerRun 0.60, hardCostPerRun 1.50, monthlyWarning 20, monthlyHardLimit 40, translation.budgetPerRun 0.10. Adjust after first month of production data. `[imp:4]` `[owner:me]` `[time:30m]` `[kind:decision]`
- [ ] **Allow Actions-created pull requests if review mode will be used** — repository settings currently report `can_approve_pull_request_reviews=false`. Enable **Actions → General → Allow GitHub Actions to create and approve pull requests** so manual `pull_request` runs and enforced quality fallbacks can open review PRs. `[imp:4]` `[owner:me]` `[time:30m]` `[kind:decision]`
- [ ] **Choose when quality checks should block publishing** — guardrails currently run in `report_only`. After reviewing several reports, change `quality.enforcement` to `enforce`; keep `failureAction: pull_request` for a safe rollout, or choose `skip`. `[imp:4]` `[owner:me]` `[time:30m]` `[kind:decision]`
- [ ] **Add `HEARTBEAT_URL` as an Actions secret and configure a monitor** — the workflow pings it only after a successful automatic daily publish. `[imp:3]` `[owner:me]` `[time:1h]` `[kind:deploy]`

## Portfolio presence (2026-07-27)

The portfolio entry was renamed from "aifirst" to Caught Up in both locales and
its animated thumbnail re-recorded from the current design.

- [ ] **Confirm the public name** — the repository is `aifirst`, the product is Caught Up, and the portfolio now says Caught Up. Rename the GitHub repository and the Vercel project too if you want them consistent, or leave the repository name as the internal one. `[imp:2]` `[owner:me]` `[time:30m]` `[kind:decision]`
- [ ] **Re-record the thumbnail after any notable redesign** — the procedure is in `.claude/skills/preview-video/SKILL.md`; the output belongs in `nxt-portfolio/public/previews/aifirst/`. `[imp:2]` `[owner:ai]` `[time:30m]` `[kind:content]`

## Optional enhancements

- [ ] **Choose a scheduled illustration provider** — edit `illustration.provider` in `config/editorial.yml` (`none`, `nasa`, `picsum`, or `fal`). `none` is the zero-cost default; `nasa` and `picsum` need no paid account; `fal` requires `FAL_KEY`. A GitHub `IMAGE_PROVIDER` variable may override the committed default for scheduled runs. `[imp:2]` `[owner:me]` `[time:1h]` `[kind:content]`
- [ ] **Connect OwnDashboard telemetry** — add `OWNDASHBOARD_RUN_REPORT_URL` and `OWNDASHBOARD_RUN_REPORT_TOKEN` as Actions secrets after the receiving endpoint exists. The callback is bounded and non-fatal; Actions artifacts remain available for 30 days. `[imp:3]` `[owner:me]` `[time:20m]` `[kind:setup]`
- [ ] **Add optional source credentials** — `STACKEXCHANGE_KEY` is the most useful in CI; `GUARDIAN_API_KEY`, `NYTIMES_API_KEY`, `GNEWS_API_KEY`, and `FIRECRAWL_API_KEY` expand or strengthen coverage. Missing sources self-skip. `[imp:2]` `[owner:me]` `[time:1h]` `[kind:deploy]`
- [ ] **Enable the gated HTML sources (Nieman Lab, Tubefilter)** — these two `type: html` sources in `sources.yml` have no usable RSS feed and are fetched with the generic HTML adapter (`lib/scraping/html.ts`) plus a reader fallback (`lib/scraping/reader.ts`). The keyless Jina Reader handles them at low volume with no setup; for reliable resolution past their Cloudflare edge, add `FIRECRAWL_API_KEY` (Firecrawl free tier) — used first when present — or `JINA_API_KEY` to raise Jina's limits, as an Actions secret. With no key they self-skip and the rest of the registry is unaffected. `[imp:2]` `[owner:me]` `[time:15m]` `[kind:setup]`
- [ ] **Enable semantic related issues** — add `JINA_API_KEY`, then dispatch with `skip_embeddings=false`. Without it, related issues continue to use tag overlap. `[imp:2]` `[owner:me]` `[time:20m]` `[kind:setup]`
- [ ] **Configure a build-time GitHub health token in Vercel** — because the repository is private, add a read-only `GITHUB_TOKEN` only if `/health` should include workflow history. The public JSON health endpoint never exposes it. `[imp:2]` `[owner:me]` `[time:1h]` `[kind:deploy]`
- [ ] **Enable paid or model-written promotion only if wanted** — `FAL_MODEL_PATH` can override the default `fal-ai/flux/schnell`; `GENERATE_PROMOTION=true` adds another Anthropic call; `PROMOTION_TOKEN` gates the unlisted `/promotion` page in Vercel. All three remain off by default. `[imp:1]` `[owner:me]` `[time:20m]` `[kind:setup]`
- [ ] **Configure an Anthropic-compatible gateway only if needed** — add `ANTHROPIC_BASE_URL` as an Actions secret when using a gateway for centralized spend controls or routing. Direct Anthropic API access is the supported default. `[imp:1]` `[owner:me]` `[time:20m]` `[kind:setup]`

## Already handled in the repository

- GitHub’s default branch is `main`, and the rebrand/product work is merged.
- The reading progress bar is native and adds no Motion dependency.
- Scheduled workflows use committed editorial, model, review, publishing and
  illustration defaults, with optional validated workflow overrides.
- The public reader remains static and needs no database, migration, public
  authentication, OwnDashboard connection, or runtime AI key.
- The repository, package name and internal `aifirst` identifiers intentionally
  remain unchanged for compatibility; the reader-facing brand is Caught Up.

## Developer tooling

- [ ] **Install and initialize RTK (`rtk-ai/rtk`)** — RTK could not be set up from the Claude Code web session because its GitHub download host is outside the session's network allowlist (`github.com/rtk-ai/rtk` and its release binaries return HTTP 403). Set it up locally at home with the commands below, then enable it for this repository following `rtk --help` / the RTK docs (the exact per-repo command isn't documented here because the tool wouldn't install in the sandbox). `[imp:2]` `[owner:me]` `[time:20m]` `[kind:setup]`
- [x] **Enable Vercel Web Analytics for this project** — enabled 2026-07-28, confirmed ON via Vercel MCP. `[imp:2]` `[owner:me]` `[time:15m]` `[kind:setup]`
- [ ] **Report GitHub Actions crons to OwnDashboard** — add repository Actions secrets `OWNDASHBOARD_CRON_URL` (your OwnDashboard `/api/crons/log` URL) and `OWNDASHBOARD_CRON_TOKEN` (same value as OwnDashboard's `CRON_REGISTRY_TOKEN`) so the daily/weekly runs appear in the OwnDashboard Crons panel. `[imp:2]` `[owner:me]` `[time:10m]` `[kind:setup]`

```sh
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
rtk init --global
```
