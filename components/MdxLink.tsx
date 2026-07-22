import Link from "next/link";
import type { ReactNode } from "react";

export function MdxLink({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:\/\//.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  }
  return <Link href={href}>{children}</Link>;
}
