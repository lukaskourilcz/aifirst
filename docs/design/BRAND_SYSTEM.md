# DNESKAi brand system

Status: canonical direction. Token and component mappings are updated with the
production implementation.

## Two names, on purpose

`brand.wordmark` is **DNESKAi** and is what a reader sees: the navigation lockup,
the footer and print. `brand.name` is still **Caught Up** and carries everything a
machine reads or a link previews — page titles, Open Graph and Twitter cards,
`openGraph.siteName`, structured data, the JSON endpoints, the Atom feeds and the
drawn covers, as do the repository, the venture id and the Actions variables.
Moving `name` renames every indexed title and every social card in one commit; that
is the owner's call and it has not been made. Do not "re-align" the two.

## Positioning

- Wordmark: **DNESKAi** (never translated).
- Metadata name: **Caught Up** (never translated).
- English tagline: **The AI stories that actually mattered today.**
- English promise: **One edition and you’re caught up on AI.**
- English support: **Understand what mattered. Skip the noise.**
- English completion: **You’re caught up.**
- Czech tagline: **To podstatné z AI. Každý den.**
- Czech promise: **Jedno vydání a máte přehled.**
- Czech support: **Pochopte, co bylo důležité. Bez šumu.**
- Czech completion: **Máte přehled.**

Stable repository, package, environment, bot, and compatibility identifiers
remain `aifirst`.

## Mark and wordmark

The mark is a compact blueprint-blue completion square. It means the final item
in a briefing, resolved status, and permission to stop. It is deterministic
SVG/CSS, scales from favicon to social composition, and is not a generated
raster.

The wordmark uses the exact text `DNESKAi` in the editorial serif — `BrandMark`
renders `brand.wordmark`, so the lockup follows that field and nothing else. The
dot is a separate mark. The lockup must remain legible at small sizes, in Czech
contexts, and in print.

## Color behavior

- Blueprint blue: identity, links, focus, selected navigation, signal emphasis.
- Near-black and cool charcoal: page, panel, and sunken hierarchy.
- Cool white and gray: primary, reading, support, and metadata text.
- Mint: rare completion/healthy state, always paired with text.
- Amber and red: review warnings and corrections, never generic accents.

All production use maps through semantic tokens documented in
`DESIGN_SYSTEM.md`; raw palette names remain compatibility aliases only.

## Typography

- Space Grotesk: wordmark, display headlines, editorial section headings,
  navigation, controls, and completion.
- Source Serif 4: article prose, deks, definitions, and descriptive card copy.
- IBM Plex Mono: dates, issue identifiers, source IDs, run records, tags,
  captions, prices, and measured values.

Fonts are self-hosted by `next/font`; no runtime font request is introduced.
Both faces include Latin Extended for Czech.

## Visual language

- Finite technical briefing, research dossier, publishing instrument, source
  annotation, issue filing, and the completion mark.
- Flat surfaces, collapsing hairline grids, controlled crops, zero radii, no
  decorative elevation.
- Serious and concise voice; uncertainty and evidence remain explicit.

## Anti-positioning

Never introduce robots, brains, neural webs, circuitry, holograms, gradients,
glass, glow, cyberpunk ornament, fake charts, fake UI, mascots, confetti,
generic SaaS copy, or marketing urgency.
