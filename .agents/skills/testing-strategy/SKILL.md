---
name: testing-strategy
description: What to test and what not to test in this repo — pure logic high, integration low, no snapshot lock-in. Use when adding or reviewing tests.
---

# Testing strategy

The pipeline calls paid APIs and the scrapers hit the live internet.
The test suite has to give us confidence without doing either.

## Test runner

- `vitest` (`pnpm test`). Config in `vitest.config.ts`.
- Tests live next to the code in `__tests__/` directories.
- Filenames end in `.test.ts`. No `.spec.*`.

## Tiers — high to low priority

### Pure logic — high value, must have

Anything that's a function from data to data. Cheap, fast, breakage
catches real regressions.

- `lib/scraping/util.ts` — `stableId`, `clampSummary`, `withTimeout`.
- `lib/content.ts` — `listArticles` sort order, `getArticle` lookup,
  the MDX-to-HTML renderer's small surface.
- `lib/pipeline/persist.ts` — frontmatter shape, file path.
- `lib/images/none.ts` — produces a valid WebP of the requested size.

### Adapter parsing — must have, no network

Each scraper has a `parse...` helper that takes a string (XML/JSON)
and returns `ScrapedItem[]`. Test those with fixtures under
`__tests__/fixtures/`. Do not test the network-touching `fetch...`
wrapper — that's the integration tier.

### Integration — opt-in, off by default

Tests that hit the real network or call the Anthropic API live under
`__tests__/integration/` and are skipped unless `RUN_INTEGRATION=1`.
They run on demand, not in CI.

### What we don't test

- React component snapshots — they rot under design changes.
- Page rendering — `pnpm build` is the smoke test.
- Anthropic responses themselves — we can't pin them.

## Patterns

### Fixtures over mocks

For a scraper, save a real RSS / JSON sample under
`__tests__/fixtures/<source>.xml`, then test the pure parser:

```ts
import sample from './fixtures/anthropic.xml?raw';
expect(parseRssFeed(sample, source).length).toBeGreaterThan(0);
```

### One assert per behavior

Tests should fail on one specific thing, not "this whole flow".

### No `beforeEach` for trivial setup

If a test needs three lines of setup, just put them in the test. The
boilerplate-to-signal ratio matters more than the DRY.

## Hand-off

When a feature ships:

- Pure logic tests cover the new function.
- A parser test with a fixture covers the new adapter, if any.
- `pnpm test` runs in < 5 seconds total.

If those don't hold, the feature isn't done.
