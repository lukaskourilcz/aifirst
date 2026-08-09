"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isCurrentPath } from "@/lib/helpers/path";

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
  const current = isCurrentPath(pathname, href);

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
