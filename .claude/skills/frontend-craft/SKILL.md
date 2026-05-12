---
name: frontend-craft
description: Composable patterns and quality bar for UI work in this repo — component anatomy, accessibility, performance budget, when to reach for client components. Use on every UI change.
---

# Frontend craft

The companion skill to `sci-fi-design-system`. That one defines *what
things look like*; this one defines *how we build them*.

## Component anatomy

Every component lives in `components/<Name>.tsx`. One default export
per file. Props typed inline at the top.

```tsx
type Props = { /* ... */ };

export function Name({ ... }: Props) {
  /* one screen of code, no scroll */
}
```

If a component crosses ~80 lines, split it. The split point is almost
always "this part has its own state" or "this part is reused".

## Server-first, client opt-in

- Default to server components. They have zero JS cost on the client.
- Mark `'use client'` only for genuine interactivity: input handling,
  motion that reads cursor position, anything reading `window` /
  `document` / `localStorage`.
- Never mark a whole page client just to enable one interactive child.
  Lift the boundary down to the child component.

## Styling

- Inline styles via the `style` prop are fine for layout-specific
  values that don't repeat (one-off paddings, grid setups).
- Anything that repeats (colours, type scale, hairlines, shadows) must
  read from a CSS custom property defined in `app/globals.css`.
- No CSS-in-JS runtime libraries. The repo intentionally has none.
- Class names only when there's a real reuse pattern; otherwise inline
  styles are more honest about scope.

## Accessibility — non-negotiable

- Every interactive element keyboard-focusable, focus ring visible.
  The global `:focus-visible` rule handles this — don't suppress it.
- Every `<img>` has a meaningful `alt`. The article illustration takes
  its alt from frontmatter, not a generic string.
- Colour contrast for body text ≥ 7:1 against `--bg-void`.
- Respect `prefers-reduced-motion: reduce` on every animation.
- Never use colour as the only way to convey information.

## Performance budget

- Homepage JS < 80 KB gzipped.
- LCP image: the cover illustration. Mark it `priority` (Next image)
  or preloaded.
- No client-side data fetching for article content — all reads happen
  at build time via `lib/content.ts`.
- Lazy-load heavy decorative effects behind an `IntersectionObserver`.
- Run `pnpm build` after non-trivial UI changes and read the route
  size column. Regressions over +10 KB get pushed back.

## When you add a third-party UI dependency

You probably shouldn't. If you must, justify it in the PR: what would
we write by hand instead, and how big is the lib (gzipped)? Anything
over 5 KB needs an explicit "we use ≥ 3 things from this lib" check.

## Hand-off checklist

Before declaring a UI task done:

- [ ] `pnpm typecheck` clean.
- [ ] `pnpm test` clean.
- [ ] `pnpm build` succeeds and route size hasn't regressed.
- [ ] You read the change in a browser, or you explicitly said "I
      couldn't open a browser in this environment" in your hand-off.
- [ ] No `console.log` left behind.
- [ ] No `eslint-disable` added without a one-line comment explaining
      why.
