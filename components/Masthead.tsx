import Link from "next/link";
import { Fragment } from "react";
import { SearchPalette } from "./SearchPalette";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { buildSearchIndex } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";

function today(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}.${String(d.getUTCDate()).padStart(2, "0")}`;
}

export async function Masthead({ locale }: { locale: Locale }) {
  const index = await buildSearchIndex(locale);
  const t = dict(locale).nav;
  const lp = localePrefixer(locale);

  // Pipe-separated primary nav, broadsheet style. Sources of section labels
  // tracked in the dictionary so the order also reflects in the footer.
  const primary: Array<{ label: string; href: string }> = [
    { label: t.archive, href: lp("/archive") },
    { label: t.tags, href: lp("/tags") },
    { label: t.sources, href: lp("/sources") },
    { label: t.glossary, href: lp("/glossary") },
    { label: t.colophon, href: lp("/colophon") },
  ];

  return (
    <header>
      {/* Utility bar — sticky top with date + actions */}
      <div className="utility-bar">
        <div className="container utility-bar__inner">
          <div className="utility-bar__links">
            <span aria-label="issue date">{today()}</span>
          </div>
          <div className="utility-bar__actions">
            <SearchPalette index={index} locale={locale} />
            <LanguageSwitcher locale={locale} />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Wordmark — centred broadsheet masthead */}
      <div className="masthead">
        <Link href={lp("/")} className="masthead__wordmark" aria-label="aifirst home">
          AIFIRST<span className="masthead__dot">.</span>
        </Link>
        <p className="masthead__tagline">{dict(locale).meta.tagline}</p>
      </div>

      {/* Primary nav — pipe-separated category links */}
      <nav aria-label="primary" className="primary-nav">
        <div className="container primary-nav__inner">
          {primary.map((item, i) => (
            <Fragment key={item.href}>
              {i > 0 && (
                <span aria-hidden className="primary-nav__pipe">
                  |
                </span>
              )}
              <Link href={item.href}>{item.label}</Link>
            </Fragment>
          ))}
        </div>
      </nav>
    </header>
  );
}
