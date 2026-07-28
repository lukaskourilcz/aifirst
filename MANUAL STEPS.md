# Manual Steps — Caught Up operator setup

Extracted from `NEEDED.md` on 2026-07-28. Every item here needs your credentials,
approvals, or a decision on real usage. Work top-down: `imp:5` blocks the first
generated edition, `imp:4` gates safe automation, `imp:3` is telemetry, `imp:1–2`
are optional or cosmetic.

Mark each `[ ]` as `[x]` when done, and mirror the change back into `NEEDED.md`
so the two files stay in sync.

---

## Blocking — required before the first generated edition (imp:5)

- [x] **Add `ANTHROPIC_API_KEY` as a GitHub Actions secret** — set 2026-07-28 (second key worked; the first was invalid).
  - ⚠️ **Rotate both pasted keys** in the Anthropic console — they appear in this chat transcript.

- [x] **Set the canonical site URL in Vercel *and* GitHub Actions** — done 2026-07-28
  - GitHub Actions variable `NEXT_PUBLIC_SITE_URL=https://aifirst-zpx8.vercel.app` set. Vercel env vars pasted by user. Update both when a custom domain lands:
    ```sh
    gh variable set NEXT_PUBLIC_SITE_URL --repo lukaskourilcz/aifirst --body 'https://your-real-domain.example'
    ```
  - Trigger a Vercel redeploy so the new env vars take effect on the running production build.

- [x] **Confirm Vercel deploys `main`** — env vars in, main is the production branch (git-main alias + latest READY production deploy). Trigger a fresh redeploy in aifirst-zpx8 to pick up the new env vars.

- [x] **Run one safe end-to-end generation** — done 2026-07-28 (run `30403333515`)
  - Article generated successfully. Pipeline stages all `success`:
    - Scrape 2.8 s / Curate 20.8 s (Sonnet, $0.044) / Write 77.6 s (Opus, $0.150) / Illustrate 41 ms / Persist 34 ms.
    - **Per-run cost: $0.194 USD**, 8 items selected from 8 sources, signal strength 84, 947 words.
  - MDX artifact at `/tmp/aifirst-run2/daily-2026-07-28-30403333515/content/articles/2026-07-28.en.mdx`.
  - **Known bug:** the `job` timed out at 20 min even though the pipeline itself finished in 101 s — a step after `Generate daily edition` (likely `Refresh static intelligence data` or `Verify generated publication`) hangs. Worth investigating separately before the daily cron runs unattended.

---

## Operational — after the first successful run (imp:4)

- [x] **Set generation budgets in `config/editorial.yml`** — applied 2026-07-28 from real run data
  - Baseline: $0.194/run (en). Applied guardrails:
    - `warningCostPerRun: 0.60` (≈3× baseline — flags outliers early without noise)
    - `hardCostPerRun: 1.50` (≈8× — kills genuine runaway generations)
    - `monthlyWarning: 20` (≈$8-12/mo expected, warn on 2× that)
    - `monthlyHardLimit: 40`
    - `translation.budgetPerRun: 0.10`
  - Adjust once the first month's real spend is visible.

- [ ] **Allow GitHub Actions to create/approve PRs** (~30m)
  - **Settings → Actions → General → Workflow permissions** → tick *Allow GitHub Actions to create and approve pull requests*.
  - Required so manual `pull_request` runs and quality-fallback PRs can actually open.
  - I can toggle this via API if you give me a token with `admin:repo_hook` or fine-grained *Administration: write* — my current `gh` token lacks the scope. Otherwise it's a two-click job in the UI.

- [ ] **Decide when quality checks should block publishing** (~30m)
  - In `config/editorial.yml`: `quality.enforcement` starts as `report_only`.
  - After a few reports, flip to `enforce`; keep `failureAction: pull_request` for a soft rollout, or set `skip` to just log.

- [ ] **Add `HEARTBEAT_URL` and wire an uptime monitor** (~1h)
  - Add as Actions secret. The workflow only pings it after a successful automatic daily publish, so a missing ping means the pipeline stalled.

---

## Telemetry & integrations (imp:2–3)

- [ ] **Connect OwnDashboard run reports** (~20m)
  - Add Actions secrets `OWNDASHBOARD_RUN_REPORT_URL` and `OWNDASHBOARD_RUN_REPORT_TOKEN`.
  - Callback is bounded and non-fatal; skip if the receiving endpoint doesn't exist yet.

- [ ] **Report Actions crons to OwnDashboard** (~10m)
  - Add Actions secrets `OWNDASHBOARD_CRON_URL` (your OwnDashboard `/api/crons/log`) and `OWNDASHBOARD_CRON_TOKEN` (matches OwnDashboard's `CRON_REGISTRY_TOKEN`).
  - Makes daily/weekly runs appear in the OwnDashboard Crons panel.

- [x] **Enable Vercel Web Analytics** — done 2026-07-28, confirmed ON via MCP (`get_web_analytics` now returns 0 visitors / 0 pageviews with no error).

- [ ] **Install RTK locally** (~20m)
  - Run at home (GitHub's release host is blocked from the Claude Code sandbox):
    ```sh
    curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
    rtk init --global
    ```
  - Then enable it for this repo per `rtk --help` / RTK docs.

---

## Content, sources, illustrations (imp:1–2)

- [ ] **Confirm the public name** (~30m)
  - Repo is `aifirst`, product is Caught Up, portfolio says Caught Up.
  - Optional: rename the GitHub repo and Vercel project for consistency, or leave the repo as the internal name.

- [ ] **Choose a scheduled illustration provider** (~1h)
  - In `config/editorial.yml`: `illustration.provider` ∈ `none | nasa | picsum | fal`.
  - `none` is free; `nasa` / `picsum` need no key; `fal` needs `FAL_KEY`.
  - A GitHub `IMAGE_PROVIDER` variable can override the committed default per scheduled run.

- [ ] **Add optional source credentials** (~1h)
  - `STACKEXCHANGE_KEY` gives the biggest CI boost.
  - `GUARDIAN_API_KEY`, `NYTIMES_API_KEY`, `GNEWS_API_KEY`, `FIRECRAWL_API_KEY` broaden coverage.
  - Missing sources self-skip — no failure.

- [ ] **Enable the gated HTML sources (Nieman Lab, Tubefilter)** (~15m)
  - Zero-setup: the keyless Jina Reader already handles them at low volume.
  - Better: add `FIRECRAWL_API_KEY` (free tier, tried first) or `JINA_API_KEY` (raises Jina limits) as an Actions secret.
  - Without any key both sources self-skip.

- [ ] **Enable semantic related-issue matching** (~20m)
  - Add `JINA_API_KEY`, then dispatch a run with `skip_embeddings=false`.
  - Fallback without it is tag overlap, which already works.

- [ ] **Add a build-time GitHub token in Vercel** (~1h)
  - Only needed if `/health` should show workflow history for this private repo.
  - Read-only `GITHUB_TOKEN` env var in Vercel. The public JSON health endpoint never exposes it.

- [ ] **Enable paid or model-written promotion (optional)** (~20m)
  - `FAL_MODEL_PATH` overrides `fal-ai/flux/schnell`.
  - `GENERATE_PROMOTION=true` adds an extra Anthropic call for IG/Threads copy.
  - `PROMOTION_TOKEN` gates the unlisted `/promotion` page in Vercel.
  - All three off by default.

- [ ] **Configure an Anthropic-compatible gateway (optional)** (~20m)
  - Add `ANTHROPIC_BASE_URL` as an Actions secret only if you're routing through a gateway for spend controls. Default direct-API access is supported.

---

## Session summary — 2026-07-28

**Done in-session:**
- ANTHROPIC_API_KEY set (second key; first was invalid).
- NEXT_PUBLIC_SITE_URL Actions variable set to `https://aifirst-zpx8.vercel.app`.
- Vercel env vars pasted, Web Analytics enabled (MCP-confirmed), production branch confirmed = `main`.
- Dry-run of `daily.yml` produced a real article at $0.194/run.
- `config/editorial.yml` budgets applied from real data.

**Known blocker for unattended crons:**
- The `daily.yml` job wall-clock timed out at 20 min even though the pipeline finished in 101 s. A step between `Generate daily edition` and `Upload artifacts` is hanging — likely `Refresh static intelligence data` or `Verify generated publication`. Investigate before letting the scheduled `auto` runs go.

**Ready when you paste creds:**
- Any Actions secret (`OWNDASHBOARD_*`, `HEARTBEAT_URL`, `FAL_KEY`, `JINA_API_KEY`, `FIRECRAWL_API_KEY`, source keys) — I'll wire it with one `gh secret set`.

**Still needs you (no MCP mutation path exists):**
- Actions → General → *Allow Actions to create and approve PRs*.
- Sign up for OwnDashboard / Firecrawl / Jina / Fal / Guardian / NYT / GNews / StackExchange as you need them.
- Rotate the two Anthropic keys pasted in this chat.
- Redeploy aifirst-zpx8 in Vercel so the new env vars take effect on the running production build.
- Decide when `quality.enforcement` should flip from `report_only` → `enforce` (after a few real runs).

## MCPs — verdict

| MCP | Verdict |
|---|---|
| **Vercel** (connected) | Read-only for settings. Confirmed useful for verification (env vars, deploys, analytics status). Cannot mutate settings. |
| **GitHub** | Marginal — `gh` CLI already covers 95%. Only worth connecting if you want me to try the Actions "Approve PRs" toggle. |
| **Neon / Gmail / Google Drive / Calendar** | Not used by this repo. Skip. |
