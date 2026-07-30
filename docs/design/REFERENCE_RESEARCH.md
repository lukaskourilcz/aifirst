# Caught Up reference research

Research date: 2026-07-22. References were inspected in the browser as design
evidence, not as templates to reproduce.

Status: historical discovery record. The proposed Caught Up adaptations below
describe the July 22 light-system overhaul and were superseded by the canonical
instrument-panel contract on 2026-07-30. Use `DESIGN_THESIS.md`,
`BRAND_SYSTEM.md`, `DESIGN_SYSTEM.md`, and `../REDESIGN.md` for current
production direction.

## Selected references

| Source | Category | Problem solved | Transferable principle | Do not copy | Caught Up adaptation | Accessibility and responsive note |
| --- | --- | --- | --- | --- | --- | --- |
| [Refero Styles index](https://styles.refero.design/) | Design-system discovery | Makes visual systems comparable through color, type, spacing, and guidance | Record the reason behind a token, not only its value | Dark gallery shell, search hero, or site composition | Keep the repository’s design rules searchable and role-based | Token names must retain semantic meaning outside color perception |
| [Structured on Refero](https://styles.refero.design/style/6c0b77d3-71f9-469d-98aa-4ce1d6d76ac8) | Editorial typography and flat surfaces | Establishes authority with display serif, neutral utility type, warm paper, rules, and almost no effects | Let typography and hard section changes create hierarchy instead of shadow | Extreme display scale, finance imagery, black-room alternation, custom trade dress | Use Source Serif 4 at restrained publication scale, Inter for utility, warm reading paper, and blueprint blue as the one identity accent | Clamp headings, preserve 320px reflow, and keep body sizes/line lengths readable |
| [Moving Parts on Refero](https://styles.refero.design/style/fb459c9d-c089-4d0b-b5b0-d147b1c4ebd7) | Blueprint/editorial material language | Connects technical subject matter to printed and physical artifacts | Technical character can come from material and annotation, not terminal chrome | Exact palette, geometry, or brand-specific motifs | Registration details, signal rules, and evidence annotations support the completion-dot system | Decorations remain hidden from assistive technology and never carry meaning alone |
| [Steep on Refero](https://styles.refero.design/style/75fdb89f-ca64-41b3-af36-7a78bd09448e) | Serif data presentation | Blends warm editorial type with compact comparative information | Dense data can retain publication voice | Analytics-product layout or exact chart language | Radar uses ranked text, compact CSS bars, and serif section hierarchy | Every bar includes a textual value and order remains logical without CSS |
| [Collect UI Blog](https://collectui.com/designs/blog-ui-design-inspiration) | Editorial indexes and cards | Shows many approaches to story hierarchy, image proportion, and issue grouping | Use image prominence selectively; keep headline/date hierarchy consistent | Screenshot compositions, creator imagery, gallery chrome, or tile-for-tile layouts | Today avoids card grids; recent reading uses compact rows/crops; Weekly receives the stronger cover treatment | Reorder into one column on mobile without hiding dates or story context |
| [Collect UI Sidebar](https://collectui.com/designs/sidebar-ui-design-inspiration) | Navigation | Compares narrow rails, labels, grouped utilities, and responsive transformations | Keep primary destinations persistent and secondary utilities visibly separated | Dashboard rails, icon-only navigation, or excessive nested menus | Desktop keeps six labeled destinations; mobile becomes a compact top shell with an accessible horizontal primary row | 44px targets, visible current state, scrollable row with no content loss |
| [Collect UI Search](https://collectui.com/designs/search-ui-design-inspiration) | Retrieval and command palettes | Demonstrates query focus, result hierarchy, empty states, and modal framing | Search should provide immediate orientation and return focus cleanly | Runtime search services, opaque ranking, or keyboard-only discoverability | Preserve the static index; show date, title, topics, and a calm empty state | Focus trap, Escape, trigger restoration, visible labels, and mobile-safe dialog height |
| [Collect UI Table](https://collectui.com/designs/table-ui-design-inspiration) | Evidence and reference data | Shows compact scanning patterns for multi-column information | Labels, alignment, and row rhythm matter more than decorative containers | Dense enterprise-dashboard chrome | Source ledger and Radar use semantic tables/rows only where comparison benefits | Correct headers, focused scroll regions, and no information encoded by color alone |
| [Collect UI Empty States](https://collectui.com/designs/empty-states-ui-design-inspiration) | No-data states | Compares explanatory copy and recovery actions | Empty states should explain the system state without fabricating activity | Mascots, jokes, fake content, or marketing illustration | Use factual publication, topic, weekly, search, and health messages with one relevant action | Announce dynamic search status and keep recovery controls keyboard reachable |
| [Collect UI Mobile Menu](https://collectui.com/designs/mobile-menu-ui-design-inspiration) | Responsive navigation | Demonstrates space tradeoffs for many destinations | Preserve labels and avoid squeezing six equal bottom-navigation items | App-like bottom chrome and hamburger-only desktop patterns | Compact brand/actions row plus horizontally scrollable labeled primary destinations | Maintain source order, visible focus, and scroll position without trapping gestures |
| [Collect UI Typography](https://collectui.com/designs/typography-ui-design-inspiration) | Editorial rhythm | Compares display/body roles and metadata scales | A small intentional type palette is more recognizable than many styles | Exact specimens or font-specific trade dress | Source Serif 4 + Inter + system mono, with date/issue numerals as a recurring signature | Latin-ext/Czech coverage, `font-display: swap`, and robust fallbacks |

## Adopted principles

- Typography, rules, and density carry identity before imagery.
- Warm paper and cool structural surfaces create depth without elevation.
- Serif editorial voice and neutral utility type must have separate jobs.
- Navigation labels remain visible; search is discoverable but secondary.
- Tables, timelines, and bars should be real-data views with textual
  equivalents.
- Empty and completion states should reduce anxiety, not stimulate more use.
- Media belongs to cover, topic, and campaign contexts rather than every block.

## Rejected patterns

- Dark-only terminal aesthetics, neon accents, scanlines, parallax, and glow.
- Giant marketing heroes and signup-first homepages.
- Bento grids, glass panels, dashboard KPI cards, and pill-heavy controls.
- Image-heavy archive grids or generated fake interfaces.
- Exact layouts, icon sets, copy, screenshots, or brand trade dress from any
  reference.
