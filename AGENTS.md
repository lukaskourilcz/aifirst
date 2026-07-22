# Caught Up agent instructions

Read `CLAUDE.md` before changing this repository; it is the authoritative product, architecture, design, validation, and Git control document. Then load only the relevant project skill under `.claude/skills/`.

## Work rules

- Public brand: Caught Up. Keep stable internal `aifirst` identifiers where compatibility requires them; never run a blind rename.
- Search before creating. Reuse the existing content, locale, feed, topic, Radar, component, CSS-token, modal, icon, and test systems.
- Preserve Git/MDX canonical storage, static reader rendering, legacy MDX/routes, English unprefixed and Czech `/cs`, feeds/JSON/SEO, CSP, optional OwnDashboard, and generation safety.
- Use semantic tokens and calm editorial hierarchy. Never reintroduce terminal/neon/fake-UI styling or generic AI media.
- The Codex MCP server `higgsfield` is expected at `https://mcp.higgsfield.ai/mcp`; inspect its callable tools and schemas in a fresh session before media work. If it is absent, defer only that media subtask without research, waiting, substitutes, or placeholders.
- Validate mobile, Czech, keyboard/focus, reduced motion, empty/legacy/no-image/long states, print, and the 110 kB gzip guard.
- Run focused checks while iterating and `pnpm verify` plus `pnpm e2e` for release-level work. Never claim an unrun check passed.
- Protect user work. Inspect Git before edits, stage deliberately, create coherent checkpoints during large autonomous work, continue after commits, and do not push unless authorized.

Use `/release-check` or `.claude/skills/caught-up-release-validation/SKILL.md` for the complete definition of release evidence.
