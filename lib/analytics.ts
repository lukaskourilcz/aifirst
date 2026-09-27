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
