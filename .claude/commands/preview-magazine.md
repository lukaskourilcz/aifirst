---
description: Start or reuse the Caught Up development server for real browser review.
---

Start the magazine in dev mode for visual review.

## Steps

1. Inspect `package.json` for the actual `dev` script and check for an existing
   local server.
2. Run `pnpm dev` with `run_in_background: true`. Capture the port
   from stdout (default `3000`).
3. Report the URL to the user: `http://localhost:<port>`.
4. Report how the specific started process can be stopped; do not suggest a
   broad destructive process kill.

Do not auto-open a browser. Do not run if a dev server is already
running on the same port — instead, just print the existing URL.
