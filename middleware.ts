import { NextResponse, type NextRequest } from "next/server";

// Czech is the default locale and is served unprefixed. We internally
// rewrite unprefixed paths to /cs/* so they resolve under app/[lang];
// English already carries its /en prefix and is left alone. Feeds,
// sitemap, the print view, API routes and static files are excluded.
const HAS_EXTENSION = /\.[^/]+$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname === "/en" ||
    pathname.startsWith("/en/") ||
    pathname.startsWith("/cs") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.endsWith("/print") ||
    HAS_EXTENSION.test(pathname)
  ) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/cs${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
