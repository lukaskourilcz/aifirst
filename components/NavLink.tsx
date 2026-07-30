"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({
  href,
  label,
  index,
}: {
  href: string;
  label: string;
  index?: string;
}) {
  const pathname = usePathname();
  const normalizedHref = href.replace(/\/$/, "") || "/";
  const visiblePath = pathname.replace(/^\/en(?=\/|$)/, "");
  const normalizedPath = visiblePath.replace(/\/$/, "") || "/";
  const current = normalizedHref === "/"
    ? normalizedPath === "/" || normalizedPath === "/cs"
    : normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);

  return (
    <Link
      href={href}
      className={`nav-item${index ? " nav-item--indexed" : ""}${current ? " nav-item--active" : ""}`}
      title={label}
      aria-label={label}
      aria-current={current ? "page" : undefined}
    >
      {index ? <span aria-hidden className="nav-item__index">{index}</span> : null}
      <span className="nav-item__label">{label}</span>
    </Link>
  );
}
