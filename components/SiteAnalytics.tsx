"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";
import { track } from "@vercel/analytics";
import { campaignFromUrl, withLandingUtm } from "@/lib/analytics";

type VaWindow = Window & { va?: (...args: unknown[]) => void; vaq?: unknown[][] };

/**
 * Vercel Web Analytics with two additions (lib/analytics.ts): campaign
 * parameters survive the `/cs` rewrite, and a campaign landing is also sent
 * as one `campaign` event, because the UTM breakdown itself is a paid add-on
 * on the Pro plan. No cookies or identifiers.
 */
export function SiteAnalytics() {
  useEffect(() => {
    const campaign = campaignFromUrl(window.location.href);
    if (!campaign) return;
    // The same queue the SDK creates, so the event survives the script loading later.
    const w = window as VaWindow;
    w.va = w.va ?? ((...args: unknown[]) => { (w.vaq = w.vaq ?? []).push(args); });
    track("campaign", campaign);
  }, []);

  return (
    <Analytics
      beforeSend={(event) => ({ ...event, url: withLandingUtm(event.url, window.location.href) })}
    />
  );
}
