# NEEDED — aifirst to-do list

Everything is **merged into `main` and safe to ship as-is** — every feature
degrades gracefully with zero config. Each task carries an importance score
`[imp:N]` (1–5, 5 = highest). This file is parsed into the OwnDashboard **Úkoly**
section, where you can filter tasks by that priority.

## Tasks

- [ ] **Set `IMAGE_PROVIDER=nasa` or `picsum`** — default `none` ships a flat placeholder, no real cover; both alternatives are keyless. `[imp:3]`
- [ ] **Add `HEARTBEAT_URL` + a cron monitor** — a silent daily-pipeline failure means no issue that day and nothing tells you. `[imp:3]`
- [ ] **Add `STACKEXCHANGE_KEY`** (Actions secret) — the anonymous StackExchange API returns HTTP 403 from CI IPs, so that source yields nothing until keyed. `[imp:3]`
- [ ] **Add `JINA_API_KEY`** — turns "related issues" from tag-overlap into embedding similarity and raises the reader-fallback rate limit. `[imp:2]`
- [ ] **Add `GUARDIAN` / `NYTIMES` / `GNEWS` keys** — extra source coverage; each self-skips and never errors without a key. `[imp:2]`
- [ ] **Decide the reading-bar bundle** — the Motion spring bar adds ~13 kB, over the repo's +10 kB budget; keep it or swap to 0 kB CSS. `[imp:2]`
- [ ] **Add `FIRECRAWL_API_KEY`** — strengthens the generic-HTML source fallback for JS-rendered pages (Jina keyless fallback already covers most cases). `[imp:2]`
- [ ] **Set `FAL_MODEL_PATH`** — higher-fidelity FLUX covers; only relevant once `IMAGE_PROVIDER=fal` + `FAL_KEY` are set. `[imp:1]`
- [ ] **Set `ANTHROPIC_BASE_URL`** — route the pipeline through a gateway for cost caps/caching; unset = talk to Anthropic directly. `[imp:1]`
- [ ] **Set `PROMOTION_TOKEN`** — optional gate for the secret `/promotion` page (already unlisted, noindex, robots-disallowed). `[imp:1]`

## Details

**Branch/Vercel wiring (the only real blocker).** All work is on `main`, but the
GitHub default branch is a `claude/*` branch, and Vercel deploys whatever its
**Production Branch** is set to. Check vercel.com → `aifirst` → **Settings → Git →
Production Branch**; set it to `main` and redeploy. Make sure `daily.yml` pushes
to the same branch Vercel deploys. Cleanest end state: one production branch
shared by the daily job, the GitHub default, and Vercel.

**Optional API keys** — add as GitHub Actions **secrets** (repo → Settings →
Secrets and variables → Actions). Everything runs with zero keys; each keyed
source self-skips until added. Free tiers are ample for a once-daily pipeline.

| Secret | Enables | Get it at |
| --- | --- | --- |
| `STACKEXCHANGE_KEY` | `stackexchange-ml` source (403 from CI without it) | <https://stackapps.com/apps/oauth/register> |
| `GUARDIAN_API_KEY` | `guardian-tech` source | <https://open-platform.theguardian.com/access/> |
| `NYTIMES_API_KEY` | `nytimes-tech` source | <https://developer.nytimes.com/> |
| `GNEWS_API_KEY` | `gnews-ai` source | <https://gnews.io/> |
| `JINA_API_KEY` | semantic "related issues" | <https://jina.ai/embeddings> |
| `HEARTBEAT_URL` | daily-cron failure alerts | Better Stack / UptimeRobot |
| `FIRECRAWL_API_KEY` | HTML-source reader fallback | <https://firecrawl.dev> |

**Image provider.** `IMAGE_PROVIDER` is a Vercel/Actions **variable** (not a
secret): `nasa` (APOD) or `picsum` (deterministic per article); both keyless.
`fal` needs `FAL_KEY`.

**Reading-bar decision.** Keep the current ~13 kB Motion spring bar, or reimplement
it with native CSS `animation-timeline: scroll()` (0 kB, loses spring easing) —
an isolated one-component swap.
