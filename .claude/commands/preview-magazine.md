---
description: Start the Next.js dev server in the background and report the URL.
---

Start the magazine in dev mode for visual review.

## Steps

1. Check `package.json` exists and has a `dev` script. If not, point at
   `/scaffold-magazine` and stop.
2. Run `pnpm dev` with `run_in_background: true`. Capture the port
   from stdout (default `3000`).
3. Report the URL to the user: `http://localhost:<port>`.
4. Remind: this server keeps running until killed. Use `pkill -f
   "next dev"` to stop it.

Do not auto-open a browser. Do not run if a dev server is already
running on the same port — instead, just print the existing URL.
