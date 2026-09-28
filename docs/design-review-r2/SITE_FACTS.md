# DNESKAi: facts for design review, round 2 (as of 28. 9. 2026)

Repo `lukaskourilcz/aifirst` (branch `main`), live at https://caughtup-ai.vercel.app. The screenshots in `screens/` are the production build of `main` at 1440 px and 390 px. The round 1 audit and what was done with it are in `docs/audit-2026-09/` (see `IMPLEMENTATION_NOTES.md` there).

## What the product is

A Czech daily publication about AI and technology. A language model writes each edition upstream (BoardlessAI) from 7–8 cited sources. It is published without human review, and the site says so on every edition. Readers: Czech developers, founders, product and tech leads, AI practitioners and informed professionals. Tagline: „To podstatné z AI. Každý den.“ The logo (`public/brand/DNESKAi-logo*.svg`) and the name DNESKAi are fixed.

Stack: Next.js 15 App Router, all pages static, server components, a single hand-written `app/globals.css` (no Tailwind, no component, chart or motion library). Page JS budget: 110 kB gzip; today's largest page is 103.4 kB. CSP allows images from the site's own origin only.

## Current structure after round 1

Rail (desktop sidebar, a drawer below 960 px):
- Indexed: 01 Dnes (`/`), 02 Poslední týden (`/tyden`), 03 Témata (`/topics`), 04 Archiv (`/archive`)
- Secondary: Slovník (`/lekce`), Zdroje (`/sources`), Opravy (`/corrections`), O magazínu (`/about`)
- Search is a ⌘K palette.

Built but not in the navigation: `/o-cem-se-mluvi` (79 synced posts from outside), `/podcasty` (9 episodes), `/akce` (events, now synced), `/ai-modely` (1 edition), `/weekly` (dormant since May, noindex), `/glossary`.

Topics (`config/topics.yml`, 7 of them), with edition counts: AI modely 34, AI firmy 20, Výzkum 15, Regulace AI 12, AI na platformách 7, Open source 5, Nástroje pro vývojáře 5.

The typography and tokens are paper canvas `#f7f7f5`, white reading surfaces, blueprint blue `#2f5ae6`, Space Grotesk for display and UI, Source Serif 4 for prose, IBM Plex Mono for kickers and metadata, radius 0, and 1 px hairlines. One light theme.

## The content an edition carries (measured over August–September)

Per edition:
- 1 lead article: headline, dek, „Proč na tom záleží / Co se změnilo / Co zůstává nejisté“, body of about 900 words, 7–8 sources with an evidence class
- 4 Briefs („Krátce“): a title, a 2–3 sentence body, a topic and a source URL (118 of 122 have a URL)
- 6 Watchlist items („Ke sledování“): English title, URL and feed name, with no summary
- optional: corrections, glossary terms, sponsor, a „practical“ box in the rail
- **images: 1 hero (21:9) and 1 thumbnail**. Of the 30 recent editions, 22 have a licensed photo (Pexels, credited) and 8 have a drawn SVG plate. Briefs and Watchlist items have **no image at all**. Only 8 source og:images are cached locally.

Cadence so far: May 4 editions, June 2, July 2, August 21, September 10. Weekends have no edition. There is one edition per date.

Tags since August (top): umělá inteligence 25, kybernetická bezpečnost 11, OpenAI 11, regulace 5, datová centra 4, open source 4, AI agenti 3, Meta 3, Anthropic 3, Google Gemini 2, Microsoft 2, robotika 2, Nvidia 2.

## Hard constraints that come from the pipeline, not from taste

1. **Images must be real, licensed, and hosted locally.** Upstream (BoardlessAI) chooses and credits them; the site never generates imagery, hotlinks or uses stock filler. „More pictures“ therefore means **the design specifies image slots and ratios, and upstream must then deliver an image for each**. A design that needs a picture for every Brief creates an upstream requirement; list it explicitly.
2. **Several articles a day is a contract change.** Today the delivery contract stores `content/articles/<date>.cs.mdx`, one board record per date, keyed by date. Publishing 1–3 articles a day needs a new article identity (slug plus time), probably a publish time, a section and a priority/lead flag, and changes both upstream and in `lib/delivery/`. The design should say exactly which fields it needs.
3. **Provenance stays visible:** the source ledger, corrections, the one-line statement that a language model wrote the text without human review, and sponsor labelling.
4. **No fake data:** no invented view counts, trending numbers, author photos, bylines of people who did not write the piece, or comment counts. The byline is the publication.
5. Accessibility floor: WCAG AA contrast (lightest text `#5f6672`), 44 px touch targets, visible focus, `prefers-reduced-motion`, and one `h1` per page. Czech wraps long; test with real headlines of 70–110 characters.
