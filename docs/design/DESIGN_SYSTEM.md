# Caught Up design system

Status: implemented foundation, 2026-07-22

This document describes the production system in `app/globals.css`, the shared shell components, and deterministic brand assets. It is not a gallery of aspirational components.

## Principles

The interface expresses calm editorial intelligence and a finite reading arc. It uses hierarchy, evidence, rhythm, and real publication data instead of decorative dashboards or card stacks. The visual endpoint is the completion period: a small blueprint-blue signal at the brand level and a resolved green state at the end of an edition.

## Color roles

Production components should use semantic roles:

- `--surface-page`, `--surface-reading`, `--surface-subtle`, and `--surface-emphasis`
- `--text-primary`, `--text-secondary`, and `--text-tertiary`
- `--border-subtle` and `--border-strong`
- `--accent-primary` and `--accent-primary-hover`
- `--status-complete`, `--status-warning`, and `--status-correction`
- `--focus-ring` and `--selection-background`

Raw palette variables remain as compatibility aliases while existing routes are migrated. New production patterns must not introduce repeated literal colors. Caught Up is light-first; there is no decorative dark mode.

## Typography

Source Serif 4 is self-hosted through `next/font` and used for editorial headlines, the wordmark, and selected completion moments. Inter is self-hosted for body copy, navigation, controls, tables, and reference content. The system monospace stack is reserved for identifiers, dates, technical metadata, source IDs, and measured values.

The fluid type scale runs from `--text-caption` to `--text-display`. Reading copy stays near 68 characters per line and uses a relaxed 1.68–1.72 line height. Monospace is never the dominant headline language.

## Spacing and layout

The spacing scale uses quarter-rem through six-rem steps (`--space-1` through `--space-9`). Shared gaps derive from that scale. The main container is 1280px, the desktop navigation rail is 188px, and the reading measure is 68ch. Mobile gutters are fluid and never collapse below one rem.

Desktop uses a narrow persistent editorial rail and flexible content column. Below 900px the rail becomes a compact top header with a horizontally scrollable primary navigation. Reading pages use generous vertical rhythm; archive, search, Radar, Sources, and reference routes use denser rows.

## Surfaces, borders, and shapes

Page canvas, reading paper, subtle stone, and emphasis blue define the surface hierarchy. Hairlines carry most grouping. Strong rules mark mastheads, evidence, corrections, and completion. Radii are restrained (2–12px); pills are reserved for compact tags. Shadows, glass, glow, and nested rounded cards are not part of the system.

## Brand and icons

`BrandMark` and `BrandLockup` are the shared public brand components. `public/brand/completion-mark.svg` and `app/icon.svg` use the same deterministic geometry: a registration corner and blueprint-blue completion period. The readable name remains `Caught Up` without a punctuation rename.

Navigation uses one 16px, 1.5px-stroke, `currentColor` icon family. Decorative icons are hidden from assistive technology. Icons do not decorate every heading.

## Editorial modules and state

Existing domain components remain authoritative: Editorial Highlights, Briefs, Watchlist, Source Ledger, Provenance, Corrections, Sponsorship, Topics, Issue Navigation, Feed Actions, and completion. Legacy MDX may omit schema-v2 modules without fabricated filler. Strong boundary colors are reserved for evidence, corrections, sponsorship, warning, and completion states.

## Focus, motion, and interaction

All interactive controls use a three-pixel blueprint focus ring with visible offset. Minimum primary navigation targets are 44px. Selection uses a low-opacity blueprint wash.

Motion is limited to short native CSS transitions and a four-pixel page-entry translation when reduced motion is not requested. Reading progress uses a fixed three-pixel line. No motion framework, parallax, infinite decoration, or animated gradient is used. `prefers-reduced-motion` removes non-essential animation.

## Media and generated assets

Authentic UI is always rendered from production code and data. Article images keep intrinsic geometry and local/static delivery. Higgsfield assets are deferred until its MCP is available; missing generated media renders as no media, never as a fake placeholder. Future assets must be optional, locally committed, intrinsically sized, responsive, and accompanied by an explicit accessible-text classification.

## Responsive and print rules

Layouts must reflow at 320/360, 430, 768, 1024, 1280–1440, and 1600+ widths without hiding editorial information. Wide evidence tables use labelled horizontal scroll containers. Long Czech headings and source titles must wrap without forcing page overflow.

Print removes navigation, interactive controls, progress, feeds, and operator UI; preserves publication identity, article hierarchy, sources, provenance where useful, and corrections; and avoids splitting critical headings or notices from their content.

## Extension rule

Search before creating. Reuse or extend existing components and tokens first. A new pattern is justified only when it represents a recurring semantic need, has responsive and accessibility behavior, and does not compete with an existing abstraction.
