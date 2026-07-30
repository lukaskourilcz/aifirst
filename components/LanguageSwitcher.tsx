"use client";

import { usePathname } from "next/navigation";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

// Links to the current page in the other language. Robust to whether the
// pathname is the visible (/archive, /cs/archive) or rewritten (/en/archive)
// form by stripping any leading locale segment first.
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/";
  const other: Locale = locale === "en" ? "cs" : "en";
  const bare = pathname.replace(/^\/(cs|en)(?=\/|$)/, "") || "/";
  const href = localePath(other, bare);

  return (
    <a
      href={href}
      hrefLang={other}
      aria-label={`switch language to ${dict(other).meta.name}`}
      title={dict(locale).meta.switchTo}
      className="nav-item"
    >
      <span aria-hidden className="nav-item__glyph">⇄</span>
      <span className="nav-item__label">{dict(locale).meta.switchTo}</span>
    </a>
  );
}
