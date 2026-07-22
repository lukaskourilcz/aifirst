# Caught Up overhaul handoff

Last updated: 2026-07-22

This is the restart document for the next agent. The non-Higgsfield product-design, brand, frontend, responsive/accessibility, validation, documentation, cleanup, and AI-agent-architecture overhaul is complete and pushed on branch `agent/caught-up-design-overhaul`. Do not repeat the redesign or reintroduce the retired visual system.

## Product and architecture state

- Public brand: **Caught Up**. Stable repository, package, bot, user-agent, fallback URL, environment, and other compatibility identifiers remain `aifirst` deliberately.
- Product thesis: calm editorial intelligence with a clear sense of completion.
- Today is a finite issue; Radar is static editorial intelligence; Topics are curated; Weekly has a distinct deterministic cover; Archive/Search/reference surfaces are compact.
- English is unprefixed and Czech uses `/cs`. Compatibility routes, article URLs, print, feeds, public JSON, metadata, sitemap, CSP, and operator gates remain intact.
- Git/MDX remains canonical. There is no reader database, runtime CMS/AI/search service, public account system, or runtime OwnDashboard dependency.
- The generation pipeline, model/config defaults, report-only guardrails, optional illustration default `none`, and optional bounded OwnDashboard callback remain unchanged.

Read `CLAUDE.md` and `AGENTS.md` first. The authoritative design record is under `docs/design/`.

## Completed implementation

- Completion-period SVG and reusable brand lockup across shell, footer, print, icon, Open Graph, and completion state.
- Semantic warm-paper/ink/blue/status tokens, editorial typography, restrained surfaces, focus/motion/print/responsive rules, and shared layout classes.
- Shared issue masthead with date, reading time, source quality/count, Topics, signal, fallback, and no-image behavior.
- Refined Today/article arc: Why it matters, What changed, uncertainty, Briefs, Watchlist, evidence, progressive provenance/corrections, related/adjacent reading, print, and completion.
- Search dialog focus containment, Escape restoration, result announcements, keyboard flow, and responsive behavior.
- Data-first Radar; optional local Topic-cover hook that renders nothing when absent; distinct Weekly cover; compact Archive/Search; refined About/Sources/Glossary/Corrections/Health/promotion/print surfaces.
- Deterministic Open Graph and Weekly composition with no remote or generated-media dependency.
- Expanded Playwright route, locale, overflow, focus, touch-target, reduced-motion, no-image, operator-gate, JSON, feed, CSP, redirect, and print coverage.
- Removed unreferenced legacy UI components and the dead placeholder image; renamed the still-used neutral MDX link away from old visual terminology.
- Rebuilt `.claude` with focused brand, editorial UI, Higgsfield production, accessibility/visual-QA, and release skills; distinct specialist agents; real implementation/QA/release commands; and corrected source/scraper/writer skills.
- Audited every tracked Markdown file, corrected branch/merge status, and aligned route, performance, validation, cost, and historical-audit claims with the final implementation.

## Commits in this overhaul

Use `git log --oneline 9042cf7..HEAD` for the authoritative list. Milestones before the final cleanup commit are:

- `2607eaa` — Document Caught Up design direction
- `f922b8c` — Establish Caught Up design foundations
- `3c545f8` — Complete Caught Up design foundations
- `cb3d4e8` — Refine the publication shell and reading arc
- `7818177` — Refine discovery and trust surfaces
- `ad66e59` — Complete responsive and visual QA coverage
- `8c62d9e` — Rebuild Caught Up agent architecture

The cleanup/handoff commit contains this file and should be read from the branch log rather than hard-coded here.

## Final validation evidence

Executed successfully after cleanup:

- `git diff --check`
- `pnpm verify`
  - ESLint: no warnings/errors
  - TypeScript: clean
  - Vitest: 31 files, 127 tests passed
  - content/config: 8 MDX files plus editorial/Topic config validated
  - Next.js production build: 199 static/SSG route outputs
  - bundle guard: 25 page entries below 110 kB gzip; maximum 103.7 kB
- `pnpm e2e`: 154 passed, 2 intentionally skipped desktop-only layout assertions, 0 failed; responsive audit findings were empty
- Manual production-browser review: Today/article/print, Radar, Topics/detail, Weekly, Archive, Search, About, Sources, Glossary, Corrections, Health; English/Czech; 360/430/768/1024/1440/1600 widths; no document overflow or console/hydration errors
- Search focus, Escape/restoration, reduced motion, no-image state, no-topic-media state, CSP, JSON, feeds, redirects, and operator gates were exercised.

The committed archive contains legacy MDX only. Do not fabricate a schema-v2 issue for appearance; schema-v2 branches are covered by pipeline, validation, persistence, and component logic/tests.

## Higgsfield production handoff

The Higgsfield MCP was unavailable during the overhaul, so no substitute generator, placeholder asset, or fake production media was used. It is now globally registered in Codex as `higgsfield` at `https://mcp.higgsfield.ai/mcp`, and `codex mcp login higgsfield` completed successfully on 2026-07-22. No asset generation has started, and the interface remains complete without these assets.

Restart the Codex CLI/app before continuing because the current session cannot hot-load newly available MCP tools. In the fresh session:

1. Run `codex mcp get higgsfield` and confirm the URL and enabled state.
2. Inspect the callable Higgsfield tools, schemas, models, output formats, and limits; do not infer capabilities from the endpoint alone.
3. Read `.claude/skills/caught-up-higgsfield-production/SKILL.md`, `docs/design/HIGGSFIELD_ART_DIRECTION.md`, and `docs/design/HIGGSFIELD_ASSET_MANIFEST.md`.
4. Inspect the real target component and prepared media hook before generating.
5. Begin with `launch-evidence-key-visual`, produce materially different variants, reject generic/defective output, and only then refine responsive exports.
6. Integrate selected local assets, update actual provenance in the manifest, validate crops/accessibility/performance, and commit only accepted production files.

The queued inventory is:

- launch editorial-evidence key visual: wide, landscape social, square campaign/avatar, vertical story;
- six text-free Topic covers: AI Models, AI Regulation, Open Source, Developer Tools, Research, AI Companies;
- recurring Weekly background/framing system with code-rendered issue text;
- deterministic Open Graph/social background foundation with code-rendered brand/title/date/Topic;
- small paper/registration/signal/photographic texture library;
- conditional About methodology visual, newsletter header, and restrained launch motion with poster/static fallback only if a later opportunity review proves value.

Do not generate a new logo: the completion-period vector is the finished mark. Do not generate fake UI, charts, source logos, contributors, people, metrics, testimonials, or daily filler imagery. Review several real variants, reject defects/generic output, optimize selected local files, validate crops/accessibility/performance, and record actual provenance.

## Concrete external limitations

- OwnDashboard’s external repository, receiver, credentials, and control plane are not present; only the optional Caught Up callback contract can exist here.
- The Next.js 15/React shared runtime is approximately 102 kB gzip; the enforced and passing page-entry limit is 110 kB. Do not revive the obsolete 80 kB total claim without an intentional framework/read-architecture change.
- Operator deployment credentials and budget decisions remain in `NEEDED.md`; do not invent or commit them.

The next planned continuation is Higgsfield production. Operator integration remains separate and optional.
