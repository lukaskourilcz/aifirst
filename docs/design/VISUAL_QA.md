# DNESKAi visual QA

Status: light newsroom redesign, 2026-08-09.

This is the evidence record for the shipped interface. It is not a screenshot
baseline: temporary captures, traces and Playwright output stay ignored and are
never production assets.

## Responsive matrix

Measured against the production build in Chromium, eight widths by eight
routes, sixty-four combinations. Each cell records horizontal overflow, which
navigation surface is present, whether the right rail is in the layout, the
count of level-one headings, and the number of touch targets under 44px.

| Width | Left rail | Top bar | Right rail | Overflow | `h1` | Targets under 44px |
| --- | --- | --- | --- | --- | --- | --- |
| 320 | hidden | yes | reflowed into main | 0 | 1 | 0 |
| 360 | hidden | yes | reflowed into main | 0 | 1 | 0 |
| 430 | hidden | yes | reflowed into main | 0 | 1 | 0 |
| 768 | hidden | yes | reflowed into main | 0 | 1 | 0 |
| 820 | hidden | yes | reflowed into main | 0 | 1 | 0 |
| 1024 | yes | hidden | reflowed into main | 0 | 1 | 0 |
| 1280 | yes | hidden | own column | 0 | 1 | 0 |
| 1600 | yes | hidden | own column | 0 | 1 | 0 |

Routes covered: `/`, `/tyden`, `/akce`, `/podcasty`, `/o-cem-se-mluvi`,
`/ai-modely`, `/about` and an article page. `/about` has no right rail by
design; every other route carries one.

Two defects the matrix found and this release fixed:

- The mobile top-bar wordmark was a 20px touch target at every width below 960.
  It is a link home, so it now takes the same 44px minimum as the menu and
  search triggers beside it.
- The social row is 200px of 44px targets and overflowed its footer column by
  35px at 1280. The column is sized for it and the row wraps as a safety net.

The secondary rail group is 36px by design (spec §5) and is deliberately
excluded from the 44px rule: it is a pointer surface only, because below 960 the
rail is replaced by the drawer, whose items are 48px and 56px.

## Contrast

Verified by computation against the tokens as they exist in
`app/globals.css`, not against the spec table. All forty text/surface pairs
clear AA 4.5:1. The metadata floor `#5f6672` holds 5.02:1 on its worst surface
(`--surface-subtle`). `--border-control` reaches 3.29:1 on the reading surface
and 3.07:1 on the page, so the search field, ad reservation and week action meet
1.4.11. Reversed and tinted pairs clear as well: white on accent 5.64:1, the
correction colour on its danger surface 5.44:1, the warning colour on the
sponsor surface 5.54:1.

## Keyboard and semantics

- The skip link moves focus to `#main-content`.
- The rail marks the active section with `aria-current="page"`. This release
  fixed a defect where no rail item was ever marked current on any non-home
  route, because only the home href accounted for the `/cs` prefix the router
  reports.
- The mobile drawer traps focus, moves focus to its close button, closes on
  Escape, restores focus to the menu trigger, and locks body scroll while open.
- Headings run without skips and every route has exactly one `h1`.
- `/akce` uses a labelled `nav` for its scope anchors and works with zero
  JavaScript.
- Outbound links carry `rel="noopener noreferrer"` and a screen-reader note
  that they open a new window. English stream titles carry `lang="en"`.
- The social row exposes accessible names and is deliberately not focusable
  while the accounts do not exist.

## States inspected

No-edition day, empty streams, empty events, an uncategorised edition, a legacy
edition with no highlights block, an edition with no hero photo, and the
archive-exhausted end of the week chain. Each renders one honest sentence rather
than a skeleton, a badge or a placeholder row.

## Motion

Colour transitions survive `prefers-reduced-motion: reduce`, because they are
not motion. The drawer slide, the entry translate and the week-action arrow
nudge do not. The status pulse was deleted with the status record.

## Known and accepted

- Three published editions and one dataset entry carry an em-dash in their own
  prose. Editions and dataset entries are immutable; the rule is enforced going
  forward in the upstream writer prompt.
- The `2026-08-08` edition renders with no body. Its delivered MDX wraps the
  whole body in a JSX expression. This is a content defect filed for the owner,
  not a layout defect.
