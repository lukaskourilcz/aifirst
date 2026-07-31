---
name: caught-up-brand-system
description: Apply Caught Up's public identity, semantic visual tokens, editorial typography, completion-period mark, bilingual voice, and anti-AI-slop rules. Use for branding, visual design, CSS tokens, navigation identity, metadata, Open Graph composition, UX copy, icons, or any reader-facing style decision.
---

# Caught Up brand system

Read `docs/design/BRAND_SYSTEM.md`, `docs/design/DESIGN_THESIS.md`, and `docs/design/DESIGN_SYSTEM.md` before editing.

## Preserve the identity boundary

- Render the public publication name as **Caught Up** in English and Czech.
- Keep stable repository, package, bot, environment, and compatibility identifiers named `aifirst`.
- Never apply a blind rename.
- Use the vector completion period from `public/brand/completion-mark.svg` through `BrandMark` or `BrandLockup`; do not replace the logo with generated raster media.

## Apply the visual language

- Build calm editorial intelligence: near-black instrument canvas, cool panels,
  blueprint blue, restrained completion mint and correction red; print remains
  black on white.
- Use semantic custom properties from `app/globals.css`; extend them only when an existing role cannot express the need.
- Use Space Grotesk for display/interface hierarchy, Source Serif 4 for reading
  prose and IBM Plex Mono only for dates, identifiers, source IDs or measured
  values.
- Prefer flat composition, hairlines, zero radii, measured reading width and
  purposeful density.
- Keep icons in the existing stroke family and use `currentColor`.
- Limit motion to short CSS orientation/state transitions and respect reduced motion.

## Write in the publication voice

- Use concise, calm, evidence-aware copy.
- Preserve centralized localization in `lib/i18n/`; never inline competing translations.
- Use the established promises and completion messages; keep the brand untranslated.
- Distinguish confirmed fact, company claim, analysis, speculation, and open questions.

## Reject incompatible styling

Do not introduce startup gradients, glass, neon, terminal-first styling, fake interfaces, fake metrics, robots, brains, circuits, generic generated illustration, excessive cards/pills, decorative shadows, or urgency patterns. Do not add dark mode, a component library, a motion library, or remote fonts for novelty.

## Validate

Inspect the real route in English and Czech, check responsive crops and long copy, run the targeted lint/type/browser checks, and update brand/design documentation when a reusable rule changes.
