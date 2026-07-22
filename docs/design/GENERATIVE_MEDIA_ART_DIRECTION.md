# Generative media art direction

## Provider readiness

No generated-media platform is selected and no substitute image service or
placeholder raster asset was used. The interface already provides deterministic
layout hooks so approved media can be added without changing editorial data or
route behavior.

Before choosing a production path, research current commercially usable
free-tier, open-source/local, and low-cost providers from official pricing,
license/model-card, and privacy sources. Inspect the selected provider's actual
tools, controls, output formats, quotas, and limits before generation. The art
direction and QA contract apply unchanged to every provider.

## Opportunity audit

| Opportunity | Decision | Reason |
| --- | --- | --- |
| Completion-dot logo and favicon | Inappropriate for raster generation | Must be deterministic, scalable vector geometry |
| Wordmark | Inappropriate | Typography must remain exact and accessible |
| Launch key visual | High value | Useful for About, repository, and social launch communication |
| Topic covers | High value if restrained | Can make six curated dossiers recognizable without changing article meaning |
| Weekly cover foundation | High value | Supports a distinct recurring edition with code-rendered text |
| Open Graph background | Potentially useful | Only if locally committed and titles/dates stay deterministic |
| Paper/registration crop library | Potentially useful | Small reusable texture set can add identity sparingly |
| About methodology visual | Potentially useful | Accept only if it explains editorial evidence handling |
| Radar illustration | Unnecessary | Real ranked data is more honest and useful |
| Article fallback imagery | Harmful | Generic images would imply relevance that is not present |
| Empty-state imagery | Usually unnecessary | Factual copy is calmer and lighter |
| Generated UI/screenshots/charts/logos | Inappropriate | Violates authentic-UI and evidence requirements |
| Full-site or article video backgrounds | Harmful | Distracts from reading and increases weight/motion |

## Editorial Evidence Collage

Subject matter: technical papers, folded newsprint, research notes, physical
chips and boards, cables, optical glass, registration marks, contact sheets,
index tabs, scanner texture, and infrastructural technology. Screens may appear
only obliquely and without legible fake UI.

Composition: top-down arrangements, tight macro crops, asymmetric still life,
clear focal point, modular cropping, and reserved text-safe space. The image
should feel art-directed from physical evidence, not “AI-generated.”

Lighting: controlled studio daylight, cool neutral whites, clean shadows, and
occasional warm material contrast. Blueprint blue appears as a physical printed
or material accent.

Color: ink, off-white, slate, blueprint blue, rare mint, and contextual rust.

Avoid: people unless documentary context is essential; hands and faces;
watermarks; logos; legible generated text; fake labels; fake interfaces;
robots; brains; circuit backgrounds; neon; purple glow; holograms; plastic CGI;
heavy grunge; crime-board clichés.

## Integration contract for any provider

- Assets remain local static files; no runtime generation-provider dependency is added.
- Actual brand, title, date, topic, and CTA text remains HTML or deterministic
  SVG.
- Product UI remains authentic; generated dashboards, charts, logos, and
  screenshots are prohibited.
- Topic and Weekly components may expose media slots, but render complete
  text-first layouts when no approved asset exists.
- Accepted media will need responsive crops, intrinsic dimensions, local
  AVIF/WebP export, useful or empty alt according to meaning, lazy loading,
  mobile review, reduced-motion/static fallback, and recorded provenance.
- The queued deliverable inventory belongs in
  `GENERATED_MEDIA_ASSET_MANIFEST.md`; it must not claim that files were
  generated until actual outputs are reviewed and selected.

## Provider-selection contract

- Search current official provider, pricing, license and privacy pages; do not
  rely on remembered free tiers or aggregator summaries.
- Compare at least three real candidates, including an open-source/local option
  when the available hardware and license make it practical.
- Reject unclear commercial rights, mandatory public galleries, training reuse
  that conflicts with project privacy, unavoidable watermarks, unusable export
  resolution, or hidden subscription/card requirements.
- Prefer free/no-card first, then the lowest predictable cost per accepted
  image. Never purchase or start a trial with auto-renewal without explicit
  operator authority.
- A manual web generator is acceptable when it offers original downloads and
  clear commercial rights; use the documented prompts and record that the user
  supplied the raw outputs. Do not use screenshots.
- Selected files must still be local, optimized and provider-independent at
  runtime. All important UI and text remain deterministic code.
