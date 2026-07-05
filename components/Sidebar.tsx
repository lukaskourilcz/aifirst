import type { ReactNode } from "react";
import Link from "next/link";
import { SearchPalette } from "./SearchPalette";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { buildSearchIndex } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

// One coherent 16px stroked icon set — hand-drawn to sit on the same
// baseline as Suisse Intl at 13/14px in the sidebar. Uses currentColor so
// the active/hover state inherits from the nav-item colour.
const S = {
  size: 16,
  props: {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  },
};

const ICONS: Record<string, ReactNode> = {
  home: (
    <svg {...S.props}>
      <path d="M2.5 7 8 2.5 13.5 7v6.5H10V10H6v3.5H2.5V7Z" />
    </svg>
  ),
  archive: (
    <svg {...S.props}>
      <rect x="2" y="3" width="12" height="3" rx="0.5" />
      <path d="M3 6v7h10V6" />
      <path d="M6.5 9h3" />
    </svg>
  ),
  tags: (
    <svg {...S.props}>
      <path d="M8.5 2.5H13v4.5L7.5 12.5 3 8l5.5-5.5Z" />
      <circle cx="10.5" cy="5" r="0.75" />
    </svg>
  ),
  sources: (
    <svg {...S.props}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M2.5 8h11M8 2.5c1.75 2 2.75 3.75 2.75 5.5S9.75 12 8 13.5c-1.75-2-2.75-3.75-2.75-5.5S6.25 4.5 8 2.5Z" />
    </svg>
  ),
  glossary: (
    <svg {...S.props}>
      <path d="M3 3h5a2 2 0 0 1 2 2v8H5a2 2 0 0 1-2-2V3Z" />
      <path d="M13 3H8a2 2 0 0 0-2 2v8" />
    </svg>
  ),
  colophon: (
    <svg {...S.props}>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5v6M5 8h6" />
    </svg>
  ),
  stats: (
    <svg {...S.props}>
      <path d="M2.5 13.5V8M6 13.5V5M9.5 13.5V9.5M13 13.5V3" />
    </svg>
  ),
  trends: (
    <svg {...S.props}>
      <path d="m2.5 11 3.5-3.5 2.5 2.5 5-5" />
      <path d="M9.5 5h4v4" />
    </svg>
  ),
  pulse: (
    <svg {...S.props}>
      <path d="M2 8.5h3l1.5-4 3 8L11 8.5h3" />
    </svg>
  ),
  health: (
    <svg {...S.props}>
      <path d="M2 8.5h2.5L6 6l2 5 2-3.5 1.5 1H14" />
    </svg>
  ),
  search: (
    <svg {...S.props}>
      <circle cx="7" cy="7" r="4" />
      <path d="m10 10 3.5 3.5" />
    </svg>
  ),
};

export async function Sidebar({ locale }: { locale: Locale }) {
  const t = dict(locale).nav;
  const home = dict(locale).home;
  const lp = localePrefixer(locale);
  const index = await buildSearchIndex(locale);

  const primary: Array<{ key: string; label: string; href: string }> = [
    { key: "home",     label: home.briefing,  href: lp("/") },
    { key: "archive",  label: t.archive,      href: lp("/archive") },
    { key: "tags",     label: t.tags,         href: lp("/tags") },
    { key: "sources",  label: t.sources,      href: lp("/sources") },
    { key: "glossary", label: t.glossary,     href: lp("/glossary") },
    { key: "colophon", label: t.colophon,     href: lp("/colophon") },
  ];

  const ops: Array<{ key: string; label: string; href: string }> = [
    { key: "stats",  label: t.stats,  href: lp("/stats") },
    { key: "trends", label: t.trends, href: lp("/trends") },
    { key: "pulse",  label: t.pulse,  href: lp("/pulse") },
    { key: "health", label: t.health, href: lp("/health") },
  ];

  return (
    <aside className="sidebar" aria-label="primary">
      <div className="sidebar__head">
        <Link href={lp("/")} className="sidebar__brand" aria-label="aifirst home">
          <span className="sidebar__brand-dot" />
          <span className="sidebar__brand-word">aifirst</span>
        </Link>
      </div>

      <nav className="nav-rail" aria-label="primary">
        {primary.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="nav-item"
            title={item.label}
            aria-label={item.label}
          >
            <span aria-hidden className="nav-item__glyph">{ICONS[item.key]}</span>
            <span className="nav-item__label">{item.label}</span>
          </Link>
        ))}
        <div className="nav-divider" aria-hidden />
        {ops.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="nav-item"
            title={item.label}
            aria-label={item.label}
          >
            <span aria-hidden className="nav-item__glyph">{ICONS[item.key]}</span>
            <span className="nav-item__label">{item.label}</span>
          </Link>
        ))}
        <div className="nav-divider" aria-hidden />
        <SearchPalette index={index} locale={locale} />
        <LanguageSwitcher locale={locale} />
      </nav>
    </aside>
  );
}
