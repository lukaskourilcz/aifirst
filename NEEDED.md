# NEEDED — manual owner actions for Caught Up

Caught Up is a static bilingual reader. BoardlessAI owns source collection,
edition meetings, writing, Czech localization, illustrations, social drafts and
delivery. This file contains only actions that require the owner’s accounts,
credentials or judgment; there is no second generation setup to maintain here.

## Required for unattended BoardlessAI delivery

- [ ] **Remove the retired aifirst Anthropic secret and audit Vercel** — GitHub still listed `ANTHROPIC_API_KEY` on 2026-07-31 even though no workflow or runtime reads it. Delete it from `lukaskourilcz/aifirst`, then remove any old source, image, promotion, heartbeat or generation-report credentials from the aifirst Vercel project. Rotate keys previously pasted into chat. Do not remove Quorum’s active producer credentials or the optional OwnDashboard sentinel pair if you still use that receiver. [imp:5] [owner:me] [time:20m] [kind:setup]

## Product decisions

- [ ] **Confirm whether technical names should stay `aifirst`** — the public product is Caught Up, while the GitHub repository and Vercel project still use `aifirst`. Leaving them unchanged is supported; rename them only if public consistency is worth the migration work. [imp:2] [owner:me] [time:30m] [kind:decision]

## Partner slot

- [ ] **Supply the devShark banner creative and its target URL** — the slot `today-partner-belt` is built and empty. It needs a 728×90 and a 320×100 image committed under `public/images/banners/`, the alt text, and the destination link; then flip `active` to `true` in `config/banner.json`. Until all of that exists the slot renders nothing, which is the correct state. [imp:2] [owner:me] [time:20m] [kind:content]

## Optional reader operations

- [ ] **Add a read-only GitHub token in Vercel only if private workflow history should appear in health** — set `GITHUB_TOKEN` with the narrowest repository read permission; the public health JSON never exposes it. [imp:2] [owner:me] [time:20m] [kind:deploy]
- [ ] **Enable semantic related-issue refresh only if tag overlap is insufficient** — create a Jina key and run `pnpm embed:refresh`; this enriches the static reader and is not an editorial fallback. [imp:1] [owner:me] [time:20m] [kind:setup]
- [ ] **Connect the sentinel to OwnDashboard only if that receiver exists** — set `OWNDASHBOARD_CRON_URL` and `OWNDASHBOARD_CRON_TOKEN` for the missed-publication workflow; do not add retired generation-report credentials. [imp:1] [owner:me] [time:10m] [kind:setup]

## Already complete

- Vercel Pro coverage is confirmed; the production branch is `main` and the
  canonical reader URL is `https://caughtup-ai.vercel.app`.
- Visitor and engagement analytics are deliberately removed for this phase.
- The repository contains no scraper, editorial model client, article writer,
  media generator, social console or weekly/regeneration workflow.
- The exact package consumer was rehearsed in a clean checkout on 2026-08-01:
  it wrote the bilingual issue and hero, accepted an identical replay as a no-op,
  passed content validation and produced both article routes in a production build.
- `/admin` in Caught Up is a noindex handoff link to the protected BoardlessAI
  social archive. Caught Up itself has no operator login or content database.
- The daily lesson strip, the "Víte, že…" fact block and the `/lekce` archive
  ship from `data/`. They need no owner action: the datasets are committed, the
  pick is deterministic from the edition date, and appends arrive through the
  existing delivery channel (`data/README.md`).
