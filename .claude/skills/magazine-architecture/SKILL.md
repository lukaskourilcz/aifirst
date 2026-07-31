---
name: magazine-architecture
description: Preserve Caught Up's static Git/MDX reader architecture, bounded BoardlessAI delivery contract, locale routes, build-time contracts, and optional read-side integrations. Use when creating routes or lib modules, changing content/delivery boundaries, or evaluating infrastructure changes.
---

# Caught Up architecture

The public publication is Caught Up; the repository/package and stable technical identifiers remain `aifirst`.

## Keep layers separate

1. BoardlessAI collects sources, runs the edition meeting, writes/reviews both languages, prepares optional media/social assets and produces `edition-package/1`.
2. `lib/delivery/` validates hashes, exact MDX bytes, authorized paths and immutable same-date replay before materializing content.
3. `app/`, `components/`, and reader-safe `lib/` modules render committed MDX/static contracts. They never scrape, call a model, read private producer state or depend on OwnDashboard at request time.

Inspect the actual exported types and helpers before editing; do not rely on simplified pseudocode.

## Preserve public contracts

- Git and MDX are canonical; no reader database, accounts, runtime CMS, or per-request AI.
- English is unprefixed; Czech uses `/cs`. Preserve article URLs, print, Atom feeds, public JSON, metadata, structured data, sitemap, search, and intentional redirects.
- OwnDashboard is an optional read-side control plane. Its failure must not block normal publication and it is never a reader dependency.
- Keep server components by default and static generation intact.
- Keep legacy environment names only where reader or delivery compatibility still uses them; document actual variables in `.env.example` and never expose secrets in static output.

## Avoid architectural drift

Do not add a content database, public auth, runtime search, client content fetching, UI/state/chart/motion libraries, third-party embeds, or mandatory external media. Preserve strict CSP, local assets, the 110 kB page-entry guard, and configuration defaults unless the task explicitly changes operations.
