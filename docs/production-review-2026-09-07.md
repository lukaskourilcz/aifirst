# DNESKAi production review · 7 September 2026

Status: code/build checks passed; fresh production delivery and browser acceptance remain open.
Issues #71 and #72; PR #73. Shared backend checklist:
[BoardlessAI review](https://github.com/lukaskourilcz/quorum/blob/claude/production-audit-2026-09-07/docs/production-review-2026-09-07.md).

## Changes

- Both empty placements now promote MMA FILES with local desktop/mobile creatives, HTTPS-only destinations and strict asset paths.
- The mobile creative is selected through 760px and the rail/link cannot exceed their container width.
- The 2026-08-08 edition has mismatched claims and sources. A separate editorial hold removes it from listings, feeds and recommendations and serves a noindex correction notice at the existing URL. Its original delivery bytes and package hash are unchanged. This is a withdrawal, not a factual correction of its claims.
- Deleted MANUAL STEPS.md, a redundant checklist that contradicted NEEDED.md about credentials. Corrected the stale blank-body warning: before the hold, the current build rendered 5,351 body characters. Current writer code already unwraps old JSX string output.

## Checks

- [x] 226 tests; content/frontmatter and delivery package validation.
- [x] Next production build, lint and TypeScript.
- [x] All 31 page entries fit the 110 kB gzip budget; largest 103.7 kB.
- [x] Historical source content retained; held edition excluded from normal listings.
- [ ] Deploy final main commit and verify both reciprocal links on actual production domains.
- [ ] Run one new BoardlessAI cu-day delivery: Czech body, one valid hero and thumbnail, attribution, matching package hash, admin receipt. Same-package replay must be a no-op; changed same-date package must fail.
- [ ] Review 360/390/768/1024/1440px home, article, archive and topic routes; keyboard navigation, 200% text zoom, source disclosure, menus, sticky reading progress and no horizontal page overflow.
- [ ] Finish the Vercel credential cleanup in NEEDED.md. No provider key belongs in this static consumer.
- [ ] Keep the disputed historical edition withdrawn until its claims can be checked against actual sources. Resolve #72 with an explicit editorial record.

The local preview wrapper could not run this Next architecture (it forwarded Vite flags). Browser viewport acceptance is unverified. Vercel returned no accessible teams, so deployed variables could not be confirmed. Neither limitation is counted as a passing check.

## Mobbin recommendations

[Ghost news theme](https://mobbin.com/screens/756cbee5-cff7-4fe2-9b56-0c6d4e5a6baf): preserve one clear lead, supporting cards and a compact latest-news column; collapse the column below the story on tablet and mobile. Do not add an empty sidebar to fill space.

[Perplexity Discover](https://mobbin.com/screens/423c2053-3a7f-4e84-ac8a-0723f1790a45): keep publication time and source count near the title. DNESKAi already has source disclosure, reading progress and related editions, so improve their hierarchy rather than duplicating them. Evidence warnings must be visible before a reader encounters disputed claims.
