// Security headers applied to every response. The values lean
// conservative: the magazine is a static site with no authenticated
// state and no embedded outside content. The only third-party traffic
// is Vercel Speed Insights + Web Analytics, served from first-party
// Vercel hosts that are allow-listed in the CSP below. If you embed
// tweets, videos, or other analytics, loosen the CSP accordingly.

import bundleAnalyzer from "@next/bundle-analyzer";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isDev = process.env.NODE_ENV !== "production";

// The rail's subscribe form is a native POST to the owner's email provider, so
// that provider's origin has to appear in `form-action` or the browser blocks
// the submission. It is derived from `config/subscribe.json` — the same file
// `lib/subscribe.ts` reads, with the same fail-closed rules — because a config
// file cannot import a TypeScript module. An empty, partial or malformed
// configuration leaves the directive at exactly `form-action 'self'`, which is
// what ships today: no provider is chosen, so no form renders and no extra
// origin is allowed.
function subscribeFormActionOrigin() {
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const config = JSON.parse(readFileSync(path.join(here, "config", "subscribe.json"), "utf8"));
    if (typeof config !== "object" || config === null) return null;
    const filled = (value) => typeof value === "string" && value.trim() !== "";
    if (!filled(config.provider) || !filled(config.emailField) || !filled(config.action)) return null;
    const note = config.privacyNote;
    if (typeof note !== "object" || note === null) return null;
    if (!filled(note.cs) || !filled(note.en)) return null;
    const url = new URL(config.action);
    if (url.protocol !== "https:" || url.username !== "" || url.password !== "") return null;
    return url.origin;
  } catch {
    return null;
  }
}

const subscribeOrigin = subscribeFormActionOrigin();
const formAction = subscribeOrigin ? `form-action 'self' ${subscribeOrigin}` : "form-action 'self'";

// Next's dev server (webpack HMR + React Refresh) uses `eval()` to load
// modules, so the strict prod CSP that omits 'unsafe-eval' would break
// hydration on every page in dev. Allow it only in development.
// Vercel Speed Insights / Analytics pull their collector script from
// va.vercel-scripts.com (same-origin once deployed on Vercel, but the
// external host covers preview/local), so allow it in script-src.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
  : "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com";

const securityHeaders = [
  // Tell browsers to keep using HTTPS for two years, including subdomains.
  // Safe to ship: this domain is HTTPS-only on Vercel by default.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Disallow framing the magazine to defeat clickjacking attempts.
  { key: "X-Frame-Options", value: "DENY" },
  // Stop MIME-sniffing on responses.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the path of the current document but not the URL of the
  // previous one when navigating cross-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable risky browser APIs we don't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // CSP — restrictive but compatible with the magazine's needs:
  //   default-src 'self'    — only same-origin by default
  //   img-src                — own + data: for inline SVG, blob: for clients
  //   style-src 'unsafe-inline' — Next.js injects inline styles
  //   script-src 'unsafe-inline' — inline theme-init script + Vercel insights
  //   connect-src           — own origin + Vercel Speed Insights vitals beacon
  //   form-action           — own origin, plus the configured email provider
  //   frame-ancestors 'none'
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      scriptSrc,
      "font-src 'self' data:",
      "connect-src 'self' https://vitals.vercel-insights.com",
      formAction,
      "frame-ancestors 'none'",
      "base-uri 'self'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // /articles/<slug>.md is an alias over the prerendered
  // /articles/<slug>/index.md route handler, not runtime generation: an App
  // Router segment is only dynamic when it ends in `]`, so a folder named
  // `[slug].md` would be a literal path. `afterFiles` runs after the
  // filesystem, so nothing that already resolves is shadowed, and middleware
  // passes extension paths straight through to it.
  async rewrites() {
    return {
      afterFiles: [{ source: "/articles/:slug.md", destination: "/articles/:slug/index.md" }],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// `pnpm analyze` (ANALYZE=true) emits an interactive bundle report; a
// normal build leaves the plugin inert, so nothing extra ships to users.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
