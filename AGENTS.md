# Caught Up agent instructions

Read `CLAUDE.md` before changing this repository; it is the authoritative product, architecture, design, validation, and Git control document. Then load only the relevant project skill under `.claude/skills/`.

## Work rules

- Public brand: Caught Up. Keep stable internal `aifirst` identifiers where compatibility requires them; never run a blind rename.
- Search before creating. Reuse the existing content, locale, feed, topic, Radar, component, CSS-token, modal, icon, and test systems.
- Preserve Git/MDX canonical storage, static reader rendering, legacy MDX/routes, English unprefixed and Czech `/cs`, feeds/JSON/SEO, CSP, optional OwnDashboard, and generation safety.
- Use semantic tokens and calm editorial hierarchy. Never reintroduce terminal/neon/fake-UI styling or generic AI media.
- Higgsfield remains the first media-provider check, but its trial currently blocks MCP generation. Before deferring media, search current official sources for at least three free-tier, open-source/local, or low-cost image generators; compare commercial rights, privacy, watermarks, output quality, aspect ratios, resolution, limits, and real cost. Use an alternative only when it preserves the Caught Up art direction and authentic-UI rules; never create a fake placeholder or purchase a plan without explicit authority.
- Validate mobile, Czech, keyboard/focus, reduced motion, empty/legacy/no-image/long states, print, and the 110 kB gzip guard.
- Run focused checks while iterating and `pnpm verify` plus `pnpm e2e` for release-level work. Never claim an unrun check passed.
- Protect user work. Inspect Git before edits, stage deliberately, create coherent checkpoints during large autonomous work, continue after commits, and do not push unless authorized.

Use `/release-check` or `.claude/skills/caught-up-release-validation/SKILL.md` for the complete definition of release evidence.
