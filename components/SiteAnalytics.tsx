"use client";

import { Analytics } from "@vercel/analytics/next";
import { withLandingUtm } from "@/lib/analytics";

/**
 * Vercel Web Analytics with one correction: campaign parameters survive the
 * `/cs` rewrite (lib/analytics.ts). Pageviews only; no custom events, cookies
 * or identifiers.
 */
export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => ({ ...event, url: withLandingUtm(event.url, window.location.href) })}
    />
  );
}
