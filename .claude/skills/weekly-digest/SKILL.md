---
name: weekly-digest
description: Maintain Caught Up weekly generation, bilingual schema-v2 persistence, covered-issue linkage, measured usage, weekly routes/feed/archive, and distinct edition presentation. Use for lib/pipeline/weekly.ts, scripts/generate-weekly.ts, weekly content validation, or the Weekly reader surface.
---

# Weekly digest

Read `config/editorial.yml`, `lib/pipeline/weekly.ts`, `scripts/generate-weekly.ts`, weekly tests, and the Weekly route before editing.

- Build the digest only from committed daily issues in the configured date window; do not scrape new sources or invent covered topics.
- Preserve minimum-input safeguards, idempotency, model profiles, requested locales, translation cost rules, schema-v2 fields, provenance, and covered slug linkage.
- Persist through shared MDX serialization and validate both locales and the Weekly Atom/static contracts.
- Render Weekly as a distinct, finite code-rendered edition with date range, defining story, developments, uncertainty/overhype context where available, watch-next material, topics, archive, and feed action.
- Keep important title/date/topic text deterministic. Optional media must disappear cleanly when absent and must not trigger generation from reader code.

Run focused weekly/persistence/content tests. Do not generate a real edition or incur model/media cost unless the task explicitly authorizes the operational run.
