# DNESKAi — launch redesign specification

Status: implementation-ready, 2026-08-09
Scope: reader surfaces only. Delivery, schema and BoardlessAI boundaries unchanged.
Supersedes: `docs/REDESIGN.md` (instrument-panel direction, 2026-07-30) for all reader pages.

Sample headlines, events and episode titles in this document are illustrative
placeholders written to real length and diacritic density. They are not claims.

---

## 1. Decision summary

1. **Canvas flips to light.** Page `#f7f7f5`, cards and reading surface `#ffffff`, ink `#14161a`. One theme, no toggle.
2. **Accent stays blue, re-derived for white:** `#2f5ae6` (5.64:1 on white, 5.25:1 on page). `#4d7cff` fails AA on light at 3.72:1 and cannot carry link duty.
3. **Rationale.** The product changed job: it is no longer one edition read once at night, it is a surface scanned several times a day across editions, external links, podcasts and events. A dark canvas reads as an instrument you check; a paper canvas reads as a magazine you browse — and it is the only honest carrier for the mixed-source content (external titles, later ad creatives, event listings) that now supplies most of the page volume. Keeping the hue means the relaunch reads as the same publication maturing rather than a different product; the darkening is forced by contrast, not taste. The identity that actually carried DNESKAi — zero radius, hairlines, three families with fixed jobs, the completion mark — is untouched, and those survive polarity inversion intact.
4. **Nothing else about the instrument identity survives on reader pages.** All production telemetry is removed, not restyled (§9).

---

## 2. Token sheet

### 2.1 Raw palette

Replaces the raw block in `app/globals.css`. Names kept so the diff stays legible;
`blueprint` remains accurate — the hue is unchanged, the lightness is not.

```css
--color-blueprint-blue:       #2f5ae6;
--color-blueprint-blue-hover: #1d43bb;
--color-ink-black:            #14161a;
--color-carbon:               #3c4149;
--color-slate:                #5f6672;
--color-fog:                  #e2e2de;
--color-paper:                #ffffff;
--color-stone:                #efefec;
--color-canvas:               #f7f7f5;
--color-mint:                 #067a52;
--color-rust:                 #c0272c;
```

### 2.2 Semantic roles — every name currently in production

```css
--surface-page:        #f7f7f5;   /* var(--color-canvas)  — page field */
--surface-reading:     #ffffff;   /* var(--color-paper)   — article, cards, panels */
--surface-subtle:      #efefec;   /* var(--color-stone)   — sunken: SVG plates, thumb wells, table zebra */
--surface-emphasis:    #eaf0ff;   /* accent wash: highlight blocks, active nav */
--surface-hover:       #f2f2ef;   /* row and nav hover fill */

--text-primary:        #14161a;
--text-secondary:      #3c4149;
--text-tertiary:       #5f6672;   /* metadata floor — 5.78 / 5.39 / 5.02 on reading / page / subtle */

--border-subtle:       #e2e2de;
--border-strong:       #c9c9c3;
--border-control:      #8e8e88;   /* NEW — required. See §2.3 */

--accent-primary:      #2f5ae6;
--accent-primary-hover:#1d43bb;

--status-complete:     #067a52;
--status-warning:      #8a5a0d;
--status-correction:   #c0272c;

--focus-ring:          #2f5ae6;
--selection-background:rgba(47, 90, 230, 0.18);
```

Supporting values already referenced by production CSS, re-tuned:

```css
--danger-line:    #f0c9ca;
--danger-surface: #fdf4f4;
--sponsor-surface:#fdf7e8;   /* NEW — sponsor label block */
--hover-line:     #b3b3ab;   /* card/row border on hover */
--numeric-ghost:  rgba(20, 22, 26, 0.045);

/* Compatibility aliases — unchanged names, new referents */
--ink-primary: var(--text-primary);
--ink-muted:   var(--text-tertiary);
--ink-dim:     var(--text-tertiary);
```

### 2.3 Why `--border-control` is new

`--border-subtle` (1.30:1) and `--border-strong` (1.66:1) are grouping hairlines, not
affordances, and they cannot reach the 3:1 non-text minimum without becoming visual
noise on a paper canvas. Three elements need a border that *is* the affordance —
the search input, the ad reservation box, and the week-boundary action. Those use
`--border-control` (3.29:1 on `--surface-reading`, 3.07:1 on `--surface-page`).
Everything else keeps the hairlines.

### 2.4 Type scale

Families and their jobs are unchanged: **Space Grotesk** display/UI/nav,
**Source Serif 4** prose and deks, **IBM Plex Mono** dates, labels, metadata, chips.

```css
--text-caption:    0.6875rem;                              /* 11px  — mono meta, chips */
--text-body-sm:    0.9rem;                                 /* 14.4px */
--text-body:       1rem;
--text-lead:       clamp(1.0625rem, 0.95rem + 0.35vw, 1.25rem);  /* deks */
--text-row:        clamp(1.125rem, 0.98rem + 0.5vw, 1.35rem);    /* NEW — feed row headline */
--text-subheading: clamp(1.35rem, 2vw, 1.55rem);
--text-heading:    clamp(1.75rem, 1.3rem + 1.6vw, 2.375rem);
--text-display:    clamp(2.4rem, 1.6rem + 2.6vw, 4rem);

--leading-caption:    1.4;
--leading-body-sm:    1.5;
--leading-body:       1.68;
--leading-row:        1.22;   /* NEW */
--leading-lead:       1.5;
--leading-subheading: 1.2;
--leading-heading:    1.06;
--leading-display:    1.02;

--tracking-display: -0.04em;   /* NEW */
--tracking-heading: -0.035em;
--tracking-row:     -0.02em;   /* NEW */
--tracking-label:    0.14em;
--tracking-kicker:   0.16em;
```

Computed sizes at the three review widths:

| Token | 390 | 1280 | 1600 |
| --- | --- | --- | --- |
| `--text-display` | 38.4px | 58.9px | 64.0px (cap) |
| `--text-heading` | 34.1px* | 41.3px* | 38.0px (cap) |
| `--text-row` | 21.2px | 21.6px | 21.6px (cap) |
| `--text-lead` | 20.0px* | 19.7px* | 20.0px (cap) |

\* clamp caps bind before the preferred value; the cap column is the effective size.

**Long-headline rule (required).** Czech lead headlines run long. At build time, when
`frontmatter.title.length > 100`, the hero renders with `data-long="true"` and
`.hero__title[data-long]` drops to `--text-heading`. Below 100 characters the display
size holds. Test string, 112 characters:
„Evropská komise odložila nejpřísnější část AI Actu o rok, výrobci základových modelů dostali odklad do srpna 2027" —
at 1280 that is 6 lines at 58.9px (≈360px tall) undropped, 4 lines at 38px dropped.
Both fit; the rule keeps the dek and meta row above the fold at 900px viewport height.

Every headline surface sets `text-wrap: pretty`; the hero sets `text-wrap: balance`.
`hyphens: auto` with `lang="cs"` on `<html>` for the hero and feed headlines only.

### 2.5 Spacing, layout, motion — unchanged names

```css
--container:     1360px;
--sidebar-width: 244px;
--rail-width:    300px;    /* NEW — right rail */
--reading:       35em;
--mobile-gutter: clamp(1rem, 4vw, 1.5rem);
--space-1…9:     0.25 / 0.5 / 0.75 / 1 / 1.5 / 2 / 3 / 4 / 6 rem;
--radius-*:      0;        /* all of them, unchanged */
--shadow-subtle: none;

--dur-instant: 80ms;  --dur-fast: 150ms;  --dur-medium: 240ms;  --dur-slow: 460ms;
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
```

### 2.6 Open Graph literals

`lib/og-theme.ts`, mirroring §2.2 as literals:

```ts
export const OG = {
  page:  "#f7f7f5",
  bg:    "#f7f7f5",
  paper: "#ffffff",
  panel: "#ffffff",
  ink:   "#14161a",
  carbon:"#3c4149",
  muted: "#3c4149",
  slate: "#5f6672",
  dim:   "#5f6672",
  fog:   "#e2e2de",
  rule:  "#c9c9c3",
  accent:"#2f5ae6",
  cyan:  "#1d43bb",
  complete:  "#067a52",
  correction:"#c0272c",
  magenta:   "#c0272c",
  fontEditorial: '"Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif',
  fontInterface: '"Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif',
  fontMono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
} as const;
```

---

## 3. Grid

Container 1360px, `box-sizing: border-box`, `padding: 0 var(--mobile-gutter)`.
Left rail 244px fixed. Right rail 300px (the ad reservation defines it).

| Viewport | Inner | Left rail | Gap | Main | Gap | Right rail |
| --- | --- | --- | --- | --- | --- | --- |
| ≥1441 (container capped) | 1312 | 244 | 48 | **680** | 40 | 300 |
| 1280–1440 | vw − 48 | 244 | 40 | **616** at 1280 | 32 | 300 |
| 1024–1279 | vw − 48 | 244 | 40 | **692** at 1024 | — | dropped |
| 960–1023 | vw − 48 | 244 | 40 | vw − 324 | — | dropped |
| 768–959 | 720 at 768 | top bar | — | **720** | — | dropped |
| 431–767 | vw − 2×gutter | top bar | — | full | — | dropped |
| 390 | 358 | top bar | — | **358** | — | dropped |
| 360 | 328 | top bar | — | **328** | — | dropped |
| 320 | 288 | top bar | — | **288** | — | dropped |

**Right rail drops below 1280.** Its modules reflow into the main column in this
order, each full-width of the main column: ad box (centred, still exactly 300×250) →
Denní lekce → Víte, že… → Nejbližší akce → Odebírat. On the front page they sit
between the lead package and the Poslední týden feed at 1024–1279, and follow the
mobile order at <960 (§4.2).

**Left rail collapses below 960** into the mobile top bar + drawer (§6.2).

**Feed-row thumbnails** (4:3):

| Viewport | Thumb |
| --- | --- |
| ≥1024 | 160×120 |
| 768–1023 | 140×105 |
| 431–767 | 120×90 |
| 361–430 | 104×78 |
| 321–360 | 88×66 |
| ≤320 | dropped — headline-only rows |

**Hero image** is 21:9 at every width: 680×291 (≥1441), 616×264 (1280), 720×309 (768),
358×153 (390), 288×123 (320).

From 768px up a photographic hero renders first and the copy plate overlaps its
lower left; see §「Photo variant」 below and the Media section of
`docs/design/DESIGN_SYSTEM.md`. The crop is unchanged — the plate sits over it.

---

## 4. Page specs

Legend: `│` column edge, `─` 1px hairline, `═` 2px rule, `▒` `--surface-subtle` fill.

### 4.1 Dnes (`/`) — front page, 1280

```
┌────────────┬──────────────────────────────────────────┬──────────────┐
│ RAIL 244   │ MAIN 616                                 │ RAIL 300     │
│            │                                          │              │
│ ● DNESKAi  │ ── LEAD PACKAGE ───────────────────────  │ ┌──────────┐ │
│ To podstat-│                                          │ │ 300×250  │ │
│ né z AI.   │ ▌DNEŠNÍ VYDÁNÍ · 9. 8. 2026      (mono)  │ │  dashed  │ │
│ Každý den. │                                          │ │ Místo pro│ │
│            │ Evropská komise odložila                 │ │ reklamu  │ │
│ 01 Dnes ◄  │ nejpřísnější část AI Actu                │ └──────────┘ │
│ 02 Poslední│ o rok                       58.9px/1.02  │              │
│    týden   │                                          │ ── DENNÍ ─── │
│ 03 O čem   │ Odklad do srpna 2027 se týká…    (serif) │ LEKCE (mono) │
│    se mluví│                                          │ Fine-tuning  │
│ 04 AI      │ 9. 8. 2026 · 6 min čtení         (mono)  │ Doladění mo… │
│    modely  │                                          │ Celý popis → │
│ 05 Podcasty│ ┌──────────────────────────────────────┐ │ ──────────── │
│ 06 Akce    │ │        HERO 616×264  (21:9)          │ │              │
│ ─────────  │ └──────────────────────────────────────┘ │ ── VÍTE, ─── │
│ Radar      │                                          │ ŽE… (mono)   │
│ Témata     │ ┌── VE ZKRATCE ─────┬── NA RADARU ─────┐ │ Text faktu…  │
│ Týdeník    │ │ 01 Headline link  │ 01 Headline ↗    │ │ Ověřeno …    │
│ Archiv     │ │ 02 Headline link  │ 02 Headline ↗    │ │ ──────────── │
│ Lekce      │ │ 03 Headline link  │ 03 Headline ↗    │ │              │
│ O magazínu │ │ 04 Headline link  │ 04 Headline ↗    │ │ ── NEJBLIŽŠÍ │
│ ─────────  │ └───────────────────┴──────────────────┘ │ AKCE (mono)  │
│ ⌕ Hledat   │                                          │ 14 ŘÍJ ·     │
│            │ ════════════════════════════════════════ │ ML Prague    │
│            │             ●  (complete dot)            │ 21 LIS ·     │
│            │        VYDÁNÍ DOKONČENO      (mono)      │ AI Meetup    │
│            │        Máte přehled.        (display)    │ Všechny →    │
│            │ ════════════════════════════════════════ │ ──────────── │
│            │                                          │              │
│            │ POSLEDNÍ TÝDEN            Vše →   (mono)  │ ── ODEBÍRAT  │
│            │ ──────────────────────────────────────── │ Atom · e-mail│
│            │ AI MODELY                    ┌────────┐  │ ──────────── │
│            │ Seznam.cz nasadil vlastní    │ 160×120│  │              │
│            │ jazykový model do vyhledá…   │  4:3   │  │              │
│            │ Dek, dva řádky, serif…       └────────┘  │              │
│            │ 8. 8. 2026 · 5 min čtení                 │              │
│            │ ──────────────────────────────────────── │              │
│            │ (× 6 more rows)                          │              │
│            │ ──────────────────────────────────────── │              │
│            │ [ Objevit předchozí týden           → ]  │              │
└────────────┴──────────────────────────────────────────┴──────────────┘
                              FOOTER (full width of main + right rail)
```

Vertical metrics, main column: lead package top padding 40px; kicker→headline 18px;
headline→dek 16px; dek→meta 14px; hero image→condensed column 32px; condensed
column→completion 48px; completion block 96px tall, 2px rules top and bottom;
completion→feed header 56px; feed header→first row 20px; row padding 20px 0.

On a photographic lead at ≥768px the order inverts: the image comes first and the
copy plate rides up over it by `--plate-overlap`, `clamp(2.5rem, 5vw, 5rem)`. The
plate is `min(34em, 85%)` wide, inset `--space-5` from the left, padded
`--space-4 --space-5 --space-5`. The meta row follows the plate on the page, never
inside it.

Component inventory — main: hero package (photo variant), condensed briefs column
(2×4 headline links), completion mark, section head, feed row ×7, week-boundary action.
Right rail: ad placeholder, widget module frame ×3, subscribe module.
Rail: brand lockup, nav item ×6 indexed, divider, nav item ×6 secondary, search control.

**Condensed briefs column.** „Ve zkratce" reuses `fm.dispatches` (title only, link to
the article anchor); „Na radaru" reuses `fm.wire` (title + outbound arrow). Four items
each, mono index `01`–`04`, headline 0.9375rem/1.35 Space Grotesk 500, hover → accent.
Two columns at ≥1024, stacked below.

**Completion mark placement.** It closes the *edition*, not the page: hero + condensed
briefs are today's edition, so the mark sits between them and the Poslední týden feed.
The feed is recirculation, which happens after the ritual, not before it.

### 4.2 Dnes — 390

Order, top to bottom:

```
┌──────────────────────────────┐  ← 390, gutter 16, content 358
│ ☰   DNESKAi              ⌕   │  top bar 56px, sticky, hairline bottom
├──────────────────────────────┤
│ ▌DNEŠNÍ VYDÁNÍ · 9. 8. 2026  │
│ Headline 38.4px/1.02         │
│ Dek, serif 20px              │
│ 9. 8. 2026 · 6 min čtení     │
│ ┌──────────────────────────┐ │
│ │    HERO 358×153 (21:9)   │ │
│ └──────────────────────────┘ │
│ VE ZKRATCE  01–04            │
│ NA RADARU   01–04            │
│ ═══════ Máte přehled. ══════ │
│ POSLEDNÍ TÝDEN               │
│ row ×3  (thumb 104×78)       │
│ ┌──────────┐                 │
│ │ 300×250  │  centred        │
│ └──────────┘                 │
│ row ×4                       │
│ [ Objevit předchozí týden → ]│
│ Denní lekce                  │
│ Víte, že…                    │
│ Nejbližší akce               │
│ Odebírat                     │
│ FOOTER + social row          │
└──────────────────────────────┘
```

This is the recommended order with one change: the condensed briefs stay glued to the
hero and the completion mark stays directly under them. Splitting the edition around
the ad box would break the ritual, which is the one thing on this page that cannot be
scrolled past. The ad box lands after the third feed row instead — first screen after
the edition, still above 60% of the scroll depth.

### 4.3 No-edition day (`/`)

Some days have no edition. The page does not fake one and does not promote a
back issue into the hero slot.

```
▌DNES BEZ VYDÁNÍ                              (mono, --text-tertiary, not warning red)
Dnes nevyšlo vydání.                          (--text-heading, --text-primary)
Vydání vychází každý všední den ráno.         (serif, --text-secondary, max 62ch)
Poslední vydání najdete níže.
──────────────────────────────────────────────  1px --border-strong
POSLEDNÍ TÝDEN                          Vše →
(feed continues normally, rail unchanged)
```

The completion mark is absent — there is no edition to complete. The kicker is
tertiary, not `--status-warning`: a day without an edition is a normal editorial
state, not a fault, and colouring it amber reintroduces the status telemetry the
redesign removes.

### 4.4 Article page (`/articles/[slug]`), 1280

```
┌────────────┬──────────────────────────────────────────┬──────────────┐
│ RAIL 244   │ MAIN 616                                 │ RAIL 300     │
│            │ ▌VYDÁNÍ · 8. 8. 2026                     │ ┌ 300×250 ─┐ │
│            │ Headline (display, long-rule applies)    │ └──────────┘ │
│            │ Dek (serif, --text-lead)                 │              │
│            │ 8. 8. 2026 · 6 min čtení                 │ ── SOUVISE-  │
│            │ [AI modely]  ← chip row, only if tagged  │ JÍCÍ VYDÁNÍ  │
│            │ ┌── HERO 616×264 ────────────────────┐   │ 01 Headline  │
│            │ └────────────────────────────────────┘   │ 02 Headline  │
│            │ ┌────────┬────────┬────────┐             │ 03 Headline  │
│            │ │ PROČ   │ CO SE  │ NEJIS- │ highlights  │              │
│            │ │ TO JE  │ ZMĚNILO│ TOTA   │ 3-up grid   │              │
│            │ │ DŮLEŽ. │        │        │             │              │
│            │ └────────┴────────┴────────┘             │              │
│            │ ── prose, 35em measure, serif ─────────  │              │
│            │ ── PŘEHLED ZDROJŮ ─────────────────────  │              │
│            │ ── OPRAVY (only when present) ─────────  │              │
│            │ ═══════ Máte přehled. ════════════════   │              │
│            │ ← Předchozí vydání   Další vydání →      │              │
└────────────┴──────────────────────────────────────────┴──────────────┘
```

Reading structure is unchanged: 35em measure, Source Serif 4 prose at
`--text-body`/`--leading-body`, the three highlight blocks, the source ledger, the
corrections notice. Only the skin, the chip row and the right rail are new.
Highlight blocks keep their 2px top rule: `--accent-primary` for „Proč to je
důležité", `--border-strong` for „Co se změnilo", `--status-warning` for „Co zůstává
nejisté". Print is unchanged (§8).

At 390 the highlights stack, the rail modules move below the corrections notice and
above the completion mark, and the ad box sits directly after the prose.

### 4.5 Poslední týden (`/tyden`), 1280

Same shell. Main column: page header (kicker „POSLEDNÍ TÝDEN", title „Posledních
sedm dnů.", intro one line), then day-grouped feed rows, then the week-boundary
action. Right rail: ad box, Denní lekce, Nejbližší akce, Odebírat.

```
POSLEDNÍ TÝDEN                                          (mono kicker, accent)
Posledních sedm dnů.                                    (--text-heading)
Každé vydání zůstává v tomto přehledu sedm dní.         (serif intro, 62ch)
══════════════════════════════════════════════════════  2px --border-strong
PÁTEK · 8. 8. 2026                                      (mono, sticky day label)
──────────────────────────────────────────────────────
[feed row]
──────────────────────────────────────────────────────
ČTVRTEK · 7. 8. 2026
[feed row]
…
──────────────────────────────────────────────────────
┌────────────────────────────────────────────────────┐
│ PŘEDCHOZÍ TÝDEN                                    │  mono 11px tertiary
│ Týden 28. 7. – 3. 8. 2026                       →  │  Space Grotesk 600, 1.25rem
└────────────────────────────────────────────────────┘  64px tall, --border-control
```

Week pages (`/tyden/2026-w31`) are identical, with the kicker replaced by
„TÝDEN 28. 7. – 3. 8. 2026" and the action pointing one week further back. When the
archive is exhausted the action is replaced by:

```
Dál už archiv nesahá.                       (serif, --text-secondary)
Starší vydání najdete v Archivu →           (accent link)
```

### 4.6 AI modely (`/ai-modely`)

Identical anatomy to §4.5, filtered, no day grouping (density is too low). Empty state,
which is the launch state:

```
AI MODELY
Vydání o modelech.
──────────────────────────────────────────────────────
Zatím tu není žádné vydání zaměřené na modely.        (serif, --text-secondary)
Kategorie se plní postupně, jak vycházejí nová vydání.
Poslední týden →                                       (accent link)
```

No illustration, no skeleton rows, no "coming soon" badge.

### 4.7 O čem se mluví (`/o-cem-se-mluvi`), 1280

Cards grouped by day, two per row at ≥1024 in the 616 main column (296px each,
24px gap), one per row below 768. Every card is complete without an image.

```
DNES · 9. 8. 2026
┌───────────────────────────────┐ ┌───────────────────────────────┐
│ ┌──┐                          │ │ ┌──┐                          │
│ │ M│ MEDIUM         (mono)  ↗ │ │ │ S│ SUBSTACK       (mono)  ↗ │
│ └──┘                          │ │ └──┘                          │
│ The Hidden Cost of Long       │ │ What the EU AI Act Actually   │
│ Context Windows               │ │ Requires of Model Providers   │
│ (original title, often EN)    │ │                               │
│ Simon Willison · před 4 h     │ │ Alice Nováková · včera        │
│ Jednořádkové české shrnutí…   │ │ Jednořádkové české shrnutí…   │
└───────────────────────────────┘ └───────────────────────────────┘
```

Monogram badge: 32×32, 1px `--border-strong`, `--surface-subtle` fill, mono 0.8125rem
`--text-primary`, first letter of the platform (M / S / B for blog). No favicons, no
scraped assets. Title: Space Grotesk 600, 1.0625rem/1.3, `--text-primary`, up to 3
lines. Author + relative date: mono `--text-caption`, `--text-tertiary`. Summary:
Source Serif 4 0.9375rem, `--text-secondary`, clamped to 2 lines, optional.
Outbound arrow ↗ top-right, `--text-tertiary`, → accent on card hover.
Card padding 20px, hairline border, `--surface-reading`.

Relative dates in Czech: „před 4 h", „včera", „před 3 dny"; past 7 days, absolute
„1. 8. 2026".

### 4.8 Podcasty (`/podcasty`), 1280

Rows, not cards — episodes are a list, and the platform links need horizontal room.

```
DNES · 9. 8. 2026
──────────────────────────────────────────────────────────────
LATENT SPACE                                     (mono eyebrow, tertiary)
The State of Open Weights in 2026                (Space Grotesk 600, --text-row)
1 h 12 min · 9. 8. 2026                          (mono caption, tertiary)
YouTube ↗   Spotify ↗   Apple ↗   RSS ↗          (mono caption, accent, 24px gap)
──────────────────────────────────────────────────────────────
```

Row padding 20px 0, hairline bottom. Duration omitted entirely when unknown — no „—",
no „neznámá délka". Platform links are text labels with a 44px minimum touch height
(padding 12px 0), wrapping to a second line at ≤430.

### 4.9 Akce (`/akce`), 1280

**Stacked sections with anchor navigation**, per your pick — and it is the right one
here: two `<section id>` blocks with a sticky anchor row is real static HTML that works
with zero JavaScript, keeps both scopes in the page for search and print, and gives
each scope a linkable URL (`/akce#svet`). A `:target` tab would hide half the content
from find-in-page and from print, and would leave the first paint showing an arbitrary
default tab.

```
AKCE
Kam jít.
──────────────────────────────────────────────────────
[ Česko ]  [ Svět ]                    ← sticky anchor row, 56px, hairline bottom
══════════════════════════════════════════════════════
ČESKO                                                  id="cesko"
┌────┬───────────────────────────────────────────────┐
│ 14 │ Machine Learning Prague 2026                  │  date block 72px wide,
│ ŘÍJ│ Praha · Fórum Karlín                          │  mono 1.5rem day /
│    │ od 4 900 Kč · pořádá ML Prague            ↗   │  0.6875rem month
└────┴───────────────────────────────────────────────┘
(rows, ascending, hairline between)
▸ PROBĚHLÉ (12)                        ← <details>, closed, --text-tertiary
──────────────────────────────────────────────────────
SVĚT                                                   id="svet"
(same anatomy; „online" replaces city when remote; „zdarma" when free)
```

Price line omitted when unknown. Past events inside `<details>` render at
`--text-tertiary` with the date block at `--surface-subtle`.

At 390 the date block stays 56px wide on the left; title, place and price stack.

---

## 5. Left rail — contents and nothing else

```
● DNESKAi                          brand lockup: 9px accent square + wordmark 1.4375rem
To podstatné z AI. Každý den.      strapline, mono --text-caption, --text-tertiary
                                   (32px gap)
01  Dnes                 → /
02  Poslední týden       → /tyden
03  O čem se mluví       → /o-cem-se-mluvi
04  AI modely            → /ai-modely
05  Podcasty             → /podcasty
06  Akce                 → /akce
────────────────────────           1px --border-subtle, 12px margin
Radar                    → /radar
Témata                   → /temata
Týdeník                  → /tydenik
Archiv                   → /archiv
Lekce                    → /lekce
O magazínu               → /o-magazinu
────────────────────────
⌕  Hledat                          search control, opens the existing palette
```

No status record, no issue date, no run time, no candidate counts, no cost, no signal
meter. `components/Sidebar.tsx` loses its entire `<section className="sidebar-status">`
block and its `latest` / `generation` / `classifyPublicHealth` data fetching; it keeps
`buildSearchIndex` for the palette.

Secondary items render at 0.8125rem, `--text-tertiary`, no index number, 36px row
height. Primary items keep 44px.

---

## 6. Component specs

### 6.1 Nav rail item

| State | Fill | Text | Index | Rule |
| --- | --- | --- | --- | --- |
| default | none | `--text-secondary` | `--text-tertiary` | none |
| hover | `--surface-hover` | `--text-primary` | `--text-tertiary` | none |
| active (`aria-current="page"`) | `--surface-reading` | `--accent-primary` | `--accent-primary` | 2px `--accent-primary` left inset |
| focus-visible | as state | as state | as state | 2px `--focus-ring`, offset 2px |

Height 44px, padding `0 12px 0 0`, Space Grotesk 500 0.9375rem, index mono
`--text-caption` in a 1.75rem fixed column, `font-variant-numeric: tabular-nums`.
Transition: `background var(--dur-instant), color var(--dur-fast)`.

### 6.2 Mobile top bar + drawer (<960)

Top bar: 56px, sticky top, `--surface-page`, 1px `--border-subtle` bottom.
Left: menu trigger 44×44 (three 2px bars, 18px wide, 5px apart, `currentColor`).
Centre: wordmark 1.25rem, links to `/`. Right: search trigger 44×44 (the existing
16px 1.5px-stroke magnifier).

Drawer: full-screen `--surface-page`, `position: fixed; inset: 0; z-index: 30`.
Header row 56px repeats the wordmark with a 44×44 close ✕. Nav items 56px tall,
Space Grotesk 500 1.125rem, indexed, hairline between; secondary group after a
divider at 48px tall, 1rem, `--text-secondary`. Search control pinned at the bottom
with 24px inset.

Open: `transform: translateX(-100%) → 0`, `var(--dur-medium) var(--ease-out)`.
Focus moves to the close button; focus is trapped; `Escape` closes; body scroll locks
via `overflow: hidden` on `<html>`. Reduced motion: no transform, opacity only, 0ms.

### 6.3 Hero package

**Photo variant.** Kicker („DNEŠNÍ VYDÁNÍ · 9. 8. 2026") mono `--text-caption`,
`--accent-primary`, preceded by a 3×0.95em accent bar. Headline `--text-display`,
Space Grotesk 700, `--tracking-display`, `--leading-display`, `--text-primary`,
`max-width: 20ch`. Dek Source Serif 4 `--text-lead`, `--text-secondary`,
`max-width: 46ch`. Meta row mono `--text-caption`, `--text-tertiary`:
`date · N min čtení`. **Nothing else in the meta row** — no source counts, no signal,
no cost. Image 21:9, no frame padding, hairline `--border-subtle` all round.

At ≥768px this variant composes rather than stacks: the image renders first and
the kicker, headline and dek sit on an opaque `--surface-reading` plate overlapping
its lower left. Inside the plate the headline drops to `--text-heading`
(`--text-subheading` past the 100-character `data-long` threshold) and the dek
clamps to three lines, both caps released so the plate is the measure. Below 768px
the plate flattens: image first, copy flush beneath at full width, no overlap, no
clamp. The pattern applies to photographs only — never to the SVG-plate variant
below.

**SVG-plate variant** (no photo). Same 21:9 box filled `--surface-subtle` with a
deterministic 45° hairline stripe pattern — `--border-subtle` strokes, 1px wide,
6px pitch, seeded from the slug so the plate is stable per article — plus the
wordmark mono `--text-caption` `--text-tertiary` bottom-left inset 16px. No icon,
no illustration, no headline burned in. The plate is decorative: `role="presentation"`,
`aria-hidden="true"`.

**Text-first variant** (also legitimate): omit the plate entirely, headline
`max-width: 24ch`, dek `max-width: 62ch`, and let the condensed briefs column rise.
Use this on `/tyden` and `/ai-modely` lead rows; use the plate on `/`.

**No byline.** DNESKAi is one publication with one editorial voice; a byline that
repeats identically on every row is noise, and „Redakce" repeated 8 times reads as
padding. The meta row is date · reading minutes, everywhere.

### 6.4 Feed row

Grid `minmax(0,1fr) [thumb]`, gap 20px, padding 20px 0, `border-bottom: 1px solid
var(--border-subtle)`, whole row is one `<a>`.

- Kicker: mono `--text-caption`, `--accent-primary`, `--tracking-label`, uppercase. Present only for categorised editions; absent rows start at the headline with no reserved space.
- Headline: Space Grotesk 700, `--text-row`, `--leading-row`, `--tracking-row`, `--text-primary`, max 3 lines (`-webkit-line-clamp: 3`).
- Dek: Source Serif 4 0.9375rem/1.5, `--text-secondary`, 2 lines.
- Meta: mono `--text-caption`, `--text-tertiary`.
- Thumb: 4:3, `object-fit: cover`, hairline. Missing → the same seeded stripe plate at 4:3, or the thumb column collapses and the copy takes the full width (both legitimate; pick per surface and stay consistent within a page).

| State | Fill | Headline | Thumb |
| --- | --- | --- | --- |
| default | transparent | `--text-primary` | 1px `--border-subtle` |
| hover | `--surface-hover`, bled 16px into the gutters via negative margin + padding | `--accent-primary` | 1px `--hover-line` |
| focus-visible | as hover | as hover | 2px `--focus-ring` on the row, offset −2px |
| visited | unchanged | unchanged | unchanged |

Visited is deliberately not styled: editions are dated, the date is in every row, and
a second colour on a paper canvas costs more than it tells.

### 6.5 Category chip

`[AI modely]` — mono `--text-caption`, uppercase, `--tracking-label`, padding 4px 8px,
1px `--border-strong`, `--text-secondary`, `--surface-reading`. Hover: border
`--accent-primary`, text `--accent-primary`. Zero radius. On the article page the chip
row sits under the meta row, 8px gap between chips. Many editions have no chip; the
row is absent, not empty.

### 6.6 External-link card

Per §4.7. States: default hairline `--border-subtle`; hover border `--hover-line`,
title `--accent-primary`, arrow `--accent-primary`; focus-visible 2px `--focus-ring`
offset 2px. Cards carry `rel="noopener noreferrer"` and `target="_blank"`, and the
arrow ↗ is `aria-hidden` with „(otevře se v novém okně)" in an `sr-only` span.

### 6.7 Podcast row

Per §4.8. The show eyebrow is mono `--text-caption` uppercase `--text-tertiary`.
Platform links: mono `--text-caption`, `--accent-primary`, underline on hover only,
each a 44px-tall touch target. Row hover raises no fill (the row is not a single link
— the episode title and each platform link are separate destinations).

### 6.8 Event card

Date block: 72px wide (56 at ≤430), `--surface-subtle`, hairline right; day mono
1.5rem `--text-primary` tabular; month mono `--text-caption` uppercase
`--text-tertiary`. Body: title Space Grotesk 600 `--text-row`; place mono
`--text-caption` `--text-secondary`; price + organiser mono `--text-caption`
`--text-tertiary`. Outbound ↗ right, vertically centred.
Past events: all text one step down (`--text-tertiary`), date block
`--surface-page`, no hover state, inside a closed `<details>`.

### 6.9 Ad placeholder — exact reservation

```html
<aside class="ad-slot" aria-label="Reklamní prostor">
  <div class="ad-slot__box"><span>Místo pro reklamu</span></div>
</aside>
```

```css
.ad-slot__box{
  width:300px; height:250px;              /* reserved at every viewport */
  display:grid; place-items:center;
  border:1px dashed var(--border-control);
  background:var(--surface-page);
}
.ad-slot__box span{
  font-family:var(--font-mono); font-size:var(--text-caption);
  letter-spacing:var(--tracking-label); text-transform:uppercase;
  color:var(--text-tertiary);
}
```

The box is fixed 300×250 in both axes, so a later creative replaces the inner node
with zero layout shift. Below 1280 the `.ad-slot` is `margin-inline:auto` in the main
column and the 300×250 never scales. One unit per page, right rail only. No
leaderboard, no in-feed unit, no sticky unit, ever.

### 6.10 Widget module frame

Shared frame for Denní lekce, Víte, že…, Nejbližší akce, Odebírat, Související vydání.

```
── KICKER ──────────────      mono --text-caption, --tracking-kicker, uppercase,
                              --text-tertiary, 1px --border-strong top rule, 12px pad
Body                          per widget
Link →                        mono --text-caption, --accent-primary
```

Padding 16px 0, modules separated by 1px `--border-subtle`, no card fill — the rail is
a column of rules, not a stack of boxes. Only the ad box has a box, which is what
marks it as not editorial.

### 6.11 Week-boundary action

Full width, 64px tall (56 at ≤430), 1px `--border-control`, `--surface-reading`,
padding 0 20px, grid `1fr auto`. Left: mono `--text-caption` `--text-tertiary`
„PŘEDCHOZÍ TÝDEN" over Space Grotesk 600 1.25rem `--text-primary` „Týden 28. 7. –
3. 8. 2026". Right: → 1.25rem `--text-tertiary`.
Hover: `--surface-hover`, border `--accent-primary`, text and arrow `--accent-primary`,
arrow `translateX(4px)` over `var(--dur-fast)`. Focus-visible: 2px `--focus-ring`
offset 2px. It is an `<a href>` to a static page — never a button, never a fetch.

### 6.12 Empty-state line

One sentence, Source Serif 4 `--text-lead`, `--text-secondary`, `max-width: 46ch`,
padding 32px 0, optional accent link on the following line. No icon, no illustration,
no border, no fill.

Strings: `/` no edition → „Dnes nevyšlo vydání." · feed → „Dnes zatím nic nového." ·
`/ai-modely` → „Zatím tu není žádné vydání zaměřené na modely." · `/podcasty` → „Dnes
nevyšla žádná nová epizoda." · `/akce` → „Zatím tu nejsou žádné nadcházející akce." ·
archive end → „Dál už archiv nesahá."

### 6.13 Completion mark

```
════════════════════════════════════   2px --border-strong
              ●                        0.7rem circle, --status-complete
     VYDÁNÍ DOKONČENO                  mono --text-caption, --tracking-kicker,
                                       --text-tertiary
     Máte přehled.                     Space Grotesk 600, 1.75rem, --text-primary
════════════════════════════════════   2px --border-strong
```

Padding 48px 16px, `text-align: center`, `background: var(--surface-reading)`.
The current radial gradient is removed — gradients are banned by the brief and the
mark does not need one on paper. The dot is the only circle in the system.

### 6.14 Footer

Four columns at ≥1024 (brand+description / Číst / Důvěra / Sledovat), two at 768,
one at ≤430. 1px `--border-strong` top rule, 48px top padding, 64px bottom.

- Brand: lockup compact, then description in Source Serif 4 0.9375rem `--text-secondary`, `max-width: 40ch`. **The line „statický build · bez runtime volání modelů" is deleted** — remove `d.footer.staticBuild` from both dictionaries.
- Číst: Radar · Témata · Týdeník · Archiv
- Důvěra: O magazínu · Korekce · Glosář · Zdroje · Atom ↗
- Sledovat: the social row.

Link states: default `--text-secondary`; hover `--accent-primary` + underline;
focus-visible 2px `--focus-ring` offset 2px. Column headings mono `--text-caption`
uppercase `--text-tertiary`.

### 6.15 Social row — linkless placeholders

Facebook, Instagram, Threads, X. Use each platform's official monochrome brand glyph
from its own brand kit, 20×20, `fill: currentColor` — do not redraw them by hand and
do not import an icon library.

```html
<ul class="social-row">
  <li><span class="social-row__item" role="img" aria-label="Facebook">…svg…</span></li>
  …
</ul>
```

```css
.social-row{display:flex;gap:var(--space-2);list-style:none;margin:0;padding:0}
.social-row__item{
  display:grid;place-items:center;
  width:44px;height:44px;                  /* the hit area exists from day one */
  color:var(--text-tertiary);
  border:1px solid transparent;            /* reserved for the future :hover border */
}
```

When real destinations exist, swap `<span role="img">` for `<a href aria-label>` and add
`.social-row__item:hover{color:var(--accent-primary);border-color:var(--border-subtle)}`.
Box metrics do not change, so nothing reflows. Until then the items are not focusable
and expose only their accessible names.

---

## 7. Accessibility

### 7.1 Contrast — every text/surface pair in the system

| Foreground | on `--surface-reading` #ffffff | on `--surface-page` #f7f7f5 | on `--surface-subtle` #efefec | on `--surface-emphasis` #eaf0ff | on `--surface-hover` #f2f2ef |
| --- | --- | --- | --- | --- | --- |
| `--text-primary` #14161a | 18.11 | 16.89 | 15.72 | 15.88 | 16.15 |
| `--text-secondary` #3c4149 | 10.27 | 9.58 | 8.92 | 9.00 | 9.16 |
| `--text-tertiary` #5f6672 | **5.78** | **5.39** | **5.02** | 5.07 | 5.16 |
| `--accent-primary` #2f5ae6 | 5.64 | 5.25 | 4.89 | 4.94 | 5.02 |
| `--accent-primary-hover` #1d43bb | 8.16 | 7.61 | 7.09 | 7.15 | 7.28 |
| `--status-complete` #067a52 | 5.37 | 5.00 | 4.66 | 4.70 | 4.78 |
| `--status-warning` #8a5a0d | 5.92 | 5.52 | 5.14 | 5.19 | 5.28 |
| `--status-correction` #c0272c | 5.89 | 5.49 | 5.11 | 5.16 | 5.25 |

Every pair clears AA 4.5:1, including the metadata floor on its worst surface (5.02:1).
Reversed pairs: `#ffffff` on `--accent-primary` 5.64:1; `#ffffff` on
`--accent-primary-hover` 8.16:1; `#ffffff` on `--text-primary` 18.11:1.
Tinted notice surfaces: `--text-primary` on `--danger-surface` #fdf4f4 16.75:1,
`--status-correction` on it 5.44:1; `--text-primary` on `--sponsor-surface` #fdf7e8
16.94:1, `--status-warning` on it 5.54:1.

Non-text: `--border-control` #8e8e88 reaches 3.29:1 on white and 3.07:1 on page, so the
search field, ad reservation and week action meet 1.4.11. `--border-subtle` (1.30:1)
and `--border-strong` (1.66:1) are decorative grouping only and never carry the sole
meaning of a control or a boundary.

`--selection-background` `rgba(47,90,230,0.18)` over white composites to `#dbe4fb`;
`--text-primary` on it is 14.23:1.

### 7.2 Focus

`:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; border-radius: 0 }`
— unchanged from production except the ring colour. Ring vs adjacent surface is
5.64:1 on reading and 5.25:1 on page, well past the 3:1 minimum. Feed rows use
`outline-offset: -2px` so the ring stays inside the row and does not collide with the
hairline. Nothing in the system removes the outline; the drawer traps focus and
returns it to the menu trigger on close.

### 7.3 Reduced motion

What moves at all: nav/row hover fill (80ms), link colour (150ms), the week-action
arrow nudge (150ms, 4px), the drawer slide (240ms), the 8px page-entry translate
(240ms), and the 2px reading-progress line on article pages.

```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;
    transition-duration:.01ms!important;scroll-behavior:auto!important}
  .enter{transform:none!important;opacity:1!important}
  .drawer{transition:none}
}
```

The status pulse animation is deleted outright with the status record. Colour
transitions survive reduce (they are not motion), but the entry translate, the arrow
nudge and the drawer slide do not. The reading-progress line is a position indicator,
not decoration, and stays.

### 7.4 Other

Touch targets ≥44×44 for every nav item, drawer item, platform link, social slot and
search trigger. Headings run h1 → h2 → h3 with no skips; the feed is a `<ul>` of rows;
day groups use `<h2>`. The anchor row on `/akce` is a `<nav aria-label="Rozsah akcí">`.
Language is `lang="cs"` on `<html>`; external titles in English carry `lang="en"` on
the title element, so screen readers switch voice.

---

## 8. Open Graph and print

### 8.1 OG card — 1200×630, one composition

```
┌──────────────────────────────────────────────────────────────┐ #f7f7f5
│ 64px inset                                                   │
│ ■ DNESKAi                                    9. 8. 2026      │ 9px #2f5ae6 square,
│                                                              │ wordmark 40px 700 #14161a
│ ══════════════════════════════════════════════════════════   │ 2px #14161a, 32px below
│                                                              │
│ Evropská komise odložila nejpřísnější                        │ Space Grotesk 700
│ část AI Actu o rok                                           │ 72px/1.04 #14161a
│                                                              │ max 4 lines; ≥90 chars → 56px
│ Odklad do srpna 2027 se týká povinností…                     │ Source Serif 4 28px/1.4
│                                                              │ #3c4149, max 2 lines
│                                                              │
│ TO PODSTATNÉ Z AI. KAŽDÝ DEN.            ▬▬▬▬▬▬▬▬▬▬▬▬▬       │ mono 22px #5f6672;
└──────────────────────────────────────────────────────────────┘ bar 300×6 #2f5ae6
```

No photograph: heroes are not guaranteed, and one composition that always works beats
two that disagree. No signal, no cost, no source count.

### 8.2 Print

Unchanged: black on white. `app/(print)/print.css` needs only the token remap, since
the light canvas is already close to paper.

- `--surface-*` → `#ffffff`; `--text-primary`/`--text-secondary` → `#000000`; `--text-tertiary` → `#444444`; `--border-*` → `#000000` at 0.5pt.
- `--accent-primary` → `#000000`; links print as black with an underline; outbound URLs are not expanded.
- Removed from print: left rail, top bar, drawer, search, ad box, all right-rail widgets, the feed, the week action, the social row, reading progress.
- Kept: masthead identity, kicker, headline, dek, date · reading minutes, hero image, the three highlight blocks, prose, source ledger, corrections, completion mark.
- Body 12pt minimum, prose measure 35em, `orphans: 3; widows: 3`, and no page break between a heading and its first paragraph or between a correction notice and its text.

---

## 9. Removal map

Every item below leaves reader surfaces entirely — on `/`, the article page, Radar,
Témata, Archiv and O magazínu alike. None of it is redesigned anywhere else.

| Removed | Where it lives today |
| --- | --- |
| Publication-data strip („Údaje o vydání": Datum vydání · Prověřené → citované zdroje · Naměřené náklady · signál) | `components/editorial/PublicationData.tsx`, `.publication-data*` in `app/globals.css`, called from `app/[lang]/page.tsx` and the article page |
| Signal-strength meter and its sparkline | `components/SignalStrength.tsx`, `components/Sparkline.tsx`, `signal_strength` reads in the sidebar, hero meta and `post-card__meta` |
| Publication-status banner and rail record („Vydávání je aktuální" / „…částečně omezené") | `components/Sidebar.tsx` `sidebar-status` block, `lib/public-health.ts` consumers, `dict.health.*` on reader pages |
| „Jak toto vydání vzniklo" provenance block and the making-of module | `components/editorial/Provenance.tsx`, `components/editorial/MakingOf.tsx` |
| Footer line „statický build · bez runtime volání modelů" | `dict.footer.staticBuild`, `components/Footer.tsx` |
| Run cost, model names, candidate counts, agent and build vocabulary in reader copy | `dict.article.measuredCost` / `sourcePath` / `provenance*`, `dict.about.models*`, `dict.colophon.*` |

Kept, because magazines have them: the source ledger („Přehled zdrojů", plain
citations), corrections, the sponsor label, the completion ritual, the glossary and
the Atom feeds. `/health` and `/api/health.json` stay as operator endpoints, unlinked
from the rail and the footer.

Dictionary keys to add (cs): `nav.week` „Poslední týden", `nav.talked` „O čem se
mluví", `nav.models` „AI modely", `nav.podcasts` „Podcasty", `nav.events` „Akce",
`nav.weeklyDigest` „Týdeník", `nav.lessons` „Lekce", `nav.aboutMagazine` „O magazínu",
`events.cz` „Česko", `events.world` „Svět", `events.past` „Proběhlé",
`events.free` „zdarma", `events.online` „online", `week.previous` „Objevit předchozí
týden", `ads.slot` „Místo pro reklamu", `home.todaysEdition` „Dnešní vydání",
`home.noEditionKicker` „Dnes bez vydání", `home.noEditionTitle` „Dnes nevyšlo vydání."

---

## 10. Build order

1. Token swap in `app/globals.css` (§2) plus `lib/og-theme.ts` (§2.6). Everything else renders light immediately, because production already consumes the semantic names.
2. Removal map (§9) — delete before you design on top of it.
3. Shell: right rail, `--rail-width`, the responsive matrix (§3), top bar + drawer (§6.2).
4. Feed row, category chip, widget frame, ad slot, completion mark (§6).
5. New routes: `/tyden`, `/tyden/[week]`, `/o-cem-se-mluvi`, `/ai-modely`, `/podcasty`, `/akce`.
6. Front page recomposition (§4.1–4.3), then the article re-skin (§4.4).
7. Print remap (§8.2), OG composition (§8.1), accessibility pass against §7.1.
