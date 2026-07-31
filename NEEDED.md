# NEEDED — operator setup for Caught Up

Caught Up is now a static reader and bounded BoardlessAI delivery consumer. It
builds with no editorial-provider credential. New editions arrive from the
`boardlessai-delivery` GitHub App configured in Quorum; aifirst's daily workflow
is only the missed-publication sentinel. Each remaining task carries an
importance score `[imp:N]` (1–5, 5 = highest) and an owner marker.

The checklist includes operator updates recorded through 2026-07-28.

## Required before the first BoardlessAI delivery

- [x] **Set the canonical URL in both deploy and generation environments** — GH Actions variable set + Vercel env vars pasted 2026-07-28. Default: `https://aifirst-zpx8.vercel.app`. Update both when a custom domain lands. `[imp:5]` `[owner:me]` `[time:1h]` `[kind:deploy]`
- [x] **Confirm Vercel deploys `main`** — env vars in, `main` confirmed as production branch (git-main alias + latest READY prod deploy). Trigger a redeploy to pick up new env vars. `[imp:5]` `[owner:me]` `[time:1h]` `[kind:deploy]`
- [ ] **Install `boardlessai-delivery` on aifirst only** — grant repository contents read/write and no broader permission; store its App ID and private key only in Quorum Actions secrets. `[imp:5]` `[owner:me]` `[time:30m]` `[kind:setup]`
- [ ] **Review the first three delivered editions** — verify package hash, bilingual copy, board context, Vercel build and live route before treating unattended delivery as proven. `[imp:5]` `[owner:me]` `[time:60m]` `[kind:content]`
- [ ] **Remove obsolete aifirst generation secrets and variables** — the workflows no longer read Anthropic, source, image, promotion, heartbeat or OwnDashboard reporting credentials. Rotate the previously pasted provider keys from their owning systems. `[imp:4]` `[owner:me]` `[time:20m]` `[kind:setup]`

## Portfolio presence (2026-07-27)

The portfolio entry was renamed from "aifirst" to Caught Up in both locales.
Its animated thumbnail reflects the retired light reader and should be
re-recorded for the 2026-07-30 instrument-panel redesign.

- [ ] **Confirm the public name** — the repository is `aifirst`, the product is Caught Up, and the portfolio now says Caught Up. Rename the GitHub repository and the Vercel project too if you want them consistent, or leave the repository name as the internal one. `[imp:2]` `[owner:me]` `[time:30m]` `[kind:decision]`
- [ ] **Re-record the thumbnail for the instrument-panel redesign** — the 2026-07-30 dark reader is a notable visual change. The procedure is in `.claude/skills/preview-video/SKILL.md`; the output belongs in `nxt-portfolio/public/previews/aifirst/`. `[imp:2]` `[owner:ai]` `[time:30m]` `[kind:content]`

## Optional enhancements

- [ ] **Refresh semantic related issues manually if wanted** — run `pnpm embed:refresh` with `JINA_API_KEY`; without it, related issues continue to use tag overlap. This is reader enrichment, not an edition fallback. `[imp:2]` `[owner:me]` `[time:20m]` `[kind:setup]`
- [ ] **Configure a build-time GitHub health token in Vercel** — because the repository is private, add a read-only `GITHUB_TOKEN` only if `/health` should include workflow history. The public JSON health endpoint never exposes it. `[imp:2]` `[owner:me]` `[time:1h]` `[kind:deploy]`

## Already handled in the repository

- GitHub’s default branch is `main`, and local `main` contains the product,
  operations and design work.
- Generated-media production remains optional and provider-neutral. Current
  provider, pricing, rights, privacy, watermarking, and output-access research
  is mandatory before a generator is selected.
- The reading progress bar is native and adds no Motion dependency.
- The only scheduled workflow is the daily publication sentinel; it cannot
  write content or call an editorial provider.
- The public reader remains static and needs no database, migration, public
  authentication, OwnDashboard connection, or runtime AI key.
- The repository, package name and internal `aifirst` identifiers intentionally
  remain unchanged for compatibility; the reader-facing brand is Caught Up.

## Developer tooling

- [ ] **Install and initialize RTK (`rtk-ai/rtk`)** — RTK could not be set up from the Claude Code web session because its GitHub download host is outside the session's network allowlist (`github.com/rtk-ai/rtk` and its release binaries return HTTP 403). Set it up locally at home with the commands below, then enable it for this repository following `rtk --help` / the RTK docs (the exact per-repo command isn't documented here because the tool wouldn't install in the sandbox). `[imp:2]` `[owner:me]` `[time:20m]` `[kind:setup]`
- [x] **Enable Vercel Web Analytics for this project** — enabled 2026-07-28, confirmed ON via Vercel MCP. `[imp:2]` `[owner:me]` `[time:15m]` `[kind:setup]`
- [ ] **Report the sentinel cron to OwnDashboard if wanted** — add the applicable cron-reporting secrets only after a receiver exists. `[imp:2]` `[owner:me]` `[time:10m]` `[kind:setup]`

```sh
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
rtk init --global
```
