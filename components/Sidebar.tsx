import Link from "next/link";
import { SearchPalette } from "./SearchPalette";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SidebarToggle } from "./SidebarToggle";
import { buildSearchIndex, listArticles } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

const GLYPHS: Record<string, string> = {
  home: "◉",
  archive: "▤",
  tags: "#",
  sources: "◇",
  glossary: "✦",
  colophon: "❀",
  stats: "▦",
  trends: "↑",
  health: "♥",
  search: "⌕",
};

export async function Sidebar({ locale }: { locale: Locale }) {
  const t = dict(locale).nav;
  const home = dict(locale).home;
  const lp = localePrefixer(locale);
  const [index, all] = await Promise.all([
    buildSearchIndex(locale),
    listArticles(locale),
  ]);
  const latest = all[0];

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
    { key: "health", label: t.health, href: lp("/health") },
  ];

  return (
    <aside className="sidebar" aria-label="primary">
      <div className="sidebar__head">
        <Link href={lp("/")} className="sidebar__brand" aria-label="aifirst home">
          <span className="sidebar__brand-dot" />
          <span className="sidebar__brand-word">aifirst</span>
        </Link>
        <SidebarToggle />
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
            <span aria-hidden className="nav-item__glyph">{GLYPHS[item.key]}</span>
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
            <span aria-hidden className="nav-item__glyph">{GLYPHS[item.key]}</span>
            <span className="nav-item__label">{item.label}</span>
          </Link>
        ))}
        <div className="nav-divider" aria-hidden />
        <SearchPalette index={index} locale={locale} />
        <LanguageSwitcher locale={locale} />
      </nav>

      <div className="sidebar__card" style={{ marginTop: "auto" }}>
        <p className="sidebar__heading" style={{ marginBottom: 8 }}>
          Latest
        </p>
        <p className="sidebar__card-title">
          {latest?.title ?? "Today’s issue is being written."}
        </p>
        <p className="sidebar__card-body">
          {latest?.date ?? "—"}
        </p>
        {latest && (
          <Link
            href={lp(`/articles/${latest.slug}`)}
            className="cta"
            style={{ marginTop: 12 }}
          >
            Read →
          </Link>
        )}
      </div>
    </aside>
  );
}
