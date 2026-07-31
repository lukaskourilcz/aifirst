import { NextResponse, type NextRequest } from "next/server";

// English is the default locale and is served unprefixed. We internally
// rewrite unprefixed paths to /en/* so they resolve under app/[lang];
// Czech already carries its /cs prefix and is left alone. Feeds,
// sitemap, the print view, API routes and static files are excluded.
const HAS_EXTENSION = /\.[^/]+$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Compatibility for the former query-based localized print URL. The final
  // English and Czech print documents are now independently prerendered.
  if (pathname.startsWith("/articles/") && pathname.endsWith("/print") && req.nextUrl.searchParams.get("lang") === "cs") {
    const url = req.nextUrl.clone();
    url.pathname = `/cs${pathname}`;
    url.searchParams.delete("lang");
    return NextResponse.redirect(url, 308);
  }

  if (
    pathname === "/cs" ||
    pathname.startsWith("/cs/") ||
    pathname.startsWith("/en") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.endsWith("/print") ||
    HAS_EXTENSION.test(pathname)
  ) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
