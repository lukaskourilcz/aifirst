# DNESKAi brand system

Status: canonical direction. Token and component mappings are updated with the
production implementation.

## Two names, on purpose

`brand.wordmark` is **DNESKAi** and is what a reader sees: the navigation lockup,
the footer and print. `brand.name` is **DNESKAi** too, and carries everything a
machine reads or a link previews — page titles, Open Graph and Twitter cards,
`openGraph.siteName`, structured data, the JSON endpoints, the Atom feeds and the
drawn covers, as do the repository, the venture id and the Actions variables.
Moving `name` renames every indexed title and every social card in one commit; that
is the owner's call and it has not been made. Do not "re-align" the two.

## Positioning

- Wordmark: **DNESKAi** (never translated).
- Metadata name: **DNESKAi** (never translated). `brand.legalName` stays Caught Up.
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

## Logotype

The logotype is the word DNESKAi in Poppins Black, converted to outlines. DNESK
is blueprint blue, Ai a deeper blue, and the A tucks under the leg of the K;
their overlap takes a third, darkest shade. The i is scaled to 85 % so its dot
ends at cap height. The production files in `public/brand/` carry the text as
paths: use them as they are, never redraw the logotype or set the name in a font.
Poppins is not a web font here and does not need to be added.

| File | Use |
| --- | --- |
| `DNESKAi-logo.svg` | white or paper surfaces (`#ffffff`, `#f7f7f5`) |
| `DNESKAi-logo-dark.svg` | `#14161A` surfaces |
| `DNESKAi-logo-mono-white.svg` | solid blue or a photograph |
| `DNESKAi-logo-mono-black.svg` | one-colour print |

Colours on light surfaces: DNESK `#2f5ae6`, Ai `#1a3ab0`, overlap `#10266f`. On
`#14161A`: DNESK `#4d6ff0`, Ai `#9db2ff`, overlap `#d2dcff`. The mono versions
are `#14161A` or `#ffffff` with no overlap shade; the K and A join in one colour.

- Keep the proportions. The viewBox is `50 -708 4217.8 708`, about 5.96 : 1.
- Clear space on every side equals the height of the dot over the i, about 27 %
  of the logotype's height.
- Minimum height is 16 px; below that, use the square mark.
- Navigation: 20 px on desktop, 18 px on mobile. Footer and other compact
  places: 16 to 18 px. Print uses the black mono version at 16 px.
- Never recolour it, add shadows or gradients, resize the Ai, or set the name in
  a font.

`BrandLockup` renders the logotype from `brand.assets` in `lib/brand.ts`, with
`alt="DNESKAi"`. Its `tone` prop picks the light, dark or print file. Open Graph
images embed the same SVG through `lib/og-logo.ts`.

## Square mark

`DNESKAi-square.svg` sets DNES / KAi on two lines, white on `#14161A`, with a
blueprint-blue block cursor under ES. It is the favicon (`app/icon.svg`), the
Apple touch icon (`app/apple-icon.png`, 180 px), `public/favicon-32.png`, app
icons, social avatars and any other square format. PNGs at 512, 180 and 32 px
live in `public/brand/png/`.

Production files never crop it to a circle; the platform does that for avatars.
The blinking `DNESKAi-square-blink.svg` is only for SVG inlined on the web.
Favicons and avatars use the static version.

## Color behavior

- Blueprint blue `#2f5ae6`: identity, links, focus, active navigation, kickers.
- Near-black and cool charcoal: page, panel, and sunken hierarchy.
- Cool white and gray: primary, reading, support, and metadata text.
- Mint: rare completion/healthy state, always paired with text.
- Amber and red: review warnings and corrections, never generic accents.

All production use maps through semantic tokens documented in
`DESIGN_SYSTEM.md`; raw palette names remain compatibility aliases only.

## Typography

- Space Grotesk: display headlines, editorial section headings,
  navigation, controls, and completion.
- Source Serif 4: article prose, deks, definitions, and descriptive card copy.
- IBM Plex Mono: dates, issue identifiers, source IDs, run records, tags,
  captions, prices, and measured values.

Fonts are self-hosted by `next/font`; no runtime font request is introduced.
Both faces include Latin Extended for Czech.

## Visual language

- Finite edition, magazine on paper, evidence kept visible, source
  annotation, issue filing, and the completion state.
- Flat surfaces, collapsing hairline grids, controlled crops, zero radii, no
  decorative elevation.
- Serious and concise voice; uncertainty and evidence remain explicit.

## Anti-positioning

Never introduce robots, brains, neural webs, circuitry, holograms, gradients,
glass, glow, cyberpunk ornament, fake charts, fake UI, mascots, confetti,
generic SaaS copy, or marketing urgency.
