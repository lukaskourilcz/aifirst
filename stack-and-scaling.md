# Caught Up — stack, cost and scaling

Prices and repository state were checked on **2026-07-22**. This document is a
planning model, not an account invoice: the repository cannot see Vercel,
Anthropic, domain, tax or future newsletter-provider billing.

## Architecture and cost boundary

```text
curated sources
  → GitHub Actions (scrape, curate, write, validate)
  → Git + MDX + static artifacts
  → Vercel CDN
  → readers

optional: Actions → OwnDashboard run-report callback
```

The model/image bill is created on the publishing side of this boundary. Reader
requests never invoke Anthropic, an image model, a database or OwnDashboard.
The public app therefore scales primarily on static transfer, edge requests and
build time—not AI calls or database connections.

## Current committed configuration

| Item | Current setting | Cost effect |
| --- | --- | --- |
| Daily | Enabled, scheduled once per day, English | One curation call and one writing call per successful run |
| Weekly | Enabled, scheduled Sundays, English + Czech | One bilingual writing call per successful run |
| Model profile | `standard` | Sonnet 4.6 curation, Opus 4.7 writing, Haiku 4.5 utility |
| Publishing | `auto`; quality is `report_only` | No human approval fee; weak runs are reported but do not yet block |
| Illustration | `none` | $0 image-provider spend |
| Embeddings | Skipped by the scheduled daily default | $0 Jina spend from the default workflow |
| Promotion | Disabled | $0 extra promotion-model spend |
| Newsletter | Files generated, nothing sent | $0 sending-provider spend |
| Public data | Git/MDX, no runtime database | $0 database/read-query spend |
| OwnDashboard | Optional, disconnected by default | $0 required control-plane spend |
| Cost budgets | Warning/hard/monthly values are `null` | Measurement works; no monetary ceiling is enforced yet |
| Workflow artifacts | Private, 30-day retention | Bounded artifact-storage growth |

The 2026-07-22 design overhaul added no dependency, runtime service, model
pass, or generated media. Its validated production build materializes 199
static/SSG route outputs; the largest of 25 guarded page entries is 103.7 kB
gzip. The only new brand asset is a deterministic 278-byte SVG completion mark,
and an unused 2.8 kB placeholder image was removed.

At audit time the private GitHub repository had **no custom Actions secrets or
variables and no new-system run report**, so its observable Actions-based
Anthropic/image spend was $0. New editions will not generate until
`ANTHROPIC_API_KEY` is configured. The Vercel plan and any local API usage are
outside repository visibility.

## AI generation cost

The code records actual input, output, five-minute cache-write and cache-read
tokens for every known model stage. It applies the versioned rates in
`lib/telemetry/pricing.ts`; incomplete usage or an unknown model returns
`unavailable`, never a fabricated zero.

Current official list prices used by the configured profiles:

| Model | Input / 1M | Output / 1M | 5m cache write / 1M | Cache read / 1M |
| --- | ---: | ---: | ---: | ---: |
| Claude Opus 4.7 | $5 | $25 | $6.25 | $0.50 |
| Claude Sonnet 4.6 | $3 | $15 | $3.75 | $0.30 |
| Claude Haiku 4.5 | $1 | $5 | $1.25 | $0.10 |

Anthropic’s [official pricing documentation](https://platform.claude.com/docs/en/about-claude/pricing)
is the source of truth. The repository uses standard global routing; US-only
inference would add Anthropic’s documented 10% multiplier.

The exact formula is:

```text
run cost = Σ((input × input rate
            + output × output rate
            + cache writes × cache-write rate
            + cache reads × cache-read rate) / 1,000,000)
```

### Illustrative publishing month

The following is deliberately a capacity estimate, not measured usage. Assume:

- 30 English daily runs;
- each daily curates 50k input/1k output tokens and writes with 20k input/4k
  output tokens;
- 4 bilingual weekly runs, each with 30k input/6k output tokens;
- no cache charges, regeneration, promotion or paid image.

| Profile | Example daily | Example weekly | 30 daily + 4 weekly |
| --- | ---: | ---: | ---: |
| `standard` | $0.365 | $0.300 | **$12.15/month** |
| `economical` | $0.175 | $0.180 | **$5.97/month** |

Actual source summaries and model outputs determine token counts. A second
daily language mainly increases writing output; under the example, another 4k
output tokens per daily adds about $3/month on Opus or $1.80/month on Sonnet.
Every forced regeneration adds roughly another run’s cost. The first real run
report should replace these assumptions before budgets are enabled.

## Illustration cost

- `none`: $0 and the reader layout falls back gracefully.
- `nasa`: no paid provider in this code path; the unauthenticated `DEMO_KEY` is
  rate-limited, so a free NASA key is safer operationally.
- `picsum`: no API key or direct per-image charge; availability and terms remain
  third-party dependencies.
- `fal`: the default model is `fal-ai/flux/schnell`. fal currently lists
  [$0.003 per megapixel](https://fal.ai/models/fal-ai/flux/schnell) and rounds the
  1536×1024 request up to 2 MP, or about **$0.006 per successful cover**. One
  daily plus one weekly cover cadence is about **$0.20/month** before retries.

Paid image cost is intentionally marked unavailable in run totals because the
current fal response adapter does not receive authoritative billing usage. If a
hard run budget is configured, the pipeline refuses to persist a paid image
whose cost it cannot prove.

Higgsfield production did not run during the overhaul because its MCP was
unavailable then. The MCP was later registered and authenticated for the next
Codex session, but no generation was started: Higgsfield spend remains $0, and
no substitute media, placeholder, or runtime integration was introduced.

## GitHub Actions cost

This repository is private, so standard runner time consumes the owner plan’s
allowance. GitHub currently includes 2,000 minutes/month on Free and 3,000 on
Pro; baseline Linux overage is $0.006/minute. Artifact storage allowances are
500 MB and 1 GB respectively. See GitHub’s
[official Actions billing documentation](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

There are about 34 scheduled publishing jobs in a four-week month. At an average
5–10 runner minutes each, they use roughly **170–340 minutes/month**, plus CI,
manual runs and failures. The committed 20-minute timeouts cap a stuck scheduled
month at roughly 680 minutes before CI. That should fit the normal personal
allowances, but repeated PR builds and regenerations should still be watched.

The 30-day artifact retention keeps reports useful for a monthly review without
allowing indefinite storage growth. If the quota becomes tight, the first
changes should be reducing artifact contents/retention and avoiding duplicate
Vercel + Actions builds—not moving the reader to a runtime backend.

## Vercel and reader growth

Vercel currently lists:

- **Hobby: $0/month**, intended for personal, non-commercial use, with 1M edge
  requests and 100 GB fast data transfer included per month;
- **Pro: $20/month per developer seat**, with $20 usage credit, 10M edge
  requests and 1 TB transfer included; further transfer starts at $0.15/GB and
  edge requests at $2 per million.

See the [official Vercel pricing page](https://vercel.com/pricing) before making
a plan decision. A publication that becomes commercial should budget for Pro
even when Hobby’s technical limits would be sufficient.

Static transfer can be planned with:

```text
monthly transfer ≈ visits × average bytes transferred per visit
```

For an intentionally simple 500 kB/visit planning assumption (measure the real
site before relying on it):

| Monthly visits | Approx. transfer | Likely delivery position |
| ---: | ---: | --- |
| 10,000 | 5 GB | Well inside Hobby transfer |
| 100,000 | 50 GB | Inside Hobby transfer; commercial terms may require Pro |
| 1,000,000 | 500 GB | Inside Pro’s listed 1 TB transfer, subject to request count |

Visits are not the same as edge requests: HTML, uncached assets, feeds, bots and
JSON calls can create several requests per visit. Browser/CDN caching can reduce
transfer. Use Vercel’s actual usage dashboard, not this sample ratio, for an
upgrade decision.

Vercel Pro also lists standard build minutes at $0.014/minute, drawn against the
included usage credit. Archive growth affects build duration and route count;
it does not create per-reader compute. The latest validated production build
materializes 199 static/SSG route outputs, so the likely first scale signal is
slower builds rather than runtime saturation.

## Practical monthly scenarios

| Stage | Hosting | Editorial AI | Images | Expected app-platform total |
| --- | ---: | ---: | ---: | ---: |
| Personal validation, economical profile | $0 Hobby | ~$6 example | $0 | **~$6/month** |
| Personal validation, standard profile | $0 Hobby | ~$12 example | $0 | **~$12/month** |
| Commercial publication, standard profile | $20 Pro | ~$12 example | $0 | **~$32/month** before overages/tax |
| Commercial + daily/weekly fal covers | $20 Pro | ~$12 example | ~$0.20 | **~$32.20/month** before overages/tax |

These totals exclude the domain, Vercel/Anthropic taxes, newsletter delivery,
premium monitoring and OwnDashboard’s separate hosting/database. They also
exclude model retries, manual regeneration and increased cadence.

## What will increase cost first

1. More publishing runs, regenerations or languages: model cost grows roughly
   linearly with calls and output tokens.
2. Commercial launch: Vercel Pro’s fixed $20/month is likely before bandwidth
   overage.
3. Paid illustrations, promotion generation and semantic embeddings: optional,
   explicit and independent of reader traffic.
4. A sending provider: newsletter artifacts are free files today; email pricing
   begins only after a provider and list are connected.
5. Larger archives: more build minutes and sitemap entries, not a need for a
   public database. Split sitemaps and measure builds before changing storage.
6. OwnDashboard: its Supabase/hosting cost belongs to the private operations
   plane. An outage must never block scheduled publishing or public reads.

## Cost-control checkpoints

- Complete one `dry_run` and use its run report to set warning/hard budgets in
  `config/editorial.yml`.
- Keep `none` illustrations, skipped embeddings and disabled promotion until
  their value justifies the extra dependency or spend.
- Start quality enforcement with `failureAction: pull_request` so weak or costly
  output cannot silently auto-publish.
- Add a GitHub Actions budget alert and a Vercel spend limit before enabling
  paid overages.
- Send reports to OwnDashboard only when the receiver exists; use its persistent
  ledger for monthly aggregation and anomaly alerts.
- Recheck all provider prices at least quarterly and whenever a configured model
  changes.
