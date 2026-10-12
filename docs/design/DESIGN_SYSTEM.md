# DNESKAi design system

Current direction: Apple Design refresh, 12 October 2026, requested by the owner.
Reference: [Apple Design skill](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md).

This replaces the flat, zero-radius round-2 appearance. Earlier handoffs under
`docs/redesign/` and `docs/design-review-r2/` describe historical implementations.
The canonical values live in `app/globals.css`.

## Typography

Use the platform system sans-serif for navigation, headings, summaries and
controls. Optical sizing is automatic. Large headings use negative tracking;
small labels use 0.025em and sentence case. The existing `.h-serif` class is a
compatibility name for secondary headings, which now use the system sans.
Long article prose and definitions use the local Iowan/Palatino/Georgia stack
at 19px with 1.7 line-height. System monospace is reserved for dates, source
metadata and code. The app downloads no web fonts.

## Colors and materials

- Page: `--surface-page`, #f5f5f7. Reading: `--surface-reading`, white.
- Subtle: #ececf0. Emphasis: #eaf0ff.
- Text: #14161a, #3c4149, #5f6672. Keep metadata at or above this contrast.
- Grouping borders: #e2e2e7 and #c8c8ce. Control border: #85858c.
- Brand and links: #2f5ae6; hover: #1d43bb.
- Completion: #067a52; warning: #8a5a0d; correction: #c0272c.

`lib/og-theme.ts` mirrors the palette for generated distribution images.
Keep the outlined production logotype and its colors unchanged.

Use white, rounded surfaces to group related content: 12px controls, 16px
images, 24px modules and 28px front-page lead. Keep dense archive rows as rows.
Subtle shadows separate the lead and selected cards. Floating menus and dialogs
use a deeper shadow. Only the sticky masthead uses translucent material;
reading surfaces remain opaque. Do not stack translucent panels.

## Layout and components

The container is 1280px with 40px desktop gutters, 20px below 960px and 16px
below 640px. The grid gutter is 32px, then 20px on narrow screens.

- Masthead: date, original DNESKAi logo and search. The section bar has a
  tinted current item. Its 60px sticky state includes a compact logo and search;
  below 960px the section strip is 56px and scrolls horizontally.
- LeadPackage: title and photograph sit side by side on desktop. Below 960px,
  the title precedes the image. The dek, source count, photo credit and context
  stay below. A missing photograph retains the complete typographic lead.
- Card: row, compact and cover variants retain their data and responsive
  behavior. The `band` compatibility variant puts its headline below the photo.
- DayBriefs, DayWatchlist and WidgetModule: white grouped surfaces; explicit
  section headings and sources. BannerSlot retains its own disclosure and size.
- PageShell, section and list headers: system display headings, generous space,
  readable explanatory copy. Archive and week pages retain dated groups.
- Article: large heading and byline, rounded figure, white reading column,
  highlights, source ledger, corrections, glossary and related articles.
- Completion: a green status dot plus text in a white closing row before
  recirculation. Never imply a human review that did not occur.
- Sources, lessons, glossary, events, streams and trust pages share the same
  type, surfaces and controls. Empty and legacy content remain supported.
- Footer: one white surface with grouped navigation and publication identity.

## Interaction and accessibility

Controls respond on press with a restrained 0.97 scale. Color transitions run
in 150ms; avoid timed locks, scroll effects or decorative looping animation.
Dropdowns originate at their trigger. Page entry is a brief opacity change.
No gesture or animation dependency is required for this reader.

All dialogs render through a portal to `document.body`, outside the filtered
sticky masthead. Preserve focus containment, Escape and focus restoration.
Search includes a labelled close button on every viewport and locks background
scroll. Inputs show a focus ring; navigation and standalone controls provide
44px targets. Inline article links retain normal prose spacing.

Reduced motion removes spatial animation; reduced transparency uses opaque
chrome; increased contrast strengthens borders and text. Keep 320px reflow,
text zoom, Czech wrapping and keyboard operation. Print uses black on white
and removes interactive chrome. Dedicated print routes retain their contract.

## Product boundaries

Keep Git/MDX storage, static reader rendering, Czech root routing, legacy
routes, feeds, JSON, SEO, CSP and BoardlessAI delivery unchanged. No new media,
content generation, reader account, analytics event or runtime service belongs
in this refresh. The page-entry gzip ceiling remains 110 kB.
