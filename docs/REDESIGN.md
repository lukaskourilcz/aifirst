# Caught Up instrument-panel redesign

Status: canonical reader direction, 2026-07-30

## Token set

The reader uses one dark theme. `#0c0d10` is the page canvas, `#14161a` the
panel surface, and `#101216` the sunken media surface. One-pixel rules use
`#23262c` and `#2c3037`. Primary text is `#eceef2`; reading text is `#c8ccd4`;
metadata stops at `#8d949f`.

Blueprint blue uses `#4d7cff` for fills and `#6f95ff` for linked text. Healthy
status uses `#00bc7d`, review warnings use `#e8a33d`, and corrections use
`#e5484d`.

Production components consume the semantic variables in `app/globals.css`.
`lib/og-theme.ts` carries matching literal values for static Open Graph output.

## Type roles

- Space Grotesk: display hierarchy, wordmark, navigation, controls, and cards.
- IBM Plex Mono: dates, run values, source IDs, labels, tags, captions, and
  measured data.
- Source Serif 4: article prose, deks, definitions, and descriptive card copy.

All three families load through `next/font`. The redesign adds no runtime font
request or client dependency.

## Layout rules

The desktop shell uses a 244px publication rail inside a 1360px container.
Below 960px, the rail becomes a horizontal top navigation and hides its status
record. Data strips collapse adjacent one-pixel borders. Panels and controls use
zero radius. Today and Issue keep a 35em reading column beside a 272–344px
Briefs and Watchlist rail when space permits.

Real delivered hero media uses a 21:9 crop. Archive/weekly uses 4:3 and related
issues use 3:2. Topics remain text-first; no Topic-cover production path lives
in Caught Up. Print remains black on white.

## Deliberate deviations from the handoff

- The interface never labels stale publication data as live. The sidebar shows
  the real reader-safe freshness state.
- Legacy issues show unavailable candidates, review, run time, and cost instead
  of demo values or zeros.
- Missing media removes the media slot. Caught Up does not render synthetic
  image wells or aspect-ratio placeholders as editorial content.
- The existing completion, source, provenance, locale, route, feed, JSON, and
  print contracts remain intact.
