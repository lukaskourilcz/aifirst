---
name: motion-design
description: Motion vocabulary for the magazine — durations, easings, what should move and what shouldn't. Use when adding animation, transitions, or scroll-driven effects.
---

# Motion design

Motion should feel like a heads-up display, not a website. Restrained,
purposeful, fast enough to be invisible.

## Vocabulary

| token | value | when |
|---|---|---|
| `dur-instant` | 80ms | hover state acknowledgement |
| `dur-fast` | 150ms | most transitions |
| `dur-medium` | 240ms | page-level crossfade |
| `dur-slow` | 480ms | once-per-session entrance |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | default |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | sustained moves |

Defined in `app/globals.css`:

```css
:root {
  --dur-instant: 80ms;
  --dur-fast: 150ms;
  --dur-medium: 240ms;
  --dur-slow: 480ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

## What moves

- **Links**: colour + text-shadow on hover, `dur-fast ease-out`.
- **Buttons / nav**: same.
- **Cover image**: subtle parallax on mouse-move, ±8px, only at viewport
  widths > 900px and only when `prefers-reduced-motion: no-preference`.
- **Article entrance**: 12px upward translate + opacity 0 → 1, staggered
  by 60ms across hero / dek / first paragraph. Once per visit.
- **Scanlines**: static. Never animated. (They animate themselves in
  your eye — don't help.)

## What does not move

- The masthead. It's an anchor, not a stage.
- Headings. Letter-by-letter type-on effects are banned.
- The page background.
- Anything more than 24px in a single transition.

## Reduced motion

Wrap every animation in a query:

```css
@media (prefers-reduced-motion: no-preference) {
  .thing { transition: transform var(--dur-fast) var(--ease-out); }
}
```

Or in JS:

```ts
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduced) return;
```

Reduced-motion users should still get the same final state, just
without the motion in between.

## Don'ts

- No parallax on text.
- No spinning loaders. Use a 1px cyan progress bar in the masthead
  underline instead.
- No `transition: all`. Always list the properties.
- No GSAP / framer-motion. The transitions in this repo are small
  enough to do with CSS.
