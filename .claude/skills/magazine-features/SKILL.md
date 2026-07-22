---
name: magazine-features
description: Preserve Caught Up's editorial content features and compatibility names: Briefs/dispatches, Watchlist/wire, signal strength, Topics/tags, Search, Sources, Radar, feeds, provenance, corrections, and sponsorship. Use when changing their schema, loaders, UI, or static contracts.
---

# Caught Up editorial features

The issue MDX is canonical. Do not split issue fields into a runtime store or rename stable storage keys just to match reader copy.

- Render `dispatches` as **Briefs / Ve zkratce**.
- Render `wire` as **Watchlist / Na radaru**.
- Compute signal strength and Radar indicators deterministically from real content/config; never ask the model for display metrics.
- Treat Topics as the curated public layer while preserving intentional `/tags` compatibility and tag feeds.
- Keep search a static client-side index/palette with keyboard containment and no runtime search service.
- Keep sources, evidence class, provenance, corrections, sponsorship, and human-review state semantically distinct.
- Keep Today, Weekly, Topic, and preserved tag Atom feeds plus public JSON contracts build-time/static.
- Use source/profile data intended for readers; never expose private scrape diagnostics or run reports.

Read the existing types/loaders/components before changing a field. Validate legacy MDX, schema v2, English/Czech fallback, missing sections, long source titles, and no-image states. Update content validation and focused tests whenever the frontmatter contract changes.
