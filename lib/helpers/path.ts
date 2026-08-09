// Czech serves at the root, but the prerendered page behind it is the `/cs`
// entry of the `[lang]` tree, so the client router reports `/cs/weekly` while
// the address bar shows `/weekly`. Nav links are built from the visible paths,
// so compare on the visible form: strip the locale segment from both.
export function visiblePath(pathname: string): string {
  const withoutLocale = pathname.replace(/^\/(cs|en)(?=\/|$)/, "");
  return withoutLocale.replace(/\/$/, "") || "/";
}

export function isCurrentPath(pathname: string, href: string): boolean {
  const target = href.replace(/\/$/, "") || "/";
  const here = visiblePath(pathname);
  if (target === "/") return here === "/";
  return here === target || here.startsWith(`${target}/`);
}
