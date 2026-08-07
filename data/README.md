# Datasets

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
