# Caught Up implementation and BoardlessAI cutover

Status: current architecture record, updated 2026-07-31.

## Current system

Caught Up is the static bilingual reader for BoardlessAI Venture 001. English
uses unprefixed routes and Czech uses `/cs`. Git-tracked MDX remains canonical;
the reader has no content database, CMS, account system, runtime AI call or
runtime dependency on the producer.

```text
BoardlessAI source collection + edition room + quality gates
  → EditionPackage v1
  → content-only GitHub App delivery
  → aifirst contract/content validation
  → Next.js static build
  → Vercel CDN
```

BoardlessAI owns collection, story selection, English writing, STET review,
HACEK Czech localization/review, illustration production, social packs,
budgets, meeting records and delivery. Caught Up accepts writes only to:

- `content/articles/<date>.en.mdx`
- `content/articles/<date>.cs.mdx`
- `public/illustrations/<date>.webp`
- `public/data/board/<date>.json`

Every other path is outside the delivery App’s authority.

## Reader compatibility

- Primary routes remain Today, Radar, Topics, Weekly, Archive and About.
- Article, print, feed, JSON, source, glossary, correction, sitemap and metadata
  contracts remain static and locale-aware.
- `/stats` and `/trends` redirect to `/radar`, `/tags` to `/topics`, and
  `/colophon` to `/about`.
- `/promotion` is retired and returns 404.
- `/admin` is a noindex handoff to the protected BoardlessAI social archive.
- Legacy MDX and the storage keys `dispatches` and `wire` remain supported.
- `/lekce` is additive: the archive of AI terms the daily lesson strip has
  revealed. It is in the sitemap but not the navigation, and it does not touch
  `/glossary`.

## Daily datasets

`data/ai-facts.json` and `data/ai-lessons.json` are a second, additive read
surface beside the edition pipeline. They are append-only, carry `verified` and
`source` on every entry, and arrive through the same content-only delivery
channel — `data/README.md` is the contract. `lib/daily.ts` turns the newest
edition's date into one entry per day with no clock and no randomness, so builds
stay reproducible. `config/banner.json` reserves one partner slot on Today and
ships inactive; nothing renders and no space is reserved until a local creative
is committed.

## Removed at cutover

The repository no longer contains or configures a scraper, source adapter,
editorial model client, article/translation writer, illustration provider,
generation budget, regeneration circuit breaker, weekly writer, promotion
console, social queue, generation heartbeat or generation-report callback.
Historical provider setup and agent commands were removed so they cannot be
mistaken for a fallback production path.

The only scheduled aifirst workflow is the Prague-aware missed-publication
sentinel. It can read content and open one idempotent GitHub issue; it cannot
write an edition or call a provider.

## Validation boundary

The delivery consumer validates the `edition-package/1` schema, canonical hash,
exact English/Czech MDX bytes, the required hero and attribution, authorized
output paths and same-date replay. A replay succeeds only when every existing output is complete
and byte-identical. Content checks then validate schema-v2 provenance, source
registry IDs, bilingual linkage, corrections, sponsorship safety and board
context before Vercel builds.

Release validation remains:

```bash
pnpm verify
pnpm e2e
```

The enforced JavaScript ceiling is 110 kB gzip per page entry. The older 80 kB
target is not a live task because the preserved Next.js/React runtime alone is
larger; changing it would require a separate framework/read-architecture
decision.

## Remaining operator work

`NEEDED.md` is the only live owner checklist. It covers the delivery App,
credential cleanup, the first three delivery reviews and optional read-side
monitoring. Producer credentials, budgets and social-channel decisions belong
to Quorum’s `NEEDED.md`.
