# DNESKAi visual QA

Apple Design refresh, 12 October 2026. Tested against the local production
build in Chromium. The current visual contract is `DESIGN_SYSTEM.md`.

## Release checks

- `pnpm verify`: passed. Lint, TypeScript, 311 tests in 32 files, 39 MDX files,
  43 board context files and configuration checks passed.
- Production build: 644 static pages generated.
- Bundle guard: all 31 page entries below 110 kB gzip; maximum 103.4 kB.
- `pnpm e2e --workers=4`: 246 tests passed across desktop, tablet and mobile.
- `git diff --check`: passed.

No dependency, runtime service, media-production path or analytics event was
added. Native font stacks replace the three downloaded web-font families.
Feeds, JSON, canonical/legacy routes, CSP and print checks remain in the suite.

## Responsive and visual review

The additional matrix covered 12 routes at 320, 360, 430, 768, 1024, 1280,
1440 and 1600px: 96 combinations. Each returned HTTP 200, rendered one `h1`
and had no horizontal document overflow.

Routes: `/`, `/tyden`, `/archive`, `/topics`, `/topics/ai-models`, `/sources`,
`/about`, `/lekce`, `/glossary`, `/akce`, the 25 September article and the
legacy 10 May article. The review included missing photographs and long Czech
headlines. Screenshots of the home page, topic, article, archive, about page,
search and navigation drawer were inspected at desktop and mobile widths.
Temporary evidence lives in ignored `audit-screens/apple/`.

The matrix found a missing overflow rule on the lessons table wrapper. The
wrapper now scrolls independently, retains its accessible region name and
keyboard focus, and `/lekce` is included in the smoke route list.

## Keyboard and dialog behavior

The browser suite checks search focus, Tab containment, Escape, focus
restoration, current navigation, the mobile drawer and semantic trust surfaces.
The added regression checks that search renders under `body`, covers the full
viewport despite the filtered header, locks background scrolling, and closes
through its labelled button while restoring focus.

## User preferences and print

- Reduced motion: the page entrance reports `animation-name: none`.
- Reduced transparency: the masthead reports `backdrop-filter: none`.
- Increased contrast: the masthead is white with no backdrop filter.
- 200% root text size: the about page reflows without document overflow.
- Print emulation on an article: masthead hidden, sources retained, no overflow.
  Dedicated print routes also pass the browser suite.

These are Chromium checks; no Safari, Firefox or physical-device result is
claimed.

## Contrast

Computed from the current semantic palette:

| Pair | Ratio |
| --- | --- |
| Metadata against the four opaque surfaces, minimum | 4.91:1 |
| White on the brand accent | 5.64:1 |
| Control border on the page | 3.37:1 |
| Completion text on white | 5.37:1 |

The primary/secondary text colors and status colors are unchanged. The high
contrast preference strengthens grouping borders and secondary text.
