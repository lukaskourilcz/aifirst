---
name: tech-source-scraper
description: Add, verify, implement, or repair Caught Up sources and scraper adapters while preserving source isolation, evidence quality, privacy, and deterministic tests. Use for sources.yml, lib/scraping/*, or source-specific parsing failures.
---

# Tech source scraper

Read `sources.yml`, its schema/loader/tests, and existing adapters before adding anything.

## Select and verify

Prefer original reporting and primary sources. Compare a candidate with current coverage, topics, evidence class, geography, cadence, and duplication. Verify the actual homepage/feed/API and separate observed facts from assumptions.

Prefer RSS, then documented JSON/API, then respectful HTML extraction. Honor robots policy, timeouts, publisher terms, and rate limits. Store only the summary/metadata required for curation; never republish full text or append tracking parameters without a committed policy.

## Implement

- Reuse `makeItem`, RSS projection, timeout, source dispatch, and schema helpers.
- Keep stable IDs, bounded summaries, safe URLs/dates, and partial-failure isolation.
- Do not let one publisher abort the run or leak raw errors to reader output.
- Add no dependency until existing Undici, rss-parser, Cheerio, and utilities are demonstrably insufficient.
- Add a focused parser/config test with a safe fixture; normal tests never hit the network.

Run the actual `pnpm scrape:dry -- <source-id>` form supported by the script plus focused tests. Report item counts/sample titles only when observed, and never print credentials or private diagnostics.
