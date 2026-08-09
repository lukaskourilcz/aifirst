# Kickoff prompt for Claude Opus (Claude Code)

Paste everything below the line into a Claude Code session running on **Opus,
Max effort, with BOTH repositories attached**: `lukaskourilcz/aifirst` and
`lukaskourilcz/quorum`.

---

You are implementing the DNESKAi launch redesign end to end, across two
repositories, working through prepared GitHub issues one at a time.

## Read first, in full

1. `CLAUDE.md` in both repos. They are the control documents and always win.
2. `aifirst:docs/redesign/opus-implementation-prompt.md`, the bible: global
   non-negotiables (Czech-only reader, static architecture, guards, the
   110 kB gzip ceiling, the regular-magazine presentation rule, the
   human-Czech/zero-slop rule with its em-dash ban), the working method,
   Parts A-D, the acceptance checklist and the appendices.
3. `aifirst:docs/redesign/design-spec.md`, the authoritative design: token
   sheet §2, grid §3, page specs §4, rail contents §5, component specs §6,
   contrast table §7.1, OG/print §8, removal map §9, build order §10.
4. `aifirst:docs/redesign/README.md`, the brief, for context and rationale.

If an issue and the bible ever disagree, the bible plus the design spec win;
note the divergence with one comment on the issue.

## Branches

- aifirst: continue on `claude/dneskai-magazine-redesign-yw9bv1`. It already
  carries the brief, the bible and the design spec.
- quorum: create `claude/dneskai-magazine-redesign-yw9bv1` from `main`.

## Issue order

Work strictly one issue at a time. Each issue is one coherent block of small,
frequent commits; put `Closes #<n>` in its final commit. Run the smallest
relevant checks while iterating and the issue's stated gates before moving on.

aifirst, in this order (A6 and A7 land before the front page needs them):

1. [#37 A1 Theme tokens](https://github.com/lukaskourilcz/aifirst/issues/37)
2. [#38 A2 Shell, drawer, footer + social row](https://github.com/lukaskourilcz/aifirst/issues/38)
3. [#39 A3 Telemetry removal map](https://github.com/lukaskourilcz/aifirst/issues/39)
4. [#42 A6 Data layer: categories, weeks, streams, events](https://github.com/lukaskourilcz/aifirst/issues/42)
5. [#43 A7 Ad slot placeholder](https://github.com/lukaskourilcz/aifirst/issues/43)
6. [#40 A4 Front page](https://github.com/lukaskourilcz/aifirst/issues/40)
7. [#41 A5 Article page + chips](https://github.com/lukaskourilcz/aifirst/issues/41)
8. [#44 A8 Section routes + SEO](https://github.com/lukaskourilcz/aifirst/issues/44)
9. [#47 C Brand unification](https://github.com/lukaskourilcz/aifirst/issues/47):
   approved by the owner on 2026-08-09, recorded on the issue. The official
   machine-facing name is DNESKAi. One dedicated commit, revertible alone.
10. [#45 A9 Documentation truth pass](https://github.com/lukaskourilcz/aifirst/issues/45)
    (documents the unified name in the same pass)

then quorum:

11. [#89 B1 Writer categories](https://github.com/lukaskourilcz/quorum/issues/89)
12. [#90 B2 Stream contracts + fetchers](https://github.com/lukaskourilcz/quorum/issues/90)
13. [#91 B3 Events store + admin Akce tab](https://github.com/lukaskourilcz/quorum/issues/91)
14. [#92 B4 cycle.yml delivery jobs + allowlists](https://github.com/lukaskourilcz/quorum/issues/92)
15. [#93 B5 Quorum docs truth pass](https://github.com/lukaskourilcz/quorum/issues/93)

then the closing sweep:

16. [#46 A10 Cleanup sweep aifirst](https://github.com/lukaskourilcz/aifirst/issues/46)
17. [#94 B6 Cleanup sweep quorum](https://github.com/lukaskourilcz/quorum/issues/94)

## Finishing

Only when every issue above is done and the full gates are green in both repos
(`pnpm verify` + `pnpm e2e` in aifirst, `pnpm test` in quorum): merge to main,
aifirst first, quorum second; confirm the deploys; verify the merges closed the
issues; delete the work branches local and remote. Never force-push main.
Close with a report: what shipped per issue, gate evidence, the cleanup
deletion list plus anything kept but suspicious, and any open follow-ups.
