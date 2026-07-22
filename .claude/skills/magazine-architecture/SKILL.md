---
name: magazine-architecture
description: Preserve Caught Up's static Git/MDX architecture, module boundaries, locale routes, build-time contracts, and optional operator integrations. Use when creating routes or lib modules, changing content/pipeline boundaries, or evaluating infrastructure changes.
---

# Caught Up architecture

The public publication is Caught Up; the repository/package and stable technical identifiers remain `aifirst`.

## Keep layers separate

1. `sources.yml`, `lib/scraping/`, and committed configuration acquire bounded source material with per-source isolation.
2. `lib/pipeline/` and `scripts/` curate, write, optionally illustrate, validate, generate static artifacts/private telemetry, and persist through GitHub Actions.
3. `app/`, `components/`, and reader-safe `lib/` modules render committed MDX/static contracts. They never scrape, call a model, read private run reports, or depend on OwnDashboard at request time.

Inspect the actual exported types and helpers before editing; do not rely on simplified pseudocode.

## Preserve public contracts

- Git and MDX are canonical; no reader database, accounts, runtime CMS, or per-request AI.
- English is unprefixed; Czech uses `/cs`. Preserve article URLs, print, Atom feeds, public JSON, metadata, structured data, sitemap, search, and intentional redirects.
- OwnDashboard is an optional bounded callback/control plane. Its failure must not block normal publication and it is never a reader dependency.
- Keep server components by default and static generation intact.
- Resolve model IDs through `lib/anthropic/models.ts` and committed editorial profiles.
- Keep legacy environment names and document actual variables in `.env.example`; never expose secrets in static output.

## Avoid architectural drift

Do not add a content database, public auth, runtime search, client content fetching, UI/state/chart/motion libraries, third-party embeds, or mandatory external media. Preserve strict CSP, local assets, the 110 kB page-entry guard, and configuration defaults unless the task explicitly changes operations.
