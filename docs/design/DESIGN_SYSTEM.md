# DNESKAi design system

Status: light newsroom redesign, 2026-08-09. Values are authoritative in
`docs/redesign/design-spec.md` §2 and in the `:root` block of `app/globals.css`.

This document describes the production system in `app/globals.css`, the shared shell components, and deterministic brand assets. It is not a gallery of aspirational components.

## Principles

The interface is a magazine on a paper canvas with a finite reading arc. It uses hierarchy, evidence and rhythm rather than dashboards or card stacks, and it shows the reader no production data at all. The visual endpoint is the completion mark: blueprint blue at the brand level and a resolved green state at the end of an edition.

## Color roles

Production components should use semantic roles:

- `--surface-page` (`#f7f7f5`), `--surface-reading` (`#ffffff`),
  `--surface-subtle` (`#efefec`), and `--surface-emphasis` (`#eaf0ff`)
- `--text-primary` (`#14161a`), `--text-secondary` (`#3c4149`), and
  `--text-tertiary` (`#5f6672`)
- `--border-subtle` (`#e2e2de`) and `--border-strong` (`#c9c9c3`)
- `--accent-primary` (`#2f5ae6`) and `--accent-primary-hover` (`#1d43bb`)
- `--border-control` (`#8e8e88`) for controls whose border is the affordance:
  the search input and week-boundary action
- `--status-complete` (`#067a52`), `--status-warning` (`#8a5a0d`), and
  `--status-correction` (`#c0272c`)
- `--focus-ring` and `--selection-background`

The hexes live on the semantic roles themselves; the `--color-*` and `--ink-*`
compatibility aliases were removed in the 2026-09 audit pass. `:root` declares
`color-scheme: light`. New production patterns must not introduce repeated
literal colors.
DNESKAi has one light reader theme. Print stays black on white. `#5f6672` is
the lightest text color; dimmer values may appear only in decoration.

## Typography

Space Grotesk is self-hosted through `next/font` and used for display hierarchy,
the wordmark, navigation, controls, tables, and completion. Source Serif 4 is
self-hosted for deks, article prose, card descriptions, and definitions. IBM
Plex Mono is self-hosted for identifiers, dates, technical metadata, source IDs,
navigation indices, and measured values.

### Kickers and chips

Every small uppercase label is one rule: `.kicker` (IBM Plex Mono,
`--kicker-size` 0.6875rem, `--kicker-tracking` 0.16em, uppercase, weight 500,
`--text-tertiary`). `.kicker--accent` switches it to `--accent-primary`, and
`.kicker--accent.kicker--bar` adds the 3px bar. The older kicker classes
(`.label`, `.eyebrow`, `.page-kicker`, `.masthead__kicker`, `.lead__kicker`,
`.hero__eyebrow`, `.rail-module__kicker`, `.feed-row__kicker`,
`.cover-card__kicker`, `.footer-nav__heading` and the rest) share that rule
through one selector list and keep only their layout. Do not give a kicker its
own font rules.

There is one chip: `.chip` (4px 10px, `--border-subtle` hairline, mono caption,
0.08em tracking, uppercase, `--text-secondary`). `.chip--evidence-primary` and
`.chip--evidence-secondary` mark the source class in the ledger. Topic labels,
evidence classes and suggestions all use it.

The fluid type scale runs from `--text-caption` to `--text-display`. Reading
copy stays near 32–39 em and uses a relaxed 1.68–1.72 line height. Monospace is
never the dominant headline language.

## Spacing and layout

The spacing scale uses quarter-rem through six-rem steps (`--space-1` through
`--space-9`). Shared gaps derive from that scale. The main container is 1360px,
the desktop navigation rail is 244px, and the reading measure is 35em with an
optional 39em wide state. Mobile gutters are fluid and never collapse below one
rem.

Desktop uses a persistent publication rail and flexible content column. Below
960px the rail becomes a compact top header with horizontally scrollable
primary navigation. Reading pages use generous vertical rhythm; archive,
Sources, and reference routes use denser rows. Lists of editions use `FeedRow`;
its `compact` form (title and date, no dek, no thumbnail) replaces the old
`IssueRow`/`.entry-row`/`.dense-list` rows.

## Surfaces, borders, and shapes

Base, panel, sunken, and emphasis surfaces define the hierarchy. One-pixel
hairlines carry grouping. Data strips collapse adjacent cell borders with
negative margins. Strong rules mark mastheads, evidence, corrections, and
completion. Radius is zero; status dots remain circular. Shadows, glass, glow,
and nested rounded cards are not part of the system.

## Brand and icons

`BrandLockup` is the shared public brand component. It renders the outlined
logotype from `public/brand/DNESKAi-logo*.svg` at 20 px, or 18 px with
`compact`, and its `tone` prop picks the light, dark or print (`mono-black`)
file. `app/icon.svg` is the square mark `DNESKAi-square.svg`; the Apple touch
icon and the 32 px favicon are its PNGs. `docs/design/BRAND_SYSTEM.md` has the
usage rules.

Primary navigation uses indexed label rows. Search retains its 16px,
1.5px-stroke `currentColor` magnifier; utility glyphs remain textual and hidden
from assistive technology when decorative.

## Editorial modules and state

Existing domain components remain authoritative: Editorial Highlights, Briefs
(„Krátce“), Watchlist („Ke sledování“), Source Ledger, Corrections,
Sponsorship, Topics, Issue Navigation (article pages only) and the completion
row. Legacy MDX may omit schema-v2 modules without fabricated filler. Strong
boundary colors are reserved for evidence, corrections, sponsorship, warning,
and completion states.

The source ledger has three columns: number, source (title, then publisher and
date) and kind of source as a chip. The issue masthead carries one serif
provenance sentence under the meta row, saying a language model wrote the text
and whether a person reviewed it, with a link to `/about#redakce`. It is not a
badge and not coloured.

The completion mark is one row on Today, between a 2px `--border-strong` rule
and a hairline: a `--status-complete` dot with the kicker „Konec vydání“ on
the left, „Máte přehled.“ in `--text-primary` on the right.

The right rail holds the one configured creative (labelled from
`config/banner.json`, „Vlastní projekt“ for devShark) and „Pojem dne“. An empty
slot renders nothing; there is no reserved advertising box. Every empty state
is one `.empty-line`, including a missed weekday, which sits above the newest
edition instead of replacing it.

Removed in the 2026-09 audit pass, not to be reintroduced without a product
decision: AI Pulse and Sparkline, FeedActions, ReadingProgress, SocialRow,
DidYouKnow, the lesson strip variant, the partner belt, AdPlaceholder,
IssueRow, TagChip, the drop cap, the completion poster and the Radar page.

## Focus, motion, and interaction

All interactive controls use a two-pixel blueprint focus ring with visible
offset. Minimum primary navigation targets are 44px. Selection uses a
low-opacity blueprint wash.

Motion is limited to short native CSS transitions and an eight-pixel page-entry
translation. There is no reading-progress bar. No motion framework, parallax, or animated
gradient is used. `prefers-reduced-motion` removes non-essential animation.

## Media

Authentic UI is always rendered from production code and data. An optional
BoardlessAI-delivered article hero uses the existing 21:9 lead, 3:2 related and
4:3 archive/weekly crops. Missing media renders as no media, never as a fake
placeholder. DNESKAi does not select providers or produce Topic, campaign or
social assets; those responsibilities remain in BoardlessAI.

### The overlay plate

From 768px up, a photographic hero carries its own copy: the image renders
first at full column width in its 21:9 crop, and the eyebrow, headline and dek
move onto a plate that overlaps the image's lower left. The plate is solid
`--surface-reading` with a 1px `--border-subtle` hairline and no radius. It is
opaque on purpose. Text never sits on photo pixels, so contrast holds on any
photograph without the scrim `DESIGN_THESIS.md` bans, and the result does not
depend on how dark a given image happens to be.

Three rules make the pattern survive real editions:

- **The plate overlaps in normal flow**, pulled up by `--plate-overlap`. It
  grows downward with the copy rather than being clipped by the image, which is
  what makes a long Czech headline safe. Everything rendered after the plate
  clears the overlap, so the article's image credit is a sibling below the
  plate rather than a caption pinned to the image's bottom edge, where the
  plate would cover it.
- **The type steps down inside the plate.** Display size is built for the full
  column; in a plate roughly 34em wide it wraps to four or five lines and the
  plate ends up more than twice the height of the 21:9 image it sits on. The
  headline drops one step and the dek clamps to three lines, which keeps plate
  and image in the same order of size.
- **Only a photograph gets a plate.** A delivered `.svg` cover is a drawn plate
  that arrives already composed, and the oldest ones have the headline burned
  into the artwork, so laying live text over one would double the title. Those
  keep the stacked rendering, as do heroes recovered from the og cache's
  raster fallback (which get a plate, having no caption to clear) and editions
  with no image at all.

Below 768px there is no overlap: the image renders first and the copy sits
flush beneath it at full width. At 320–430px a Czech headline needs the whole
column, and an inset plate would fight it.

Meta rows, the provenance sentence and topic chips stay below the image on every
variant.
Only the eyebrow, headline and dek ever move onto the plate.

### Cover cards

Weekly, Archive and Related editions render through one card: media, a mono
kicker, the title on a paper plate, a hairline, and a `--hover-line` hover.
Crops stay per surface — 3:2 on the grid surfaces, 4:3 on Archive and Weekly —
because the crop is what distinguishes them; the anatomy is what unifies them.

Archive is a dense list, so it takes the card's `row` layout: media at 140px on
the left, copy beside it rather than under a plate. An overlap inside a 140px
thumbnail would cover the picture instead of composing with it. Below 600px the
row stacks.

Two rules carry over from the hero plate. A drawn `.svg` cover never gets the
overlap, for the same reason it never gets a live-text hero. And a card with no
media renders text-first with the same spacing rather than reserving an empty
box — historical and legacy issues have no image, and that is a state, not a
gap to fill.

Every cover image carries explicit `width` and `height` attributes even where
the crop is set in CSS, so the ratio is known before the stylesheet arrives and
lists do not shift as covers load.

## Responsive and print rules

Layouts must reflow at 320/360, 430, 768, 1024, 1280–1440, and 1600+ widths without hiding editorial information. Wide evidence tables use labelled horizontal scroll containers. Long Czech headings and source titles must wrap without forcing page overflow.

Print removes navigation, interactive controls, progress, feeds, and operator UI; preserves publication identity, article hierarchy, sources, provenance where useful, and corrections; and avoids splitting critical headings or notices from their content.

## Extension rule

Search before creating. Reuse or extend existing components and tokens first. A new pattern is justified only when it represents a recurring semantic need, has responsive and accessibility behavior, and does not compete with an existing abstraction.
