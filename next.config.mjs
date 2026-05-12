// Security headers applied to every response. The values lean
// conservative because the magazine is a static site with no
// authenticated state, no third-party scripts, and no embedded
// content from outside origins. If you start embedding tweets,
// videos, or analytics, loosen the CSP accordingly.

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
  //   script-src 'unsafe-inline' — the theme-init script is inline
  //   connect-src 'self'    — no XHR to other origins from the site
  //   form-action 'self'
  //   frame-ancestors 'none'
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self'",
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
