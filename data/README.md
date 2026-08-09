# Datasets

Five JSON files feed the reader from `data/`. All are read at build time by
Server Components and never touched at runtime. Two follow
`boardless-dataset/1` and are append-only; three are synced files that
BoardlessAI replaces wholesale. The contracts are documented separately below,
because their rules are opposites.

Two JSON files feed the daily widgets on Today. They are read at build time by
`lib/facts.ts` and `lib/lessons.ts`, rendered by Server Components, and never
touched at runtime.

| File | Contents | Rendered by |
| --- | --- | --- |
| `ai-facts.json` | 50 AI facts | `components/editorial/DidYouKnow.tsx` |
| `ai-lessons.json` | 60-term AI curriculum | `components/editorial/DailyLesson.tsx`, `/lekce` |

Both follow `boardless-dataset/1`. The shared shape and the deterministic daily
pick live in `lib/daily.ts`; the schema itself is asserted by
`lib/__tests__/datasets.test.ts`.

This is a separate read surface from the edition pipeline. It does not touch
`lib/content.ts` or `lib/delivery/`, and it is not the glossary — `glossary.yml`
stays a reference list, while `ai-lessons.json` is an ordered curriculum with a
reveal date per entry. The two coexist and are not cross-wired.

## Array order is the reveal order

`entries[0]` is the term revealed on `anchor`. Each following day advances one
index and wraps with a modulo, so the array length is the cycle length. The date
that drives the pick is the newest published edition's date, not a clock — the
site is static and rebuilds when content lands, so a day without an edition
honestly keeps the previous day's entry.

## The files are append-only

Existing entries are never edited, reordered, or deleted. The one exception is a
factual error: correct the text and set `verified` to the date of the re-check.

New entries go at the end. The cycle simply gets longer — no schema change, no
code change, no test edit. The count assertions are minimums (`>= 50`, `>= 60`)
for exactly this reason.

## Who may append

BoardlessAI agents, through the same content-only GitHub App commit channel that
delivers editions. Never a runtime write, never a human-invoked side door.

An append commit touches only the dataset file and carries the standard delivery
attribution. Each new entry ships with its own receipt: `verified` records when
someone last checked it, `source` records where a human can check it again.
Upstream, quorum records the append in its content inventory. That recording is
quorum's job, not this repository's.

## Validation is the gate

`lib/__tests__/datasets.test.ts` runs inside `pnpm verify`, so a malformed append
fails CI instead of shipping. It asserts unique `id` and `slug`, `category`
membership in the file's own `categories` map, the date and slug patterns,
non-empty `en` and `cs` text on every entry, and the per-dataset extras
(`term` on lessons, `promotion` on the MMA facts in the sibling repository).

## Never

- An entry without a `source` a human can check.
- A number nobody verified.
- A model-generated "fact" with no human-verifiable grounding.
- An `id` or `slug` reused after a removal.

---

# Synced files

Three more files live here and follow different rules. They are **not**
append-only: BoardlessAI replaces each one wholesale on every sync, prunes items
past its window, and the reader has no memory of what a previous copy held.
Nothing about them is a reveal schedule.

| File | Contract | Contents | Read by |
| --- | --- | --- | --- |
| `talked-about.json` | `boardless-stream/1` | External posts worth reading | `lib/streams.ts`, `/o-cem-se-mluvi` |
| `podcasts.json` | `boardless-stream/1` | Podcast episodes | `lib/streams.ts`, `/podcasty` |
| `events.json` | `boardless-events/1` | Conferences and meetups | `lib/events.ts`, `/akce` |

All three ship as valid empty envelopes, so every page renders from day one.

## `boardless-stream/1`

```json
{ "schemaVersion": "boardless-stream/1", "stream": "talked-about",
  "updated": "2026-08-09", "windowDays": 60, "items": [ {
    "id": "sha1-of-canonical-url", "title": "Original title", "url": "https://…",
    "source": { "kind": "medium|substack|blog|youtube|rss", "name": "Interconnects",
                "feed": "https://…" },
    "author": "Name or null", "published": "2026-08-08",
    "summary": "one line or null", "weight": 1 } ] }
```

Podcast items may additionally carry `show`, `durationSec`, and `links` with any
of `youtube`, `spotify`, `apple`, `rss`.

`id` is the sha1 of the canonical URL, assigned upstream, and is what dedupes a
sync. Titles are frequently English: that is the one place English is allowed to
reach the reader, and the UI marks those titles `lang="en"` so a screen reader
switches voice.

## `boardless-events/1`

```json
{ "schemaVersion": "boardless-events/1", "updated": "2026-08-09", "events": [ {
    "id": "ai-days-praha-2026", "scope": "cz", "title": "Czech title",
    "description": "1–2 Czech sentences", "starts": "2026-09-12",
    "ends": null, "city": "Praha", "venue": null, "online": false,
    "url": "https://…", "price": "od 990 Kč", "organizer": null,
    "added": "2026-08-09" } ] }
```

`scope` is the storage key `cz` or `global`; the reader renders „Česko" and
„Svět". Event titles and descriptions are Czech, because unlike a stream item's
title they are written rather than quoted.

## What a bad file costs

A section, never a build. `lib/streams.ts` and `lib/events.ts` return an empty
list when the file is missing, unparseable, or carries the wrong
`schemaVersion`, and they drop any single item whose required fields are
unusable rather than failing the read. A URL that is not `https://` is dropped;
so is an event whose `ends` precedes its `starts`.

## Upcoming and past

`/akce` splits events against the newest edition's date, never a clock, so the
build stays reproducible. A multi-day event counts as upcoming until its last
day has passed, so a conference does not disappear from the list halfway
through itself.
