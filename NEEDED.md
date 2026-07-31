# NEEDED — manual owner actions for Caught Up

Caught Up is a static bilingual reader. BoardlessAI owns source collection,
edition meetings, writing, Czech localization, illustrations, social drafts and
delivery. This file contains only actions that require the owner’s accounts,
credentials or judgment; there is no second generation setup to maintain here.

## Required for unattended BoardlessAI delivery

- [ ] **Install the `boardlessai-delivery` GitHub App on `lukaskourilcz/aifirst` only** — grant repository contents read/write and no broader repository permission; keep its App ID and private key only in Quorum Actions secrets. [imp:5] [owner:me] [time:30m] [kind:setup]
- [ ] **Review the first three delivered editions** — for each delivery, check the English article at `/articles/<slug>`, the Czech article at `/cs/articles/<slug>`, source links, board context, the Vercel deployment and both social packs in the protected [BoardlessAI admin](https://quorum-site-chi.vercel.app/admin). [imp:5] [owner:me] [time:60m] [kind:content]
- [ ] **Remove retired generation credentials from aifirst** — delete old Anthropic, source, image, promotion, heartbeat and OwnDashboard generation secrets or variables from this repository and its Vercel project; rotate any provider keys previously pasted into chat. Do not remove Quorum’s active producer credentials. [imp:5] [owner:me] [time:20m] [kind:setup]

## Product decisions

- [ ] **Confirm whether technical names should stay `aifirst`** — the public product is Caught Up, while the GitHub repository and Vercel project still use `aifirst`. Leaving them unchanged is supported; rename them only if public consistency is worth the migration work. [imp:2] [owner:me] [time:30m] [kind:decision]

## Optional reader operations

- [ ] **Add a read-only GitHub token in Vercel only if private workflow history should appear in health** — set `GITHUB_TOKEN` with the narrowest repository read permission; the public health JSON never exposes it. [imp:2] [owner:me] [time:20m] [kind:deploy]
- [ ] **Enable semantic related-issue refresh only if tag overlap is insufficient** — create a Jina key and run `pnpm embed:refresh`; this enriches the static reader and is not an editorial fallback. [imp:1] [owner:me] [time:20m] [kind:setup]
- [ ] **Connect the sentinel to OwnDashboard only if that receiver exists** — set `OWNDASHBOARD_CRON_URL` and `OWNDASHBOARD_CRON_TOKEN` for the missed-publication workflow; do not add retired generation-report credentials. [imp:1] [owner:me] [time:10m] [kind:setup]

## Already complete

- Vercel Pro coverage is confirmed; the production branch is `main` and the
  canonical reader URL is `https://caughtup-ai.vercel.app`.
- Vercel Web Analytics is enabled.
- The repository contains no scraper, editorial model client, article writer,
  media generator, social console or weekly/regeneration workflow.
- `/admin` in Caught Up is a noindex handoff link to the protected BoardlessAI
  social archive. Caught Up itself has no operator login or content database.
