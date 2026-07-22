# Caught Up brand system

Status: canonical direction. Token and component mappings are updated with the
production implementation.

## Positioning

- Brand: **Caught Up** (never translated).
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

The mark is a single blueprint-blue final period. It means the final item in a
briefing, resolved status, and permission to stop. It is deterministic SVG/CSS,
scales from favicon to social composition, and is not a generated raster.

The wordmark uses the exact text `Caught Up` in the editorial serif. The dot is
a separate mark; public prose does not rename the publication to “Caught Up.”
The lockup must remain legible at small sizes, in Czech contexts, and in print.

## Color behavior

- Blueprint blue: identity, links, focus, selected navigation, signal emphasis.
- Ink/carbon: primary text and strong rules.
- Canvas/paper/stone/fog: page, reading, subtle, and structural hierarchy.
- Mint: rare completion/healthy state, always paired with text.
- Editorial rust: corrections and warnings, never a generic accent.

All production use maps through semantic tokens documented in
`DESIGN_SYSTEM.md`; raw palette names remain compatibility aliases only.

## Typography

- Source Serif 4: wordmark, display headlines, editorial section headings,
  lead paragraphs, and completion.
- Inter: body copy, navigation, controls, reference content, captions, and
  tables.
- System mono: dates, issue identifiers, source IDs, cost, and measured values.

Fonts are self-hosted by `next/font`; no runtime font request is introduced.
Both faces include Latin Extended for Czech.

## Visual language

- Finite printed briefing, research dossier, clipping desk, source annotation,
  registration detail, issue filing, and the final period.
- Flat surfaces, hairline rules, controlled crop, low radii, no decorative
  elevation.
- Serious and concise voice; uncertainty and evidence remain explicit.

## Anti-positioning

Never introduce robots, brains, neural webs, circuitry, holograms, blue-purple
gradients, glass, glow, cyberpunk darkness, fake charts, fake UI, mascots,
confetti, generic SaaS copy, or marketing urgency.

