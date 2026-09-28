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

All three faces are self-hosted through `next/font`. Space Grotesk 700 sets the
lead headline on its photograph, article and page titles; Grotesk 500/600 sets
the section bar, section labels, controls and footer links. Source Serif 4 sets
every other headline (600), deks, article prose, glosses and captions. IBM Plex
Mono is only for dates, times, credits, hosts and ledger numbers.

The scale (report page 07): `--text-lead-1` 60 px (28 px mobile) for a
one-article lead, `--text-lead-2` 44 px for a section lead, `--text-title`
52 px for the article `h1`, `--text-page` 48 px for page titles, serif
headlines at 26/22/18 px (`--text-h-serif-1/2/3`), `--text-dek` 19–20 px,
body 19 px / 1.7 at 36 em, labels and meta at 12 px.

### Labels, metadata and serif headlines (round 2)

The three typefaces have fixed roles. Space Grotesk carries the lead headline
on its photograph, page and section titles, the section bar, section labels and
controls. Source Serif 4 600 carries every other headline (`.h-serif--1/2/3`
at 26/22/18 px), deks and body. IBM Plex Mono is only for machine values
(dates, times, credits, hosts, ledger numbers) through `.meta`: 12 px,
lowercase, no tracking.

`.label` is the section label: Grotesk 600, `--text-label` (12 px), 0.08em,
uppercase, `--text-primary`; `.label--muted` in `--text-tertiary`,
`.label--section` in `--accent-primary`. The older kicker classes share that
rule until their components are rebuilt; do not give a label its own font
rules, and do not use mono for a label.

`.module-head` opens every block: 12 px padding over a 2 px `--border-ink`
rule, a 13 px label, an optional blue action on the right and an optional
one-line serif note below. `SectionMasthead` renders it.

`--border-ink`, `--band-ink`, `--band-label` and `--band-meta` are the four
colour roles added in round 2: the ink rule, the flat band under a headline on
a photo, its section label and its time. Blue is for section labels, links and
the active state only.

There is one chip: `.chip` (4px 10px, `--border-subtle` hairline, mono caption,
uppercase, `--text-secondary`), used by the archive filter row.

The fluid type scale runs from `--text-caption` to `--text-display`. Reading
copy stays near 32–39 em and uses a relaxed 1.68–1.72 line height. Monospace is
never the dominant headline language.

## Spacing and layout

The spacing scale uses quarter-rem through six-rem steps (`--space-1` through
`--space-9`). Pages sit in the 1360 px container with a 40 px inset
(`--page-pad`, 12 px below 960). Layouts use a 12-column grid with a 24 px
gutter (`--grid-gutter`): the front-page lead spans 12, the day band 8 + 4, the
article 8 + 4 with the figure at 9 + 3, section pages 8 + 4 then three covers,
and list pages a fixed 200 px date column beside the day's articles.

The masthead replaces the old sidebar: row 1 is the edition date, the 34 px
logotype and the search control over a 2 px ink rule; row 2 is the section
bar (Dnes, Modely, Firmy a trh, Bezpečnost, Regulace, Vývoj, then „Více“). The
header is sticky with a negative top, so only the section bar stays, condensed
to 52 px with a small logotype, the short date and a search icon. Below 960 px
row 1 is a 56 px bar (menu, logotype, search) and the section bar a scrolling
strip whose „Více“ opens the drawer. There are no numbered indices.

Every list of articles uses `Card` (`components/editorial/Card.tsx`): `row`
(3:2 image left at 240/280 px), `cover` (image above), `compact` (square on the
right at 136/120/96/64/56 px) and `band` (headline on the photo's ink band).
`DayGroup` renders a publishing day on Poslední týden and in the Archive.

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

`BrandLockup` also has `size="masthead"` (34 px) and `size="footer"` (24 px).
Search is an outlined control („Hledat ⌘K“) with the 16 px, 1.5 px-stroke
magnifier; utility glyphs stay textual and hidden from assistive technology
when decorative.

## Editorial modules and state

Existing domain components remain authoritative: Editorial Highlights, Briefs
(„Krátce“), Watchlist („Ke sledování“), Source Ledger, Corrections,
Sponsorship, Topics, and the completion row. Legacy MDX may omit schema-v2 modules without fabricated filler. Strong
boundary colors are reserved for evidence, corrections, sponsorship, warning,
and completion states.

The source ledger („Zdroje tohoto článku“, `#zdroje`) is a two-column list:
number, serif title, then publisher, date and the kind of source, with
„primární“ in `--status-complete`. The article head has a byline block: an
empty „Redaktor“ row (owner decision) and „Ověření“, which claims a review only
when `generation.human_reviewed` is true and links to `/about#redakce`, where
the language-model statement lives. Neither is a badge.

The completion row closes the day on Today, between a 2 px `--border-ink` rule
and a hairline: a `--status-complete` dot with „Konec dnešního vydání“ on the
left and „Máte přehled.“ in serif italic on the right.

The day band's side column (and the article's) holds Ke sledování, „Pojem
dne“ and the one configured creative (labelled from `config/banner.json`,
„Vlastní projekt“ for devShark). An empty
slot renders nothing; there is no reserved advertising box. Every empty state
is one `.empty-line`, including a missed weekday, which sits above the newest
edition instead of replacing it.

Removed in the 2026-09 audit pass, not to be reintroduced without a product
decision: AI Pulse and Sparkline, FeedActions, ReadingProgress, SocialRow,
DidYouKnow, the lesson strip variant, the partner belt, AdPlaceholder,
IssueRow, TagChip, the drop cap, the completion poster and the Radar page.
Removed in round 2: the sidebar rail and its drawer, the right rail, the
overlay copy plate, the hero plate, CoverCard, FeedRow, IssueNavigation,
RelatedIssues, reading time, and index numbers on Briefs and Watchlist rows.

## Focus, motion, and interaction

All interactive controls use a two-pixel blueprint focus ring with visible
offset. Minimum primary navigation targets are 44px. Selection uses a
low-opacity blueprint wash.

Motion is limited to short native CSS transitions and an eight-pixel page-entry
translation. There is no reading-progress bar. No motion framework, parallax, or animated
gradient is used. `prefers-reduced-motion` removes non-essential animation.

## Media

Authentic UI is always rendered from production code and data. Photographs are
used at two ratios only: 3:2 (the article figure, covers, week rows; cropped to
2:1 when the front-page lead spans 12 columns) and 1:1 (squares in rows, the
mobile lead). Every image carries `width` and `height` and is lazy unless it is
the lead or the article figure.

A drawn SVG plate, or an illustration whose `origin` is not `photo`, counts as
no image. `ImageOrFallback` then draws a box at the slot's ratio in
`--surface-subtle` with a hairline and a meta line „bez fotografie · datum“, so
nothing shifts and nothing is invented. The lead never shows that box: an
article without a photo leads typographically, headline on paper. DNESKAi does
not select providers or produce Topic, campaign or social assets; BoardlessAI
does (`docs/design-review-r2/handoff/UPSTREAM_REQUIREMENTS.md` §3).

### The headline on the photo

The front-page lead, and a section page's newest article, set the section
label and the headline white on a flat ink band (`--band-ink`) across the
bottom of the photograph. The band is opaque enough that white holds ≥ 10:1
whatever the photograph is; it is never a gradient. The rest of the lead (dek,
source count, credit, „Proč na tom záleží“) sits below the image.

## Responsive and print rules

Layouts must reflow at 320/360, 430, 768, 1024, 1280–1440, and 1600+ widths without hiding editorial information. Wide evidence tables use labelled horizontal scroll containers. Long Czech headings and source titles must wrap without forcing page overflow.

Print removes navigation, interactive controls, progress, feeds, and operator UI; preserves publication identity, article hierarchy, sources, provenance where useful, and corrections; and avoids splitting critical headings or notices from their content.

## Extension rule

Search before creating. Reuse or extend existing components and tokens first. A new pattern is justified only when it represents a recurring semantic need, has responsive and accessibility behavior, and does not compete with an existing abstraction.
