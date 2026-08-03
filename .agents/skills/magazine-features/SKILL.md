---
name: magazine-features
description: Editorial and UI primitives layered on top of the daily article — Wire, Dispatches, Signal Strength, Tags, Search, Sources directory, Stats. Use when extending the home page, the article page, or the pipeline's frontmatter contract.
---

# Magazine features

The daily issue is a feature article plus a small constellation of
secondary elements that give the magazine texture. Each lives in
frontmatter on the same MDX file — no parallel content stores.

## The Wire

5–8 runner-up items from today's scrape that the curator considered but
didn't lead with. Renders as a horizontal HUD-style ticker on the home
page and an inline strip at the article foot.

Frontmatter:

```yaml
wire:
  - title: "..."
    url: "https://..."
    source: kyiv-independent
```

Source ids must match `sources.yml`.

## Dispatches

3 short prose vignettes (~60-100 words each) covering smaller stories
not folded into the feature. Written in the same `write` step.

Frontmatter:

```yaml
dispatches:
  - title: "A two-line head"
    body:  "60–100 words of prose, with [inline links](https://...)."
    source_url: "https://..."
```

Rendered as a 3-up grid at the article foot and as a sidebar block on
the home page.

## Signal Strength

A 0–100 integer per issue that reflects how broad and well-weighted
the source pool is. Computed deterministically in `lib/pipeline/signal.ts`
from the issue's `sources` and the `sources.yml` registry — never by
the model.

Formula:

```
diversity = min(100, unique_sources × 22)
quality   = min(100, mean(source.weight) × 110)
signal    = round((diversity + quality) / 2)
```

Renders as a small bar in the `DataStrip` and at the foot of the
sources block.

## Tags

`tags` is already in the frontmatter. Expose at:

- `/tags` — index of all tags ordered by frequency.
- `/tags/[tag]` — issues bearing that tag, newest first.

Tag chips appear next to issue rows everywhere they're listed.

## Search

`/search` plus a global ⌘K / `/` palette. The index is a JSON file
emitted at build time from `lib/content.ts`:

```ts
[{ slug, date, title, dek, tags }]
```

The palette is the only component allowed to live behind `'use client'`
in the magazine UI besides `ReadingProgress`.

## Sources directory

`/sources` lists every entry in `sources.yml`. For each source:

- name + type chip
- weight rendered as a 0–100 horizontal bar
- tag pills
- "cited N times in last 30 issues" — computed from articles'
  frontmatter, not from live scraping

## Stats

`/stats` shows publication metrics: total issues, cadence (sparkline
of issues per week), most-cited sources, top tags. All computed at
build time from MDX. No client JS.

## RSS feed

`/feed.xml` route emits Atom from the article list. Required for any
self-respecting magazine.

## Don'ts

- Don't fetch live data for any of these — everything is materialised
  at build time.
- Don't introduce a database. The MDX corpus is the database.
- Don't put Wire / Dispatches into a separate MDX file. They're part
  of the issue and must move with it.
