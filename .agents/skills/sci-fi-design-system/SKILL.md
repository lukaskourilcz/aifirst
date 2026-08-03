---
name: sci-fi-design-system
description: Visual design language for the aifirst magazine — colour tokens, type scale, motion, components. Use whenever building UI, styling a page, or making visual decisions.
---

# Sci-fi design system

The magazine should feel like a terminal from a near-future newsroom
crossed with a glossy print cover. Restrained, not cluttered.

## Colour tokens (CSS custom properties)

```css
:root {
  --bg-void: #05070d;          /* page background */
  --bg-deep: #0a0f1f;          /* card / panel background */
  --bg-elev: #121933;          /* elevated surfaces */
  --grid: #1a2240;             /* subtle grid lines */

  --ink-primary: #e8ecff;      /* body text */
  --ink-muted: #8a93b8;        /* metadata */
  --ink-dim: #4c5680;          /* tertiary */

  --accent-cyan: #5cf0ff;      /* primary accent */
  --accent-magenta: #ff4fd8;   /* secondary accent */
  --accent-amber: #ffb547;     /* alerts / highlight runs */

  --hairline: rgba(92,240,255,0.18);
  --glow-cyan: 0 0 24px rgba(92,240,255,0.45);
}
```

Light mode is **not** a goal — this magazine lives in the dark.

## Typography

- Display: `JetBrains Mono` or `Space Grotesk` for headlines (monospaced
  feel, with `font-feature-settings: "ss01","ss02"`).
- Body: `Inter` (variable). Generous line-height (1.65).
- Caps lockup for section labels, letter-spacing `0.18em`.
- Scale (rem): 0.75, 0.875, 1, 1.125, 1.25, 1.5, 2, 2.75, 4, 6.

## Layout

- 12-col grid, max width `1280px`, gutters `24px`.
- Article reading column: `min(72ch, 100% - 48px)`.
- Sticky issue masthead with the date as `YYYY.MM.DD` in mono.

## Signature components

- **CoverFrame** — full-bleed hero with the daily illustration, a thin
  cyan hairline border, corner brackets like a HUD viewfinder.
- **DataStrip** — horizontal ticker under the masthead showing today's
  source count, model used, generation time. Pure decoration but on-brand.
- **ScanlineOverlay** — optional CSS-only scanlines via repeating linear
  gradient at ~6% opacity. Gated behind `prefers-reduced-motion: no-preference`.
- **GlowLink** — links underlined with a 1px cyan rule that bloom on hover.
- **Footnote** — sources rendered as `[01]`, `[02]` superscripts linking to
  a sources block at article end.

## Motion

- Subtle only. Crossfade between articles, 150ms ease-out.
- Cursor-following parallax on the cover image, ±8px max, disabled when
  `prefers-reduced-motion: reduce`.
- Avoid WebGL/canvas unless gated and lazy-loaded.

## Don'ts

- No purple-on-black "cyberpunk" cliché — keep saturation in check.
- No emoji in the UI.
- No gradients that span the whole page; reserve them for accents.
- No skeuomorphic chrome (knobs, switches). This is a magazine, not a
  spaceship dashboard.

## Reference moodboard (words, not images)

> The Verge × Wipe (Alex Garland) × a Bloomberg terminal × the Ghost in
> the Shell opening credits.
