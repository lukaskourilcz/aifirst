import { NextResponse, type NextRequest } from "next/server";

// Czech is the only locale and is served unprefixed. Unprefixed paths are rewritten
// internally to /cs/* so they resolve under app/[lang]; /cs/* URLs redirect to the
// unprefixed form. Feeds, sitemap, the print view, API routes and static files are excluded.
//
// This is what keeps the move to Czech-only free of broken links. The 60 indexed unprefixed
// URLs were English and now serve the Czech edition of the same article — same URL, same
// story, different language. The 54 indexed /cs URLs redirect onto them rather than becoming
// a second copy of the same page. No /en URL was ever in the sitemap.
const HAS_EXTENSION = /\.[^/]+$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Compatibility for the former query-based localized print URL.
  if (pathname.startsWith("/articles/") && pathname.endsWith("/print") && req.nextUrl.searchParams.get("lang") === "cs") {
    const url = req.nextUrl.clone();
    url.searchParams.delete("lang");
    url.pathname = `/cs${pathname}`;
    return NextResponse.redirect(url, 308);
  }

  // Print documents are prerendered under the locale segment and are reached directly.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.endsWith("/print") ||
    HAS_EXTENSION.test(pathname)
  ) {
    return NextResponse.next();
  }

  // The /cs prefix is now redundant on reader pages. Permanent, so a search engine moves the
  // signal onto the unprefixed URL instead of holding two copies of one page.
  if (pathname === "/cs" || pathname.startsWith("/cs/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = req.nextUrl.clone();
  url.pathname = `/cs${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
