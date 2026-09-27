import Link from "next/link";
import { type Locale, localePrefixer } from "@/lib/i18n/config";
import { dict } from "@/lib/i18n/dictionaries";
import { BrandLockup } from "./BrandMark";

/**
 * Two columns that mirror the rail: the magazine's reading sections, then the
 * pages about it. RSS is the one subscription the site offers.
 */
export function Footer({ locale }: { locale: Locale }) {
  const d = dict(locale);
  const r = d.rail;
  const lp = localePrefixer(locale);

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <p className="footer-brand"><BrandLockup compact /></p>
          <p className="footer-description">{d.footer.description}</p>
        </div>
        <nav aria-label={d.footer.read} className="footer-nav">
          <p className="footer-nav__heading">{d.footer.read}</p>
          <Link href={lp("/")}>{r.today}</Link>
          <Link href={lp("/tyden")}>{r.week}</Link>
          <Link href={lp("/topics")}>{r.topics}</Link>
          <Link href={lp("/archive")}>{r.archive}</Link>
        </nav>
        <nav aria-label={d.footer.trust} className="footer-nav">
          <p className="footer-nav__heading">{d.footer.trust}</p>
          <Link href={lp("/about")}>{r.aboutMagazine}</Link>
          <Link href={lp("/sources")}>{r.sources}</Link>
          <Link href={lp("/corrections")}>{r.corrections}</Link>
          <Link href={lp("/lekce")}>{r.glossary}</Link>
          <a href={lp("/feed.xml")} type="application/atom+xml">{d.common.atomFeed} ↗</a>
        </nav>
      </div>
    </footer>
  );
}
