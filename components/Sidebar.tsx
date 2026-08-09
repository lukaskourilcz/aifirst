import Link from "next/link";
import { SearchPalette } from "./SearchPalette";
import { buildSearchIndex } from "@/lib/content";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { NavLink } from "./NavLink";
import { BrandLockup } from "./BrandMark";
import { MobileNav } from "./MobileNav";
import { buildRail } from "@/lib/rail";

// The rail holds the sections and search, and nothing else. It carries no
// publication status, issue date, run time, candidate count, cost or signal:
// readers get a magazine, operators get /health.
export async function Sidebar({ locale }: { locale: Locale }) {
  const d = dict(locale);
  const lp = localePrefixer(locale);
  const index = await buildSearchIndex(locale);
  const rail = buildRail(locale);

  return (
    <>
      <MobileNav locale={locale} rail={rail} index={index} />

      <aside className="sidebar" aria-label={rail.labels.primary}>
        <div className="sidebar__head">
          <Link href={lp("/")} className="sidebar__brand" aria-label={rail.labels.home}>
            <BrandLockup />
          </Link>
          <p className="sidebar__strapline">{d.meta.tagline}</p>
        </div>

        <nav className="nav-rail" aria-label={rail.labels.primary}>
          {rail.primary.map((item, i) => (
            <NavLink
              key={item.key}
              href={item.href}
              label={item.label}
              index={String(i + 1).padStart(2, "0")}
            />
          ))}

          <div className="nav-divider" aria-hidden />

          <div className="nav-rail__secondary" role="group" aria-label={rail.labels.secondary}>
            {rail.secondary.map((item) => (
              <NavLink key={item.key} href={item.href} label={item.label} />
            ))}
          </div>

          <div className="nav-divider" aria-hidden />

          <SearchPalette index={index} locale={locale} />
        </nav>
      </aside>
    </>
  );
}
