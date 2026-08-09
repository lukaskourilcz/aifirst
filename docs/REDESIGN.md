# DNESKAi reader direction

Status: canonical reader direction, 2026-08-09.
Supersedes the instrument-panel direction of 2026-07-30 for every reader page.
The authoritative source for values and layout is
[`docs/redesign/design-spec.md`](redesign/design-spec.md); this file records
what the direction is and why, and stays short enough to remain true.

## What changed and why

The product changed job. It is no longer one edition read once at night; it is a
surface scanned several times a day across editions, external links, podcasts
and events. A dark canvas reads as an instrument you check. A paper canvas reads
as a magazine you browse, and it is the only honest carrier for the mixed-source
content that now supplies most of the page volume.

Two things follow from that, and they are the whole redesign:

1. **The canvas is light.** Page `#f7f7f5`, cards and reading surface `#ffffff`,
   ink `#14161a`. One theme, no toggle. Print stays black on white.
2. **The reader stops describing how it is made.** No production
   instrumentation reaches a reader page, and the magazine does not present
   itself as an AI-operated system.

The identity that actually carried the publication is untouched: zero radius,
one-pixel hairlines, three families with fixed jobs, and the completion mark.
Those survive polarity inversion intact.

## Tokens

Values live in the `:root` block of `app/globals.css` and are mirrored as
literals in `lib/og-theme.ts`, because `next/og` cannot read CSS variables. Every
name in production kept its name; only values moved.

Accent is `#2f5ae6`. The previous `#4d7cff` reaches only 3.72:1 on white and
cannot carry link duty. The metadata floor is `#5f6672`, which holds 5.02:1 on
its worst surface.

`--border-control` (`#8e8e88`) is the one new border token. The grouping
hairlines are 1.30:1 and 1.66:1, which is correct for grouping and useless as an
affordance, so the three controls whose border *is* the affordance use it
instead: the search input, the ad reservation and the week-boundary action.

## Type roles

Unchanged in job, retuned in scale.

- **Space Grotesk** — display, navigation, interface, feed and event headlines.
- **IBM Plex Mono** — dates, labels, kickers, chips, metadata.
- **Source Serif 4** — prose, deks, descriptive copy.

All three load through `next/font`. Czech lead headlines run long, so a hero
past 100 characters drops from display to heading size; without that rule the
dek and meta row leave a 900px viewport.

## Layout

A 244px left rail and a 300px right rail inside a 1360px container. The right
rail is 300px because the ad reservation defines it; it drops below 1280 and its
modules reflow into the main column in the same order. The left rail collapses
below 960 into a sticky top bar and a full-screen drawer.

The rail holds the six sections, the secondary group and search. Nothing else:
no status record, no issue date, no run time, no candidate count, no cost, no
signal meter.

The front page is a lead package plus a week feed. The full article body lives
on `/articles/[slug]`, which stays the canonical reading surface.

## What the reader never shows

The publication-data strip, the signal meter, the publishing-status banner, the
provenance and making-of blocks, run costs, model names, candidate counts, and
build vocabulary. Operators keep all of it in `/health`, `/api/health.json` and
the BoardlessAI admin.

Kept, because magazines have them: the source ledger, corrections, the sponsor
label, the glossary, the feeds and the completion mark.

## Copy

Every reader-facing string is Czech. External stream item titles are the one
exception, because they are quoted rather than written, and they carry a `lang`
attribute so a screen reader switches voice.

No em-dash in anything this repository writes. Where a dash is needed, Czech
convention is the en-dash; usually the sentence is better restructured. Czech
typography throughout: „lower-upper" quotes, a non-breaking space after
one-letter prepositions, and Czech number and date spacing.

Published editions and dataset entries predate this rule and are immutable, so
a handful still carry an em-dash in their own prose. The rule is enforced going
forward in the upstream writer prompt, not by rewriting what already shipped.
