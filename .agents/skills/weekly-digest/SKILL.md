---
name: weekly-digest
description: Weekly summary issue generated every Sunday from the past seven daily briefs. Use when iterating on lib/pipeline/weekly.ts, scripts/generate-weekly.ts, or the weekly digest display path.
---

# Weekly digest

Every Sunday at 07:00 UTC (1 hour after the daily) a separate cron run
produces a single weekly digest issue and commits it.

## Inputs

The last 7 published daily MDX files (`type: "daily"`, dated within the
last 7 days). Falls back to whatever's available if there are fewer.

## Output

`content/articles/YYYY-MM-DD-weekly.mdx` with frontmatter:

```yaml
type: weekly
date: "<sunday-iso-date>"
slug: "YYYY-MM-DD-weekly-something"
title: "..."
dek: "..."
tags: [weekly, ...rolled-up tags]
sources: []     # no new sources; the digest references daily issues
illustration: { path, prompt, alt }
digest:
  from: "YYYY-MM-DD"
  to:   "YYYY-MM-DD"
  covered_slugs: [...]
signal_strength: <inherited from mean of covered issues>
dispatches: []  # weekly digests do not carry dispatches
wire: []
```

The body is ~600–900 words, three sections:

1. **Lede** — the throughline of the week
2. **Threads** — 3–5 short paragraphs each anchored by a `[link](url)`
   to a covered daily issue (`/articles/<slug>`)
3. **Looking ahead** — one paragraph

## Pipeline (`lib/pipeline/weekly.ts`)

- Single call to `Codex-opus-4-7` with tool use (`emit_digest`).
- System prompt cached.
- Style guide reused from the daily writer. No new sources lookup.
- Refuses to publish if fewer than 4 covered daily issues exist for the
  week — better no digest than a thin one.

## Display

- Home page shows the weekly digest above the daily feature when one
  was published in the last 24 hours.
- Article page shows a "WEEKLY DIGEST" pill where the dateline lives,
  and lists the covered daily issues as a sidebar.
- Archive groups weekly issues separately under each month.

## Don'ts

- Don't include scraped wire items or dispatches — those belong to
  daily issues.
- Don't generate two digests for the same Sunday (the persistence path
  is idempotent on filename).
