// Security headers applied to every response. The values lean
// conservative: the magazine is a static site with no authenticated
// state and no embedded outside content. The only third-party traffic
// is Vercel Speed Insights + Web Analytics, served from first-party
// Vercel hosts that are allow-listed in the CSP below. If you embed
// tweets, videos, or other analytics, loosen the CSP accordingly.

import bundleAnalyzer from "@next/bundle-analyzer";

const isDev = process.env.NODE_ENV !== "production";

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
  //   form-action 'self'
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
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Opt into React's <ViewTransition> so route changes can animate through the
  // browser's native View Transitions API — zero client JS of our own, and it
  // silently no-ops where the browser doesn't support it. The transitions
  // themselves are defined in app/globals.css and gated behind
  // prefers-reduced-motion. See components/PageTransition.tsx.
  experimental: {
    viewTransition: true,
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
