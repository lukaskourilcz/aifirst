"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale, localePath } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

// Links to the current page in the other language. Robust to whether the
// pathname is the visible (/archive, /en/archive) or rewritten (/cs/archive)
// form by stripping any leading locale segment first.
export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || "/";
  const other: Locale = locale === "cs" ? "en" : "cs";
  const bare = pathname.replace(/^\/(cs|en)(?=\/|$)/, "") || "/";
  const href = localePath(other, bare);

  return (
    <Link
      href={href}
      hrefLang={other}
      aria-label={`switch language to ${dict(other).meta.name}`}
      className="label"
      style={{
        color: "var(--ink-muted)",
        border: "1px solid var(--hairline)",
        padding: "6px 10px",
        fontFamily: "var(--font-display)",
        borderBottom: "1px solid var(--hairline)",
        whiteSpace: "nowrap",
      }}
    >
      {dict(locale).meta.switchTo}
    </Link>
  );
}
