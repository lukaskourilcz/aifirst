// Pure helpers for the Web Analytics beforeSend hook (components/SiteAnalytics.tsx).
//
// The Vercel script rebuilds the pageview URL from the router's pathname, and
// whenever that pathname differs from `location.pathname` it clears the query
// string. Czech is served unprefixed through a middleware rewrite onto `/cs/*`,
// so the router can report `/cs/...` while the browser shows `/...`, and the
// campaign parameters of the landing pageview would be lost. This puts the
// public path back and re-attaches the landing URL's `utm_*` parameters.

const UTM = /^utm_(source|medium|campaign|content|term)$/;

export function publicPath(pathname: string): string {
  return pathname.replace(/^\/cs(?=\/|$)/, "") || "/";
}

export function withLandingUtm(eventUrl: string, landingUrl: string): string {
  let url: URL;
  let landing: URL;
  try {
    url = new URL(eventUrl);
    landing = new URL(landingUrl);
  } catch {
    return eventUrl;
  }
  url.pathname = publicPath(url.pathname);
  // Only the page the reader actually landed on carries its campaign.
  if (publicPath(landing.pathname) === url.pathname) {
    for (const [key, value] of landing.searchParams) {
      if (UTM.test(key) && !url.searchParams.has(key)) url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

// Vercel's UTM dimensions (utmSource and friends) need Web Analytics Plus or
// Enterprise; on Pro the API answers 402. A custom event is included in Pro,
// so a campaign landing is also recorded as one `campaign` event whose two
// properties can be grouped (`eventData/source`, `eventData/campaign`).
// Two properties because that is the Pro limit per event.

const TOKEN = /^[a-z0-9][a-z0-9._-]{0,39}$/;

function token(value: string | null): string | null {
  const v = value?.trim().toLowerCase() ?? "";
  return TOKEN.test(v) ? v : null;
}

export type CampaignEvent = { source: string; campaign: string };

/** `{ source: "threads/post", campaign: "edition" }` for a campaign landing URL, else null. */
export function campaignFromUrl(href: string): CampaignEvent | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const source = token(url.searchParams.get("utm_source"));
  if (!source) return null;
  const medium = token(url.searchParams.get("utm_medium"));
  return {
    source: medium ? `${source}/${medium}` : source,
    campaign: token(url.searchParams.get("utm_campaign")) ?? "none",
  };
}
