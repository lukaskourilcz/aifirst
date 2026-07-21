"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
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
      className={`nav-item${current ? " nav-item--active" : ""}`}
      title={label}
      aria-label={label}
      aria-current={current ? "page" : undefined}
    >
      <span aria-hidden className="nav-item__glyph">{icon}</span>
      <span className="nav-item__label">{label}</span>
    </Link>
  );
}
