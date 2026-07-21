# NEEDED — operator setup for Caught Up

The Caught Up implementation is merged into `main`. The public site builds with
no private credentials, but publishing a newly generated edition requires the
operator setup below. Each task carries an importance score `[imp:N]` (1–5,
5 = highest) and an OwnDashboard owner marker.

The 2026-07-21 audit found no custom GitHub Actions secrets or variables in this
repository, so the required items are not merely documentation placeholders.

## Required before the first generated edition

- [ ] **Add `ANTHROPIC_API_KEY` as a GitHub Actions secret** — daily, weekly and regeneration workflows cannot write an edition without it. Add it under repository **Settings → Secrets and variables → Actions → Secrets**. `[imp:5]` `[owner:me]`
- [ ] **Set the canonical URL in both deploy and generation environments** — add `NEXT_PUBLIC_SITE_URL=https://your-domain.example` in Vercel and as a GitHub Actions variable. This keeps canonicals, feeds, share packs and JSON contracts on the real origin. Do not include a trailing slash. `[imp:5]` `[owner:me]`
- [ ] **Confirm Vercel deploys `main`** — GitHub now uses `main` as its default branch and scheduled publishing pushes there. In Vercel, set **Settings → Git → Production Branch** to `main`, add `NEXT_PUBLIC_GITHUB_REPO=lukaskourilcz/aifirst`, then redeploy. `[imp:5]` `[owner:me]`
- [ ] **Run one safe end-to-end generation** — dispatch `daily.yml` with `publish_mode=dry_run`, `image_provider=none`, `language=en`, and `skip_embeddings=true`; inspect the run report and generated MDX artifact before allowing the next scheduled `auto` run. `[imp:5]` `[owner:me]`

## Operational decisions after the first successful run

- [ ] **Set generation budgets in `config/editorial.yml`** — use the first run report to choose `warningCostPerRun`, `hardCostPerRun`, `monthlyWarning`, `monthlyHardLimit`, and the translation budget. They are deliberately `null` until real usage exists. `[imp:4]` `[owner:me]`
- [ ] **Allow Actions-created pull requests if review mode will be used** — repository settings currently report `can_approve_pull_request_reviews=false`. Enable **Actions → General → Allow GitHub Actions to create and approve pull requests** so manual `pull_request` runs and enforced quality fallbacks can open review PRs. `[imp:4]` `[owner:me]`
- [ ] **Choose when quality checks should block publishing** — guardrails currently run in `report_only`. After reviewing several reports, change `quality.enforcement` to `enforce`; keep `failureAction: pull_request` for a safe rollout, or choose `skip`. `[imp:4]` `[owner:me]`
- [ ] **Add `HEARTBEAT_URL` as an Actions secret and configure a monitor** — the workflow pings it only after a successful automatic daily publish. `[imp:3]` `[owner:me]`

## Optional enhancements

- [ ] **Choose a scheduled illustration provider** — edit `illustration.provider` in `config/editorial.yml` (`none`, `nasa`, `picsum`, or `fal`). `none` is the zero-cost default; `nasa` and `picsum` need no paid account; `fal` requires `FAL_KEY`. A GitHub `IMAGE_PROVIDER` variable may override the committed default for scheduled runs. `[imp:2]` `[owner:me]`
- [ ] **Connect OwnDashboard telemetry** — add `OWNDASHBOARD_RUN_REPORT_URL` and `OWNDASHBOARD_RUN_REPORT_TOKEN` as Actions secrets after the receiving endpoint exists. The callback is bounded and non-fatal; Actions artifacts remain available for 30 days. `[imp:3]` `[owner:me]`
- [ ] **Add optional source credentials** — `STACKEXCHANGE_KEY` is the most useful in CI; `GUARDIAN_API_KEY`, `NYTIMES_API_KEY`, `GNEWS_API_KEY`, and `FIRECRAWL_API_KEY` expand or strengthen coverage. Missing sources self-skip. `[imp:2]` `[owner:me]`
- [ ] **Enable semantic related issues** — add `JINA_API_KEY`, then dispatch with `skip_embeddings=false`. Without it, related issues continue to use tag overlap. `[imp:2]` `[owner:me]`
- [ ] **Configure a build-time GitHub health token in Vercel** — because the repository is private, add a read-only `GITHUB_TOKEN` only if `/health` should include workflow history. The public JSON health endpoint never exposes it. `[imp:2]` `[owner:me]`
- [ ] **Enable paid or model-written promotion only if wanted** — `FAL_MODEL_PATH` can override the default `fal-ai/flux/schnell`; `GENERATE_PROMOTION=true` adds another Anthropic call; `PROMOTION_TOKEN` gates the unlisted `/promotion` page in Vercel. All three remain off by default. `[imp:1]` `[owner:me]`
- [ ] **Configure an Anthropic-compatible gateway only if needed** — add `ANTHROPIC_BASE_URL` as an Actions secret when using a gateway for centralized spend controls or routing. Direct Anthropic API access is the supported default. `[imp:1]` `[owner:me]`

## Already handled in the repository

- GitHub’s default branch is `main`, and the rebrand/product work is merged.
- The reading progress bar is native and adds no Motion dependency.
- Scheduled workflows use committed editorial, model, review, publishing and
  illustration defaults, with optional validated workflow overrides.
- The public reader remains static and needs no database, migration, public
  authentication, OwnDashboard connection, or runtime AI key.
- The repository, package name and internal `aifirst` identifiers intentionally
  remain unchanged for compatibility; the reader-facing brand is Caught Up.
